"use client";

import { settingsApi } from "@/lib/settingsApi";
import { useSettingsMutation, useSettingsQuery } from "./useSettingsBase";

export function useSettingsSecurity() {
  return useSettingsQuery(["settings", "security"], () => settingsApi.getSecurity());
}

export function useUpdateSettingsSecurity() {
  return useSettingsMutation(settingsApi.updateSecurity);
}
