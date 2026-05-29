"use client";

import { settingsApi } from "@/lib/settingsApi";
import { useSettingsMutation, useSettingsQuery } from "./useSettingsBase";

export function useSettingsKdsStations() {
  return useSettingsQuery(["settings", "kds-stations"], () => settingsApi.getKdsStations());
}

export function useCreateSettingsKdsStation() {
  return useSettingsMutation(settingsApi.createKdsStation);
}

export function useUpdateSettingsKdsStation() {
  return useSettingsMutation(({ stationId, payload }: { stationId: string; payload: unknown }) => settingsApi.updateKdsStation(stationId, payload));
}

export function useDeleteSettingsKdsStation() {
  return useSettingsMutation((stationId: string) => settingsApi.deleteKdsStation(stationId));
}

export function useReorderSettingsKdsStations() {
  return useSettingsMutation((orderedIds: string[]) => settingsApi.reorderKdsStations(orderedIds));
}
