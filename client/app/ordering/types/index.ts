// ordering/types/index.ts

export interface MenuItem {
  id: number;

  name: string;

  description?: string;

  basePrice: number;

  imageUrl?: string;

  isVeg?: boolean;

  preparationTime?: number;
}

export interface MenuCategory {
  id: number;

  name: string;

  imageUrl?: string;
}

export interface CartItem {
  id: number;

  name?: string;

  quantity?: number;

  price?: number;
}

export interface Coupon {
  id: number;
  code: string;
  discountPercentage?: number;
}

export interface DeliveryPartner {
  id: number;
  name: string;
  eta?: string;
}

export interface ScheduledOrder {
  id: number;
  deliveryTime?: string;
}