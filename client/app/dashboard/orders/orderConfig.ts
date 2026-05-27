import { OrderStatus, LifecycleStep } from "./types";

export const LIFECYCLE_STEPS: LifecycleStep[] = [
  {
    key: "PLACED",
    label: "Order Placed",
    description: "Your order has been received",
    icon: "receipt",
  },
  {
    key: "ACCEPTED",
    label: "Restaurant Accepted",
    description: "Restaurant confirmed your order",
    icon: "check-circle",
  },
  {
    key: "PREPARING",
    label: "Preparing Food",
    description: "Kitchen is preparing your food",
    icon: "chef-hat",
  },
  {
    key: "READY_FOR_PICKUP",
    label: "Ready for Pickup",
    description: "Order is packed and ready",
    icon: "package",
  },
  {
    key: "OUT_FOR_DELIVERY",
    label: "Out for Delivery",
    description: "Delivery partner is on the way",
    icon: "bike",
  },
  {
    key: "DELIVERED",
    label: "Delivered",
    description: "Order delivered successfully",
    icon: "party-popper",
  },
];

// Maps a status to its index in the lifecycle (for progress calculation)
export const STATUS_INDEX: Record<string, number> = {
  PLACED: 0,
  ACCEPTED: 1,
  PREPARING: 2,
  READY_FOR_PICKUP: 3,
  OUT_FOR_DELIVERY: 4,
  DELIVERED: 5,
};

export const FAILURE_STATUSES: OrderStatus[] = [
  "CANCELLED",
  "PAYMENT_FAILED",
  "REFUNDED",
];

export const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string; border: string; dot: string }> = {
  PLACED:            { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200",  dot: "bg-blue-500"   },
  ACCEPTED:          { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200",dot: "bg-indigo-500" },
  PREPARING:         { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200", dot: "bg-amber-500"  },
  READY_FOR_PICKUP:  { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200",dot: "bg-orange-500" },
  OUT_FOR_DELIVERY:  { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200",dot: "bg-violet-500" },
  DELIVERED:         { bg: "bg-emerald-50",text: "text-emerald-700",border: "border-emerald-200",dot:"bg-emerald-500"},
  CANCELLED:         { bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200",   dot: "bg-red-500"    },
  PAYMENT_FAILED:    { bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200",   dot: "bg-red-500"    },
  REFUNDED:          { bg: "bg-slate-50",  text: "text-slate-700",  border: "border-slate-200", dot: "bg-slate-500"  },
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
  PLACED:           "Order Placed",
  ACCEPTED:         "Accepted",
  PREPARING:        "Preparing",
  READY_FOR_PICKUP: "Ready for Pickup",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED:        "Delivered",
  CANCELLED:        "Cancelled",
  PAYMENT_FAILED:   "Payment Failed",
  REFUNDED:         "Refunded",
};
