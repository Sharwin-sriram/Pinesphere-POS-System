"use client";

import { settingsApi } from "@/lib/settingsApi";
import { useSettingsMutation, useSettingsQuery } from "./useSettingsBase";

export function useSettingsRestaurant() {
  return useSettingsQuery(["settings", "restaurant"], () => settingsApi.getRestaurant());
}

export function useUpdateSettingsRestaurant() {
  return useSettingsMutation(settingsApi.updateRestaurant);
}

export function useUploadSettingsRestaurantLogo() {
  return useSettingsMutation(({ restaurantId, file }: { restaurantId: string; file: File }) =>
    settingsApi.uploadRestaurantLogo(restaurantId, file),
  );
}
