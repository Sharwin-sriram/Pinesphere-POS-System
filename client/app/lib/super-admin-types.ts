// ─── Super-Admin Type Definitions ───────────────────────────────────────────

export type RestaurantStatus = "PENDING" | "APPROVED" | "DECLINED" | "SUSPENDED" | "ACTIVE";
export type UserStatus = "Active" | "Suspended" | "Pending" | "Banned";
export type OrderStatus =
  | "PLACED"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "SERVED"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED";
export type OrderType = "Dine-in" | "Takeout" | "Delivery";
export type StaffRole = "Waiter" | "Manager" | "Delivery";
export type DeliveryStatus = "Idle" | "On Delivery" | "Offline";
export type ShiftStatus = "On Shift" | "Off Shift" | "On Break";
export type UserRole = "Super Admin" | "Manager" | "Waiter" | "Delivery" | "Cashier" | "Kitchen" | "Customer";

export interface Restaurant {
  id: string;
  name: string;
  owner: string;
  email: string;
  phone: string;
  type: "Dine-in" | "Takeaway" | "Delivery" | "All";
  status: RestaurantStatus;
  submittedDate: string;
  approvedDate?: string;
  businessLicense?: string;
  city: string;
  plan: string;
  totalOrders: number;
  revenue: number;
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  restaurant?: string;
  restaurantId?: string;
  status: UserStatus;
  createdAt: string;
  lastLogin: string;
  emailVerified: boolean;
  twoFAEnabled: boolean;
  failedLoginAttempts: number;
  lastPasswordChange: string;
  sessions: UserSession[];
}

export interface UserSession {
  id: string;
  device: string;
  browser: string;
  ip: string;
  lastActive: string;
  location: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  restaurant: string;
  restaurantId: string;
  status: "Active" | "Inactive";
  shiftStatus: ShiftStatus;
  // Waiter-specific
  tablesAssigned?: number;
  ordersToday?: number;
  rating?: number;
  // Manager-specific
  permissions?: string[];
  lastActive?: string;
  // Delivery-specific
  deliveryStatus?: DeliveryStatus;
  completedToday?: number;
  zone?: string;
}

export interface OrderItem {
  name: string;
  qty: number;
  price: number;
  modifiers?: string[];
}

export interface Order {
  id: string;
  restaurant: string;
  restaurantId: string;
  type: OrderType;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: OrderStatus;
  waiter?: string;
  driver?: string;
  createdAt: string;
  updatedAt: string;
  escalated?: boolean;
  refundReason?: string;
  cancelReason?: string;
  tableNumber?: number;
}

export type AuditActionType =
  | "RESTAURANT_APPROVED"
  | "RESTAURANT_DECLINED"
  | "RESTAURANT_SUSPENDED"
  | "USER_SUSPENDED"
  | "USER_REACTIVATED"
  | "USER_DELETED"
  | "USER_IMPERSONATED"
  | "USER_FORCE_LOGOUT"
  | "PASSWORD_RESET_SENT"
  | "PASSWORD_FORCE_RESET"
  | "ACCOUNT_UNLOCKED"
  | "EMAIL_VERIFIED"
  | "2FA_RESET"
  | "SESSION_REVOKED"
  | "ORDER_STATUS_OVERRIDE"
  | "ORDER_REFUND_ISSUED"
  | "ORDER_CANCELLED"
  | "ORDER_ESCALATED"
  | "STAFF_REASSIGNED";

export interface AuditLog {
  id: string;
  superAdminId: string;
  superAdminName: string;
  actionType: AuditActionType;
  targetEntity: "Restaurant" | "User" | "Order" | "Staff" | "Session";
  targetId: string;
  targetName: string;
  metadata: Record<string, string | number | boolean>;
  ipAddress: string;
  createdAt: string;
}
