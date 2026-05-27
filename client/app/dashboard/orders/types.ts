export type OrderStatus =
  | "PLACED"
  | "ACCEPTED"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "PAYMENT_FAILED"
  | "REFUNDED";

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  placedAt: string;
  estimatedDelivery?: string;
  restaurantName: string;
  restaurantImage?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  deliveryAddress: string;
  deliveryPartner?: {
    name: string;
    phone: string;
    avatar?: string;
  };
  cancellationReason?: string;
}

export interface LifecycleStep {
  key: OrderStatus;
  label: string;
  description: string;
  icon: string;
}
