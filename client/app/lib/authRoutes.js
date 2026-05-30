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
  manager: "/hr",
  "restaurant-admin": "/restaurant-admin",
  restaurant_admin: "/restaurant-admin",
  cashier: "/cashier",
  waiter: "/waiter",
  kitchen: "/kitchen",
  delivery: "/delivery",
  employee: "/employee",
};

export const ROLE_ALLOWED_PREFIXES = {
  admin: STAFF_ROUTE_PREFIXES,
  "super-admin": ["/super-admin"],
  manager: ["/hr", "/inventory", "/restaurant-admin", "/employee"],
  "restaurant-admin": ["/restaurant-admin"],
  restaurant_admin: ["/restaurant-admin"],
  cashier: ["/cashier"],
  waiter: ["/waiter"],
  kitchen: ["/kitchen", "/kds"],
  delivery: ["/delivery"],
  employee: ["/employee"],
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