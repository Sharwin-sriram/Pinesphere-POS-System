export interface RestaurantQuery {
  q?: string;
  cuisine?: string;
  min_rating?: number;
  sort?: string;
  page?: number;
  page_size?: number;
}

export function buildQueryParams(query: RestaurantQuery): Record<string, string> {
  const params: Record<string, string> = {};

  if (query.q && query.q.trim()) {
    params.q = query.q.trim();
  }
  if (query.cuisine && query.cuisine !== "All" && query.cuisine.trim()) {
    params.cuisine = query.cuisine.trim();
  }
  if (query.min_rating !== undefined && query.min_rating > 0) {
    params.min_rating = String(query.min_rating);
  }
  if (query.sort) {
    params.sort = query.sort;
  }
  if (query.page !== undefined && query.page > 0) {
    params.page = String(query.page);
  }
  if (query.page_size !== undefined && query.page_size > 0) {
    params.page_size = String(query.page_size);
  }

  return params;
}
