export type OrderStatus =
  | "DRAFT"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "SERVED"
  | "PAID"
  | "CANCELLED";

export type DeliveryStatus =
  | "Preparing"
  | "Picked Up"
  | "Out for Delivery"
  | "Delivered"
  | "Failed";

export type PaymentMethod =
  | "CASH"
  | "UPI"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "WALLET"
  | "GIFT_VOUCHER"
  | "SPLIT";

export interface DeliveryOrder {
  id: number;
  branchId: number;

  customerId?: number;

  customer: string;
  address: string;

  orderType: "DELIVERY";

  status: OrderStatus;

  deliveryStatus: DeliveryStatus;

  totalAmount: number;
  taxAmount: number;
  discountAmount: number;
  netAmount: number;

  rider: string;

  eta: string;

  paymentMethod: PaymentMethod;

  otpVerified: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface Rider {
  id: string;

  name: string;

  phone: string;

  status:
    | "Online"
    | "Offline"
    | "Delivering";

  vehicle: string;

  earnings: number;

  deliveries: number;

  rating: number;

  currentLatitude?: number;
  currentLongitude?: number;
}