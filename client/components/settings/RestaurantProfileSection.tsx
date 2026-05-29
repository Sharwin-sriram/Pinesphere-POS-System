"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { SectionFrame, UnsavedChangesBar } from "./SectionFrame";
import { WeekdayHoursEditor } from "./shared";
import { restaurantProfileSchema, type RestaurantProfileFormValues } from "@/lib/validators/settings";
import { useSettingsRestaurant, useUpdateSettingsRestaurant, useUploadSettingsRestaurantLogo } from "@/hooks/useSettingsRestaurant";

const TIMEZONE_OPTIONS = ["UTC", "Asia/Kolkata", "Asia/Dubai", "Europe/London", "America/New_York"];
const CURRENCY_OPTIONS = ["USD", "INR", "AED", "EUR", "GBP"];
const LANGUAGE_OPTIONS = ["en", "en-IN", "ar", "fr", "es"];
type NormalizedOperatingHour = { day: number; closed: boolean; open: string | null; close: string | null };
const FALLBACK_PROFILE_DEFAULTS: RestaurantProfileFormValues = {
  name: "Restaurant",
  address: "",
  phone: "",
  email: "",
  tax_id: "",
  default_timezone: "UTC",
  currency: "USD",
  language: "en",
  locale: "en-US",
  operating_hours: Array.from({ length: 7 }, (_, day) => ({ day, closed: false, open: "09:00", close: "22:00" })),
  table_count: 0,
  floor_capacity: 0,
};

function normalizeHours(hours: Array<{ day: number; closed: boolean; open?: string | null; close?: string | null }>): NormalizedOperatingHour[] {
  return Array.from({ length: 7 }, (_, day) => {
    const existing = hours.find((item) => item.day === day);
    return existing
      ? { ...existing, open: existing.open ?? "09:00", close: existing.close ?? "22:00" }
      : { day, closed: false, open: "09:00", close: "22:00" };
  });
}

export default function RestaurantProfileSection() {
  const { data, error, isError, isFetching, isLoading, refetch } = useSettingsRestaurant();
  const updateMutation = useUpdateSettingsRestaurant();
  const uploadMutation = useUploadSettingsRestaurantLogo();
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const defaults = useMemo<RestaurantProfileFormValues>(() => {
    if (!data) return FALLBACK_PROFILE_DEFAULTS;
    return restaurantProfileSchema.parse({
      name: data.name || "",
      address: data.address || "",
      phone: data.phone || "",
      email: data.email || "",
      tax_id: data.tax_id || "",
      default_timezone: data.default_timezone || "UTC",
      currency: data.currency || "USD",
      language: data.language || "en",
      locale: data.locale || "en-US",
      operating_hours: normalizeHours(data.operating_hours || []),
      table_count: Number(data.table_count || 0),
      floor_capacity: Number(data.floor_capacity || 0),
    });
  }, [data]);

  const form = useForm<RestaurantProfileFormValues>({
    resolver: zodResolver(restaurantProfileSchema),
    values: defaults,
  });

  useEffect(() => {
    if (data && !form.formState.isDirty) {
      form.reset(defaults);
    }
  }, [data, defaults, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const payload = {
        ...values,
        operating_hours: values.operating_hours,
      };
      const updated = await updateMutation.mutateAsync(payload);
      if (logoFile && updated?.id) {
        await uploadMutation.mutateAsync({ restaurantId: updated.id, file: logoFile });
        setLogoFile(null);
      }
      toast.success("Restaurant profile saved");
      form.reset(values);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save restaurant profile");
    }
  });

  return (
    <SectionFrame
      title="Restaurant Profile"
      description="Manage the core restaurant identity and operating defaults."
      actions={<Button variant="secondary" onClick={() => form.reset(defaults)}>Reset</Button>}
    >
      {!data && !isError && (isLoading || isFetching) ? (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
          Loading saved settings from the API...
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Settings could not be loaded from the API. Showing a temporary form so the page does not stay stuck.
              {error instanceof Error ? ` ${error.message}` : ""}
            </p>
            <Button type="button" variant="secondary" size="sm" onClick={() => refetch()} loading={isFetching}>
              Retry
            </Button>
          </div>
        </div>
      ) : null}

      {form.formState.isDirty ? <UnsavedChangesBar onSave={onSubmit} onDiscard={() => form.reset(defaults)} saving={updateMutation.isPending || uploadMutation.isPending} /> : null}

      <form className="space-y-6" onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Restaurant name" {...form.register("name")} error={form.formState.errors.name?.message} />
          <Input label="Tax ID / business registration" {...form.register("tax_id")} />
          <Input label="Phone" {...form.register("phone")} />
          <Input label="Email" type="email" {...form.register("email")} />
          <Input label="Address" className="md:col-span-2" {...form.register("address")} />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Controller
            control={form.control}
            name="default_timezone"
            render={({ field }) => (
              <Select label="Timezone" {...field}>
                {TIMEZONE_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </Select>
            )}
          />
          <Controller
            control={form.control}
            name="currency"
            render={({ field }) => (
              <Select label="Currency" {...field}>
                {CURRENCY_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </Select>
            )}
          />
          <Controller
            control={form.control}
            name="language"
            render={({ field }) => (
              <Select label="Language / locale" {...field}>
                {LANGUAGE_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </Select>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Table count" type="number" min="0" {...form.register("table_count", { valueAsNumber: true })} />
          <Input label="Floor capacity" type="number" min="0" {...form.register("floor_capacity", { valueAsNumber: true })} />
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Operating hours</h3>
            <p className="text-sm text-[var(--color-text-secondary)]">Configure hours for every day of the week.</p>
          </div>
          <Controller
            control={form.control}
            name="operating_hours"
            render={({ field }) => <WeekdayHoursEditor value={normalizeHours(field.value)} onChange={field.onChange} />}
          />
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Logo upload</h3>
            <p className="text-sm text-[var(--color-text-secondary)]">Upload a new restaurant logo. The file is sent separately so profile edits stay lightweight.</p>
          </div>
          <Input type="file" accept="image/*" onChange={(event) => setLogoFile(event.target.files?.[0] || null)} />
          {data?.logo ? <p className="text-xs text-[var(--color-text-muted)]">Current logo: {data.logo}</p> : null}
        </div>

        <div className="flex justify-end gap-3 border-t border-[var(--color-border)] pt-4">
          <Button type="button" variant="secondary" onClick={() => form.reset(defaults)}>Discard</Button>
          <Button type="submit" loading={updateMutation.isPending || uploadMutation.isPending}>Save changes</Button>
        </div>
      </form>
    </SectionFrame>
  );
}
