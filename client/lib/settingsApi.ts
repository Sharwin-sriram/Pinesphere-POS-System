import { authService, httpClient } from "@/app/lib/authService";

export type ApiEnvelope<T> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
};

async function unwrap<T>(promise: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  try {
    const response = await promise;
    if (!response.data.success) {
      throw new Error(response.data.error?.message || "Request failed");
    }
    return response.data.data as T;
  } catch (error) {
    const responseData = error && typeof error === "object" && "response" in error
      ? (error.response as { data?: ApiEnvelope<T> | { detail?: string; message?: string } } | undefined)?.data
      : undefined;

    if (responseData && typeof responseData === "object") {
      if ("error" in responseData && responseData.error?.message) {
        throw new Error(responseData.error.message);
      }
      if ("detail" in responseData && responseData.detail) {
        throw new Error(responseData.detail);
      }
      if ("message" in responseData && responseData.message) {
        throw new Error(responseData.message);
      }
    }

    throw error;
  }
}

function getRestaurantContextParams() {
  const restaurantId = authService.getCurrentUser()?.restaurant_id;
  return restaurantId ? { restaurant_id: restaurantId } : {};
}

function withRestaurantContext(config: { params?: Record<string, unknown> } = {}) {
  return {
    ...config,
    params: {
      ...getRestaurantContextParams(),
      ...(config.params || {}),
    },
  };
}

