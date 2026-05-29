"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { SectionFrame } from "./SectionFrame";
import { SimpleToggle } from "./shared";
import { notificationSettingsSchema, type NotificationSettingsFormValues } from "@/lib/validators/settings";
import { useSettingsNotifications, useUpdateSettingsNotifications } from "@/hooks/useSettingsNotifications";

export default function NotificationsAlertsSection() {
  const { data, isLoading } = useSettingsNotifications();
  const updateMutation = useUpdateSettingsNotifications();
  const form = useForm<NotificationSettingsFormValues>({ resolver: zodResolver(notificationSettingsSchema), defaultValues: data || undefined });

  const save = form.handleSubmit(async (values) => {
    try {
      await updateMutation.mutateAsync(values);
      toast.success("Notification settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save notification settings");
    }
  });

  return (
    <SectionFrame title="Notifications & Alerts" description="Tune email, SMS, escalation, and summary report preferences." actions={<Button onClick={save} loading={updateMutation.isPending}>Save section</Button>}>
      {isLoading ? (
        <div className="h-56 animate-pulse rounded-lg bg-[var(--color-bg-tertiary)]" />
      ) : (
        <form className="space-y-6" onSubmit={save}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3 rounded-lg border border-[var(--color-border)] p-4">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">Email alerts</p>
              <SimpleToggle label="New order" checked={Boolean(form.watch("email.new_order"))} onChange={(value) => form.setValue("email.new_order", value, { shouldDirty: true })} />
              <SimpleToggle label="Low inventory" checked={Boolean(form.watch("email.low_inventory"))} onChange={(value) => form.setValue("email.low_inventory", value, { shouldDirty: true })} />
              <SimpleToggle label="Shift reminder" checked={Boolean(form.watch("email.shift_reminder"))} onChange={(value) => form.setValue("email.shift_reminder", value, { shouldDirty: true })} />
              <SimpleToggle label="Daily report" checked={Boolean(form.watch("email.daily_report"))} onChange={(value) => form.setValue("email.daily_report", value, { shouldDirty: true })} />
            </div>
            <div className="space-y-3 rounded-lg border border-[var(--color-border)] p-4">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">SMS alerts</p>
              <SimpleToggle label="New order" checked={Boolean(form.watch("sms.new_order"))} onChange={(value) => form.setValue("sms.new_order", value, { shouldDirty: true })} />
              <SimpleToggle label="Low inventory" checked={Boolean(form.watch("sms.low_inventory"))} onChange={(value) => form.setValue("sms.low_inventory", value, { shouldDirty: true })} />
              <SimpleToggle label="Shift reminder" checked={Boolean(form.watch("sms.shift_reminder"))} onChange={(value) => form.setValue("sms.shift_reminder", value, { shouldDirty: true })} />
              <SimpleToggle label="Daily report" checked={Boolean(form.watch("sms.daily_report"))} onChange={(value) => form.setValue("sms.daily_report", value, { shouldDirty: true })} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="SMS phone number" {...form.register("sms_phone")} />
            <Input label="Escalation after (minutes)" type="number" min="0" {...form.register("escalation_minutes", { valueAsNumber: true })} />
          </div>
          <Input label="Summary report schedule" placeholder="0 8 * * *" {...form.register("summary_schedule")} />
        </form>
      )}
    </SectionFrame>
  );
}
