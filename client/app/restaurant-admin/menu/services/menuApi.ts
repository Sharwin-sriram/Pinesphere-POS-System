import { httpClient } from "../../../lib/authService";
import { MenuItem, Category, MenuFilters } from "../types";

export interface PaginatedMenu {
  results: MenuItem[];
  page: number;
  page_size: number;
  total: number;
  has_next: boolean;
}

export const menuApi = {
  // Menu Item Endpoints
  getMenu: async (restaurantId: string, filters: MenuFilters = {}): Promise<PaginatedMenu> => {
    const response = await httpClient.get(`/api/restaurant/${restaurantId}/menu/`, {
      params: {
        q: filters.q || undefined,
        category: filters.category || undefined,
        status: filters.status || undefined,
        sort: filters.sort || undefined,
        page: filters.page || 1,
        page_size: filters.page_size || 10,
      },
    });
    return response.data;
  },

  getMenuItem: async (restaurantId: string, itemId: string): Promise<MenuItem> => {
    const response = await httpClient.get(`/api/restaurant/${restaurantId}/menu/${itemId}/`);
    return response.data;
  },

  createMenuItem: async (restaurantId: string, payload: Partial<MenuItem> & { fail?: boolean }): Promise<MenuItem> => {
    const response = await httpClient.post(`/api/restaurant/${restaurantId}/menu/`, payload);
    return response.data;
  },

  updateMenuItem: async (
    restaurantId: string,
    itemId: string,
    payload: Partial<MenuItem> & { fail?: boolean }
  ): Promise<MenuItem> => {
    const response = await httpClient.patch(`/api/restaurant/${restaurantId}/menu/${itemId}/`, payload);
    return response.data;
  },

  deleteMenuItem: async (restaurantId: string, itemId: string, failSimulated?: boolean): Promise<{ success: boolean }> => {
    const response = await httpClient.delete(`/api/restaurant/${restaurantId}/menu/${itemId}/`, {
      params: failSimulated ? { fail: true } : undefined,
    });
    return response.data;
  },

  bulkDeleteMenuItems: async (restaurantId: string, ids: string[], failSimulated?: boolean): Promise<{ success: boolean; deleted_count: number }> => {
    const response = await httpClient.delete(`/api/restaurant/${restaurantId}/menu/`, {
      data: { ids, fail: failSimulated },
    });
    return response.data;
  },

  // Category Endpoints
  getCategories: async (restaurantId: string): Promise<Category[]> => {
    const response = await httpClient.get(`/api/restaurant/${restaurantId}/categories/`);
    return response.data;
  },

  createCategory: async (restaurantId: string, name: string): Promise<Category> => {
    const response = await httpClient.post(`/api/restaurant/${restaurantId}/categories/`, { name });
    return response.data;
  },

  updateCategory: async (restaurantId: string, catId: string, name: string): Promise<Category> => {
    const response = await httpClient.patch(`/api/restaurant/${restaurantId}/categories/${catId}/`, { name });
    return response.data;
  },

  deleteCategory: async (restaurantId: string, catId: string): Promise<{ success: boolean }> => {
    const response = await httpClient.delete(`/api/restaurant/${restaurantId}/categories/${catId}/`);
    return response.data;
  },

  // Media Upload Endpoint
  uploadImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await httpClient.post("/api/upload/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
