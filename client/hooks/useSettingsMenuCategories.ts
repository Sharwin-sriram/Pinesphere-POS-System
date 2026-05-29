"use client";

import { settingsApi } from "@/lib/settingsApi";
import { useSettingsMutation, useSettingsQuery } from "./useSettingsBase";

export function useSettingsMenuCategories() {
  return useSettingsQuery(["settings", "menu-categories"], () => settingsApi.getMenuCategories());
}

export function useCreateSettingsMenuCategory() {
  return useSettingsMutation(settingsApi.createMenuCategory);
}

export function useUpdateSettingsMenuCategory() {
  return useSettingsMutation(({ categoryId, payload }: { categoryId: string; payload: unknown }) => settingsApi.updateMenuCategory(categoryId, payload));
}

export function useDeleteSettingsMenuCategory() {
  return useSettingsMutation((categoryId: string) => settingsApi.deleteMenuCategory(categoryId));
}

export function useReorderSettingsMenuCategories() {
  return useSettingsMutation((orderedIds: string[]) => settingsApi.reorderMenuCategories(orderedIds));
}
