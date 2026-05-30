"use client";

import { settingsApi } from "@/lib/settingsApi";
import { useSettingsMutation, useSettingsQuery } from "./useSettingsBase";

export function useSettingsRoles() {
  return useSettingsQuery(["settings", "roles"], () => settingsApi.getRoles());
}

export function useSettingsPermissions() {
  return useSettingsQuery(["settings", "permissions"], () => settingsApi.getPermissions());
}

export function useCreateSettingsRole() {
  return useSettingsMutation(settingsApi.createRole);
}

export function useUpdateSettingsRole() {
  return useSettingsMutation(({ roleId, payload }: { roleId: string; payload: unknown }) => settingsApi.updateRole(roleId, payload));
}

export function useDeleteSettingsRole() {
  return useSettingsMutation((roleId: string) => settingsApi.deleteRole(roleId));
}
