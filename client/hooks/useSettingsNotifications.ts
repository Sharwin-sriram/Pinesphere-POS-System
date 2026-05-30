"use client";

import { settingsApi } from "@/lib/settingsApi";
import { useSettingsMutation, useSettingsQuery } from "./useSettingsBase";

export function useSettingsNotifications() {
  return useSettingsQuery(["settings", "notifications"], () => settingsApi.getNotifications());
}

export function useUpdateSettingsNotifications() {
  return useSettingsMutation(settingsApi.updateNotifications);
}