export const settingsApi = {
  getRestaurant: () => unwrap(httpClient.get<ApiEnvelope<any>>("/api/settings/restaurant/", withRestaurantContext())),
  updateRestaurant: (payload: unknown) => unwrap(httpClient.put<ApiEnvelope<any>>("/api/settings/restaurant/", payload, withRestaurantContext())),
  uploadRestaurantLogo: (restaurantId: string, file: File) => {
    const formData = new FormData();
    formData.append("logo", file);
    formData.append("restaurant_id", restaurantId);
    return unwrap(httpClient.post<ApiEnvelope<any>>("/api/settings/restaurant/logo/", formData, {
      params: getRestaurantContextParams(),
      headers: { "Content-Type": "multipart/form-data" },
    }));
  },
  getPermissions: () => unwrap(httpClient.get<ApiEnvelope<any[]>>("/api/settings/permissions/", withRestaurantContext())),

  getRoles: () => unwrap(httpClient.get<ApiEnvelope<any[]>>("/api/settings/roles/", withRestaurantContext())),
  createRole: (payload: unknown) => unwrap(httpClient.post<ApiEnvelope<any>>("/api/settings/roles/", payload, withRestaurantContext())),
  updateRole: (roleId: string, payload: unknown) => unwrap(httpClient.put<ApiEnvelope<any>>(`/api/settings/roles/${roleId}/`, payload, withRestaurantContext())),
  deleteRole: (roleId: string) => unwrap(httpClient.delete<ApiEnvelope<{ deleted: boolean }>>(`/api/settings/roles/${roleId}/`, withRestaurantContext())),

  getMenuCategories: () => unwrap(httpClient.get<ApiEnvelope<any[]>>("/api/settings/menu-categories/", withRestaurantContext())),
  createMenuCategory: (payload: unknown) => unwrap(httpClient.post<ApiEnvelope<any>>("/api/settings/menu-categories/create/", payload, withRestaurantContext())),
  updateMenuCategory: (categoryId: string, payload: unknown) => unwrap(httpClient.put<ApiEnvelope<any>>(`/api/settings/menu-categories/${categoryId}/`, payload, withRestaurantContext())),
  deleteMenuCategory: (categoryId: string) => unwrap(httpClient.delete<ApiEnvelope<{ deleted: boolean }>>(`/api/settings/menu-categories/${categoryId}/`, withRestaurantContext())),
  reorderMenuCategories: (orderedIds: string[]) => unwrap(httpClient.put<ApiEnvelope<any[]>>("/api/settings/menu-categories/reorder/", { ordered_ids: orderedIds }, withRestaurantContext())),

  getKdsStations: () => unwrap(httpClient.get<ApiEnvelope<any[]>>("/api/settings/kds-stations/", withRestaurantContext())),
  createKdsStation: (payload: unknown) => unwrap(httpClient.post<ApiEnvelope<any>>("/api/settings/kds-stations/", payload, withRestaurantContext())),
  updateKdsStation: (stationId: string, payload: unknown) => unwrap(httpClient.put<ApiEnvelope<any>>(`/api/settings/kds-stations/${stationId}/`, payload, withRestaurantContext())),
  deleteKdsStation: (stationId: string) => unwrap(httpClient.delete<ApiEnvelope<{ deleted: boolean }>>(`/api/settings/kds-stations/${stationId}/`, withRestaurantContext())),
  reorderKdsStations: (orderedIds: string[]) => unwrap(httpClient.put<ApiEnvelope<any[]>>("/api/settings/kds-stations/reorder/", { ordered_ids: orderedIds }, withRestaurantContext())),

  getShifts: () => unwrap(httpClient.get<ApiEnvelope<any[]>>("/api/settings/shifts/", withRestaurantContext())),
  createShift: (payload: unknown) => unwrap(httpClient.post<ApiEnvelope<any>>("/api/settings/shifts/", payload, withRestaurantContext())),
  updateShift: (shiftId: string, payload: unknown) => unwrap(httpClient.put<ApiEnvelope<any>>(`/api/settings/shifts/${shiftId}/`, payload, withRestaurantContext())),
  deleteShift: (shiftId: string) => unwrap(httpClient.delete<ApiEnvelope<{ deleted: boolean }>>(`/api/settings/shifts/${shiftId}/`, withRestaurantContext())),
  getShiftCoverage: (week?: string) => unwrap(httpClient.get<ApiEnvelope<any>>("/api/settings/shifts/coverage/", withRestaurantContext({ params: { week } }))),

  getPrinters: () => unwrap(httpClient.get<ApiEnvelope<any[]>>("/api/settings/printers/", withRestaurantContext())),
  createPrinter: (payload: unknown) => unwrap(httpClient.post<ApiEnvelope<any>>("/api/settings/printers/", payload, withRestaurantContext())),
  updatePrinter: (printerId: string, payload: unknown) => unwrap(httpClient.put<ApiEnvelope<any>>(`/api/settings/printers/${printerId}/`, payload, withRestaurantContext())),
  deletePrinter: (printerId: string) => unwrap(httpClient.delete<ApiEnvelope<{ deleted: boolean }>>(`/api/settings/printers/${printerId}/`, withRestaurantContext())),
  testPrinter: (printerId: string) => unwrap(httpClient.post<ApiEnvelope<any>>(`/api/settings/printers/${printerId}/test/`, {}, withRestaurantContext())),

  getPaymentSettings: () => unwrap(httpClient.get<ApiEnvelope<any>>("/api/settings/payment/", withRestaurantContext())),
  updatePaymentSettings: (payload: unknown) => unwrap(httpClient.put<ApiEnvelope<any>>("/api/settings/payment/", payload, withRestaurantContext())),
  getTaxRates: () => unwrap(httpClient.get<ApiEnvelope<any[]>>("/api/settings/tax-rates/", withRestaurantContext())),
  createTaxRate: (payload: unknown) => unwrap(httpClient.post<ApiEnvelope<any>>("/api/settings/tax-rates/", payload, withRestaurantContext())),
  updateTaxRate: (taxRateId: string, payload: unknown) => unwrap(httpClient.put<ApiEnvelope<any>>(`/api/settings/tax-rates/${taxRateId}/`, payload, withRestaurantContext())),
  deleteTaxRate: (taxRateId: string) => unwrap(httpClient.delete<ApiEnvelope<{ deleted: boolean }>>(`/api/settings/tax-rates/${taxRateId}/`, withRestaurantContext())),

  getNotifications: () => unwrap(httpClient.get<ApiEnvelope<any>>("/api/settings/notifications/", withRestaurantContext())),
  updateNotifications: (payload: unknown) => unwrap(httpClient.put<ApiEnvelope<any>>("/api/settings/notifications/", payload, withRestaurantContext())),

  getSecurity: () => unwrap(httpClient.get<ApiEnvelope<any>>("/api/settings/security/", withRestaurantContext())),
  updateSecurity: (payload: unknown) => unwrap(httpClient.put<ApiEnvelope<any>>("/api/settings/security/", payload, withRestaurantContext())),

  getIntegrations: () => unwrap(httpClient.get<ApiEnvelope<any>>("/api/settings/integrations/", withRestaurantContext())),
  updateIntegrationProvider: (provider: string, payload: unknown) => unwrap(httpClient.put<ApiEnvelope<any>>(`/api/settings/integrations/${provider}/`, payload, withRestaurantContext())),
  connectIntegrationProvider: (provider: string) => unwrap(httpClient.post<ApiEnvelope<any>>(`/api/settings/integrations/${provider}/connect/`, {}, withRestaurantContext())),
  disconnectIntegrationProvider: (provider: string) => unwrap(httpClient.post<ApiEnvelope<any>>(`/api/settings/integrations/${provider}/disconnect/`, {}, withRestaurantContext())),
};
