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

export const deliveryApi = {
  getOrders: () => unwrap(httpClient.get<ApiEnvelope<any[]>>("/api/v1/delivery/deliveries/")),
  getOrderById: (id: string | number) => unwrap(httpClient.get<ApiEnvelope<any>>(`/api/v1/delivery/deliveries/${id}/`)),
  
  // Accept and Reject
  acceptOrder: (id: string | number, courierId: string | number) => 
    unwrap(httpClient.post<ApiEnvelope<any>>(`/api/v1/delivery/deliveries/${id}/accept/`, { courier_id: courierId })),
  rejectOrder: (id: string | number, courierId: string | number) => 
    unwrap(httpClient.post<ApiEnvelope<any>>(`/api/v1/delivery/deliveries/${id}/reject/`, { courier_id: courierId })),
    
  // Couriers
  getRiders: () => unwrap(httpClient.get<ApiEnvelope<any[]>>("/api/v1/delivery/couriers/")),
  getRiderById: (id: string | number) => unwrap(httpClient.get<ApiEnvelope<any>>(`/api/v1/delivery/couriers/${id}/`)),
};