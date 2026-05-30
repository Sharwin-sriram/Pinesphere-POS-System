import { httpClient } from "../../../lib/authService";

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  manager_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBranchPayload {
  name: string;
  address: string;
  phone: string;
  manager_name: string;
  is_active?: boolean;
}

export const branchApi = {
  // Get all branches for a restaurant
  getBranches: async (restaurantId: string): Promise<Branch[]> => {
    const response = await httpClient.get(
      `/api/restaurant/${restaurantId}/branches/`
    );
    return response.data;
  },

  // Get single branch
  getBranch: async (restaurantId: string, branchId: string): Promise<Branch> => {
    const response = await httpClient.get(
      `/api/restaurant/${restaurantId}/branches/${branchId}/`
    );
    return response.data;
  },

  // Create new branch
  createBranch: async (
    restaurantId: string,
    payload: CreateBranchPayload
  ): Promise<Branch> => {
    const response = await httpClient.post(
      `/api/restaurant/${restaurantId}/branches/`,
      payload
    );
    return response.data;
  },

  // Update branch
  updateBranch: async (
    restaurantId: string,
    branchId: string,
    payload: Partial<CreateBranchPayload>
  ): Promise<Branch> => {
    const response = await httpClient.patch(
      `/api/restaurant/${restaurantId}/branches/${branchId}/`,
      payload
    );
    return response.data;
  },

  // Delete branch
  deleteBranch: async (
    restaurantId: string,
    branchId: string
  ): Promise<{ success: boolean }> => {
    const response = await httpClient.delete(
      `/api/restaurant/${restaurantId}/branches/${branchId}/`
    );
    return response.data;
  },
};
