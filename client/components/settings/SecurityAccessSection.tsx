"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { SectionFrame } from "./SectionFrame";
import { SimpleToggle } from "./shared";
import { securitySettingsSchema, type SecuritySettingsFormValues } from "@/lib/validators/settings";
import { useSettingsSecurity, useUpdateSettingsSecurity } from "@/hooks/useSettingsSecurity";

export default function SecurityAccessSection() {
  const { data, isLoading } = useSettingsSecurity();
  const updateMutation = useUpdateSettingsSecurity();
  const form = useForm<SecuritySettingsFormValues>({ resolver: zodResolver(securitySettingsSchema), defaultValues: data || undefined });

  const save = form.handleSubmit(async (values) => {
    try {
      await updateMutation.mutateAsync(values);
      toast.success("Security settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save security settings");
    }
  });

  return (
    <SectionFrame title="Security & Access" description="Control session timeout, PIN login, TOTP, IP allowlists, and password policy." actions={<Button onClick={save} loading={updateMutation.isPending}>Save section</Button>}>
      {isLoading ? (
        <div className="h-56 animate-pulse rounded-lg bg-[var(--color-bg-tertiary)]" />
      ) : (
        <form className="space-y-6" onSubmit={save}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Session timeout (minutes)" type="number" min="5" {...form.register("session_timeout", { valueAsNumber: true })} />
            <Input label="Audit log retention (days)" type="number" min="1" {...form.register("audit_log_retention_days", { valueAsNumber: true })} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <SimpleToggle label="PIN login enabled" checked={Boolean(form.watch("pin_login_enabled"))} onChange={(value) => form.setValue("pin_login_enabled", value, { shouldDirty: true })} />
            <SimpleToggle label="TOTP enabled" checked={Boolean(form.watch("totp_enabled"))} onChange={(value) => form.setValue("totp_enabled", value, { shouldDirty: true })} />
          </div>
          <Input label="IP allowlist" placeholder="10.0.0.1, 10.0.0.2" {...form.register("ip_allowlist.0" as never)} />
          <div className="grid gap-4 md:grid-cols-3">
            <Input label="Min password length" type="number" min="6" {...form.register("password_policy.min_length", { valueAsNumber: true })} />
            <SimpleToggle label="Require uppercase" checked={Boolean(form.watch("password_policy.uppercase"))} onChange={(value) => form.setValue("password_policy.uppercase", value, { shouldDirty: true })} />
            <SimpleToggle label="Require symbol" checked={Boolean(form.watch("password_policy.symbol"))} onChange={(value) => form.setValue("password_policy.symbol", value, { shouldDirty: true })} />
          </div>
        </form>
      )}
    </SectionFrame>
  );
}
