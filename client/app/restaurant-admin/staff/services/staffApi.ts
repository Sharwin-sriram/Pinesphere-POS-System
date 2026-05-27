import { httpClient } from "../../../lib/authService";
import { PaginatedStaff, StaffMember, Role, Shift, StaffFilters } from "../types";

export const staffApi = {
  // Staff Endpoints
  getStaff: async (restaurantId: string, filters: StaffFilters = {}): Promise<PaginatedStaff> => {
    const response = await httpClient.get(`/api/restaurant/${restaurantId}/staff/`, {
      params: {
        search: filters.search || undefined,
        role: filters.role || undefined,
        status: filters.status || undefined,
        shift: filters.shift || undefined,
        sort: filters.sort || undefined,
        page: filters.page || 1,
        page_size: filters.page_size || 10,
      },
    });
    return response.data;
  },

  getStaffMember: async (restaurantId: string, staffId: string): Promise<StaffMember> => {
    const response = await httpClient.get(`/api/restaurant/${restaurantId}/staff/${staffId}/`);
    return response.data;
  },

  createStaff: async (restaurantId: string, payload: Partial<StaffMember> & { fail?: boolean }): Promise<StaffMember> => {
    const response = await httpClient.post(`/api/restaurant/${restaurantId}/staff/`, payload);
    return response.data;
  },

  updateStaff: async (
    restaurantId: string,
    staffId: string,
    payload: Partial<StaffMember> & { fail?: boolean }
  ): Promise<StaffMember> => {
    const response = await httpClient.put(`/api/restaurant/${restaurantId}/staff/${staffId}/`, payload);
    return response.data;
  },

  patchStaff: async (
    restaurantId: string,
    staffId: string,
    payload: Partial<StaffMember> & { fail?: boolean }
  ): Promise<StaffMember> => {
    const response = await httpClient.patch(`/api/restaurant/${restaurantId}/staff/${staffId}/`, payload);
    return response.data;
  },

  deleteStaff: async (restaurantId: string, staffId: string, failSimulated?: boolean): Promise<{ success: boolean }> => {
    const response = await httpClient.delete(`/api/restaurant/${restaurantId}/staff/${staffId}/`, {
      params: failSimulated ? { fail: true } : undefined,
    });
    return response.data;
  },

  checkEmail: async (restaurantId: string, email: string, excludeId?: string): Promise<{ is_available: boolean }> => {
    const response = await httpClient.get(`/api/restaurant/${restaurantId}/staff/check-email/`, {
      params: { email, exclude_id: excludeId },
    });
    return response.data;
  },

  checkPin: async (restaurantId: string, pin: string, excludeId?: string): Promise<{ is_available: boolean }> => {
    const response = await httpClient.get(`/api/restaurant/${restaurantId}/staff/check-pin/`, {
      params: { pin, exclude_id: excludeId },
    });
    return response.data;
  },

  // Roles Endpoints
  getRoles: async (restaurantId: string): Promise<Role[]> => {
    const response = await httpClient.get(`/api/restaurant/${restaurantId}/roles/`);
    return response.data;
  },

  createRole: async (restaurantId: string, payload: { name: string; color: string }): Promise<Role> => {
    const response = await httpClient.post(`/api/restaurant/${restaurantId}/roles/`, payload);
    return response.data;
  },

  updateRole: async (restaurantId: string, roleId: string, payload: { name: string; color: string }): Promise<Role> => {
    const response = await httpClient.put(`/api/restaurant/${restaurantId}/roles/${roleId}/`, payload);
    return response.data;
  },

  deleteRole: async (restaurantId: string, roleId: string): Promise<{ success: boolean }> => {
    const response = await httpClient.delete(`/api/restaurant/${restaurantId}/roles/${roleId}/`);
    return response.data;
  },

  // Shifts Endpoints
  getShifts: async (restaurantId: string): Promise<Shift[]> => {
    const response = await httpClient.get(`/api/restaurant/${restaurantId}/shifts/`);
    return response.data;
  },
};
