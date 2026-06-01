export const AUTH_ROUTE_PREFIXES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/otp-login",
  "/verify-otp",
  "/oauth/callback",
  "/restaurant/login",
  "/restaurant/signup",
  "/restaurant/forgot-password",
];

export const PUBLIC_ROUTE_PREFIXES = [
  "/",
  "/dashboard",
  "/ordering",
  "/delivery/tracking",
  "/test-guide",
  "/otp-demo",
];

export const STAFF_ROUTE_PREFIXES = [
  "/super-admin",
  "/hr",
  "/inventory",
  "/restaurant-admin",
  "/cashier",
  "/waiter",
  "/kitchen",
  "/kds",
  "/delivery",
  "/employee",
];

export const ROLE_HOME_PATHS = {
  admin: "/super-admin",
  "super-admin": "/super-admin",
  SUPER_ADMIN: "/super-admin",
  manager: "/hr",
  MANAGER: "/hr",
  restaurant_admin: "/restaurant-admin",
  ORGANIZATION_OWNER: "/restaurant-admin",
  restaurant: "/restaurant-admin",
  "restaurant-admin": "/restaurant-admin",
  cashier: "/cashier",
  CASHIER: "/cashier",
  waiter: "/waiter",
  WAITER: "/waiter",
  kitchen: "/kitchen",
  KITCHEN: "/kitchen",
  delivery: "/delivery",
  DELIVERY: "/delivery",
  employee: "/employee",
  CUSTOMER: "/dashboard",
};

export const ROLE_ALLOWED_PREFIXES = {
  admin: STAFF_ROUTE_PREFIXES,
  "super-admin": ["/super-admin"],
  SUPER_ADMIN: ["/super-admin"],
  manager: ["/hr", "/inventory", "/restaurant-admin", "/employee"],
  MANAGER: ["/hr", "/inventory", "/restaurant-admin", "/employee"],
  restaurant_admin: ["/restaurant-admin"],
  ORGANIZATION_OWNER: ["/restaurant-admin", "/kds"],
  restaurant: ["/restaurant-admin", "/kds"],
  "restaurant-admin": ["/restaurant-admin", "/kds"],
  cashier: ["/cashier"],
  CASHIER: ["/cashier"],
  waiter: ["/waiter"],
  WAITER: ["/waiter"],
  kitchen: ["/kitchen", "/kds"],
  KITCHEN: ["/kitchen", "/kds"],
  delivery: ["/delivery"],
  DELIVERY: ["/delivery"],
  employee: ["/employee"],
  CUSTOMER: PUBLIC_ROUTE_PREFIXES,
};

export function getRoleHomePath(role) {
  return ROLE_HOME_PATHS[role] || "/";
}

export function matchesPathPrefix(pathname, prefix) {
  if (prefix === "/") {
    return pathname === "/";
  }

  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function matchesAnyPathPrefix(pathname, prefixes) {
  return prefixes.some((prefix) => matchesPathPrefix(pathname, prefix));
}