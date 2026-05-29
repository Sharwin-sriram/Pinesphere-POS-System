"use client";

import { settingsApi } from "@/lib/settingsApi";
import { useSettingsMutation, useSettingsQuery } from "./useSettingsBase";

export function useSettingsPayment() {
  return useSettingsQuery(["settings", "payment"], () => settingsApi.getPaymentSettings());
}

export function useSettingsTaxRates() {
  return useSettingsQuery(["settings", "tax-rates"], () => settingsApi.getTaxRates());
}

export function useUpdateSettingsPayment() {
  return useSettingsMutation(settingsApi.updatePaymentSettings);
}

export function useCreateSettingsTaxRate() {
  return useSettingsMutation(settingsApi.createTaxRate);
}

export function useUpdateSettingsTaxRate() {
  return useSettingsMutation(({ taxRateId, payload }: { taxRateId: string; payload: unknown }) => settingsApi.updateTaxRate(taxRateId, payload));
}

export function useDeleteSettingsTaxRate() {
  return useSettingsMutation((taxRateId: string) => settingsApi.deleteTaxRate(taxRateId));
}
