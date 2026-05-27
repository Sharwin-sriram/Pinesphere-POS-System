import { httpClient } from "../../lib/authService";

export type Restaurant = {
  id: string;
  name: string;
  cuisine: string[];
  rating: number;
  delivery_time_min: number;
  location: string;
  min_order_amount: number;
  offer_text?: string | null;
  is_open: boolean;
  image_url?: string | null;
};

export type RestaurantsResponse = {
  results: Restaurant[];
  page: number;
  page_size: number;
  total: number;
  has_next: boolean;
};

export type RestaurantQuery = {
  q?: string;
  cuisine?: string;
  min_rating?: number;
  sort?: "rating_desc" | "delivery_asc" | "name_asc";
  page?: number;
  page_size?: number;
};

export async function fetchRestaurants(query: RestaurantQuery): Promise<RestaurantsResponse> {
  const response = await httpClient.get("/api/restaurants/", {
    params: {
      q: query.q || undefined,
      cuisine: query.cuisine || undefined,
      min_rating: query.min_rating ?? undefined,
      sort: query.sort || "rating_desc",
      page: query.page ?? 1,
      page_size: query.page_size ?? 12,
    },
  });

  return response.data;
}

