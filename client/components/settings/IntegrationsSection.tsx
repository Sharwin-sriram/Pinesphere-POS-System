"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Plug, Unplug } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import { SectionFrame } from "./SectionFrame";
import { integrationSettingsSchema, type IntegrationSettingsFormValues } from "@/lib/validators/settings";
import { useConnectSettingsIntegrationProvider, useDisconnectSettingsIntegrationProvider, useSettingsIntegrations, useUpdateSettingsIntegrationProvider } from "@/hooks/useSettingsIntegrations";

const PROVIDERS = ["stripe", "square", "doordash", "ubereats", "grubhub", "quickbooks", "xero", "opentable", "resy", "loyalty", "webhooks"];

export default function IntegrationsSection() {
  const { data, isLoading } = useSettingsIntegrations();
  const updateMutation = useUpdateSettingsIntegrationProvider();
  const connectMutation = useConnectSettingsIntegrationProvider();
  const disconnectMutation = useDisconnectSettingsIntegrationProvider();
  const [provider, setProvider] = useState("stripe");
  const form = useForm<IntegrationSettingsFormValues>({ resolver: zodResolver(integrationSettingsSchema), defaultValues: data || {} });

  const save = form.handleSubmit(async (values) => {
    try {
      await updateMutation.mutateAsync({ provider, payload: values[provider as keyof IntegrationSettingsFormValues] || {} });
      toast.success("Integration saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save integration");
    }
  });

  const connect = async () => {
    try {
      await connectMutation.mutateAsync(provider);
      toast.success("Integration connected");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Connection failed");
    }
  };

  const disconnect = async () => {
    try {
      await disconnectMutation.mutateAsync(provider);
      toast.success("Integration disconnected");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Disconnect failed");
    }
  };

  return (
    <SectionFrame title="Integrations" description="Connect POS, delivery, accounting, reservation, loyalty, and webhook providers." actions={<Button onClick={save} loading={updateMutation.isPending}>Save section</Button>}>
      {isLoading ? (
        <div className="h-56 animate-pulse rounded-lg bg-[var(--color-bg-tertiary)]" />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {PROVIDERS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setProvider(item)}
                className={`rounded-full border px-3 py-1.5 text-sm ${provider === item ? "border-[var(--color-accent)] bg-[var(--color-accent-subtle)] text-[var(--color-accent)]" : "border-[var(--color-border)] text-[var(--color-text-secondary)]"}`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="rounded-lg border border-[var(--color-border)] p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-[var(--color-text-primary)]">{provider}</p>
                <p className="text-xs text-[var(--color-text-muted)]">Provider settings and connect actions</p>
              </div>
              <Badge variant="default">{Boolean((data as Record<string, { connected?: boolean }>)?.[provider]?.connected) ? "Connected" : "Disconnected"}</Badge>
            </div>
            <div className="space-y-4">
              <Input label="API key" {...form.register(`${provider}.api_key` as never)} />
              <Input label="Webhook URL" {...form.register(`${provider}.webhook_url` as never)} />
            </div>
            <div className="mt-4 flex gap-2">
              <Button leftIcon={<Plug size={14} />} onClick={connect} loading={connectMutation.isPending}>Connect</Button>
              <Button variant="secondary" leftIcon={<Unplug size={14} />} onClick={disconnect} loading={disconnectMutation.isPending}>Disconnect</Button>
            </div>
          </div>
        </div>
      )}
    </SectionFrame>
  );
}
