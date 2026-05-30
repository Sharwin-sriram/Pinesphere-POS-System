export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  is_veg: boolean;
  tags: string[];
  price: number;
  discount_price?: number | null;
  quantity: number;
  low_stock_threshold: number;
  status: "Active" | "Inactive" | "Out of Stock";
  image_url?: string | null;
  available_days: string[];
  available_hours?: { from: string; to: string } | null;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface MenuFilters {
  q?: string;
  category?: string;
  status?: string;
  sort?: string;
  page?: number;
  page_size?: number;
}
