"use client";

import { settingsApi } from "@/lib/settingsApi";
import { useSettingsMutation, useSettingsQuery } from "./useSettingsBase";

export function useSettingsShifts() {
  return useSettingsQuery(["settings", "shifts"], () => settingsApi.getShifts());
}

export function useSettingsShiftCoverage(week?: string) {
  return useSettingsQuery(["settings", "shifts", "coverage", week || "current"], () => settingsApi.getShiftCoverage(week));
}

export function useCreateSettingsShift() {
  return useSettingsMutation(settingsApi.createShift);
}

export function useUpdateSettingsShift() {
  return useSettingsMutation(({ shiftId, payload }: { shiftId: string; payload: unknown }) => settingsApi.updateShift(shiftId, payload));
}

export function useDeleteSettingsShift() {
  return useSettingsMutation((shiftId: string) => settingsApi.deleteShift(shiftId));
}
