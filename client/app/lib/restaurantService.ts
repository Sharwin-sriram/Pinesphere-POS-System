import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
httpClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("pos_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  timezone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  branches?: Branch[];
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
}

export const restaurantService = {
  /**
   * Get restaurant details by ID
   */
  getRestaurant: async (restaurantId: string): Promise<Restaurant | null> => {
    try {
      const response = await httpClient.get(`/api/restaurants/${restaurantId}/`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch restaurant:", error);
      return null;
    }
  },

  /**
   * Get all restaurants for the current user
   */
  getRestaurants: async (): Promise<Restaurant[]> => {
    try {
      const response = await httpClient.get("/api/restaurants/");
      return response.data.results || response.data;
    } catch (error) {
      console.error("Failed to fetch restaurants:", error);
      return [];
    }
  },

  /**
   * Get restaurant by name (for restaurant owners)
   */
  getRestaurantByName: async (name: string): Promise<Restaurant | null> => {
    try {
      const response = await httpClient.get("/api/restaurants/", {
        params: { name },
      });
      const restaurants = response.data.results || response.data;
      return restaurants.length > 0 ? restaurants[0] : null;
    } catch (error) {
      console.error("Failed to fetch restaurant by name:", error);
      return null;
    }
  },
};
