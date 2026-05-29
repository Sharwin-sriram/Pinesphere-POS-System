"use client";

import { settingsApi } from "@/lib/settingsApi";
import { useSettingsMutation, useSettingsQuery } from "./useSettingsBase";

export function useSettingsIntegrations() {
  return useSettingsQuery(["settings", "integrations"], () => settingsApi.getIntegrations());
}

export function useUpdateSettingsIntegrationProvider() {
  return useSettingsMutation(({ provider, payload }: { provider: string; payload: unknown }) => settingsApi.updateIntegrationProvider(provider, payload));
}

export function useConnectSettingsIntegrationProvider() {
  return useSettingsMutation((provider: string) => settingsApi.connectIntegrationProvider(provider));
}

export function useDisconnectSettingsIntegrationProvider() {
  return useSettingsMutation((provider: string) => settingsApi.disconnectIntegrationProvider(provider));
}
