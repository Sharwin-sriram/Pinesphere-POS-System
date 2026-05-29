"use client";

import { settingsApi } from "@/lib/settingsApi";
import { useSettingsMutation, useSettingsQuery } from "./useSettingsBase";

export function useSettingsPrinters() {
  return useSettingsQuery(["settings", "printers"], () => settingsApi.getPrinters());
}

export function useCreateSettingsPrinter() {
  return useSettingsMutation(settingsApi.createPrinter);
}

export function useUpdateSettingsPrinter() {
  return useSettingsMutation(({ printerId, payload }: { printerId: string; payload: unknown }) => settingsApi.updatePrinter(printerId, payload));
}

export function useDeleteSettingsPrinter() {
  return useSettingsMutation((printerId: string) => settingsApi.deletePrinter(printerId));
}

export function useTestSettingsPrinter() {
  return useSettingsMutation((printerId: string) => settingsApi.testPrinter(printerId));
}
