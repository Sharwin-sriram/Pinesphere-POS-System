import axios from "axios";
import { getRoleHomePath } from "./authRoutes";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

const ACCESS_TOKEN_KEY = "pos_token";
const REFRESH_TOKEN_KEY = "pos_refresh_token";
const USER_ROLE_KEY = "pos_user_role";
const USER_INFO_KEY = "pos_user_info";
const DEVICE_ID_KEY = "pos_device_id";

const ACCESS_COOKIE_NAME = "pos_token";
const REFRESH_COOKIE_NAME = "pos_refresh_token";
const ROLE_COOKIE_NAME = "pos_user_role";

function getCookieOptions(maxAgeSeconds = 86400) {
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  return `; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure}`;
}

function setBrowserCookie(name, value, maxAgeSeconds = 86400) {
  if (!isBrowser()) return;
  document.cookie = `${name}=${encodeURIComponent(value)}${getCookieOptions(maxAgeSeconds)}`;
}

function clearBrowserCookie(name) {
  if (!isBrowser()) return;
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

function syncAuthCookies({ accessToken, refreshToken, role }) {
  if (accessToken) {
    setBrowserCookie(ACCESS_COOKIE_NAME, accessToken);
  }
  if (refreshToken) {
    setBrowserCookie(REFRESH_COOKIE_NAME, refreshToken, 7 * 24 * 60 * 60);
  }
  if (typeof role === "string") {
    setBrowserCookie(ROLE_COOKIE_NAME, role);
  }
}

function getClientIpFallback() {
  return "127.0.0.1";
}

function getOrCreateDeviceId() {
  if (typeof window === "undefined") {
    return "web-ssr";
  }

  const existingDeviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (existingDeviceId) {
    return existingDeviceId;
  }

  const generated = `web-${crypto.randomUUID()}`;
  localStorage.setItem(DEVICE_ID_KEY, generated);
  return generated;
}

function normalizeUserForClient(user) {
  return {
    ...user,
    picture: user?.picture || null,
    name: `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
      user?.email ||
      user?.mobile ||
      "User",
    restaurant_id: user?.restaurant_id || null,
    branch_id: user?.branch_id || null,
  };
}

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

// Media URL helper (used by profile pages)
export function getMediaUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** Prefer uploaded avatar, then Google/external picture URL. */
export function getUserAvatarUrl(user) {
  if (!user) return null;
  if (user.profile_image) {
    return getMediaUrl(user.profile_image);
  }
  const external = user.picture || user.avatar || user.image;
  return external ? getMediaUrl(external) : null;
}

function saveSession({ access_token, refresh_token, user }) {
  if (!isBrowser()) return;
  localStorage.setItem(ACCESS_TOKEN_KEY, access_token);
  if (refresh_token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
  }

  const normalizedUser = normalizeUserForClient(user);
  localStorage.setItem(USER_ROLE_KEY, normalizedUser.role || "");
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(normalizedUser));
  syncAuthCookies({
    accessToken: access_token,
    refreshToken: refresh_token,
    role: normalizedUser.role || "",
  });
}

function clearSession() {
  if (!isBrowser()) return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_ROLE_KEY);
  localStorage.removeItem(USER_INFO_KEY);
  clearBrowserCookie(ACCESS_COOKIE_NAME);
  clearBrowserCookie(REFRESH_COOKIE_NAME);
  clearBrowserCookie(ROLE_COOKIE_NAME);
}

function extractApiError(error, fallbackMessage) {
  const data = error?.response?.data;

  if (typeof data?.message === "string") {
    return data.message;
  }

  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (data && typeof data === "object") {
    const messages = [];

    const collectMessages = (value) => {
      if (typeof value === "string") {
        messages.push(value);
        return;
      }

      if (Array.isArray(value)) {
        value.forEach(collectMessages);
        return;
      }

      if (value && typeof value === "object") {
        Object.values(value).forEach(collectMessages);
      }
    };

    Object.values(data).forEach(collectMessages);

    const uniqueMessages = [...new Set(messages.filter(Boolean))];
    if (uniqueMessages.length > 0) {
      return uniqueMessages.join(". ");
    }
  }

  return fallbackMessage;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Shared HTTP client for feature services/hooks
export const httpClient = api;

function buildGoogleOAuthUrl(nextPath = "/oauth/callback") {
  if (typeof window === "undefined") {
    return `${API_BASE_URL}/auth/oauth/google/start/?next=${encodeURIComponent(
      `http://localhost:3000${nextPath}`,
    )}`;
  }

  const callbackUrl = `${window.location.origin}${nextPath}`;
  return `${API_BASE_URL}/auth/oauth/google/start/?next=${encodeURIComponent(callbackUrl)}`;
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearSession();
    }
    return Promise.reject(error);
  },
);

// Auth service functions
export const authService = {
  getGoogleOAuthUrl: buildGoogleOAuthUrl,

  // Login with email
  loginWithEmail: async (email, password) => {
    try {
      const response = await api.post("/auth/login/email/", {
        email,
        password,
        device_id: getOrCreateDeviceId(),
        device_type: "WEB",
        ip_address: getClientIpFallback(),
      });

      saveSession(response.data);

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: extractApiError(error, "Login failed"),
      };
    }
  },

  // Restaurant login (email/password)
  restaurantLogin: async (payload) => {
    try {
      const response = await api.post("/api/restaurant/login", {
        ...payload,
        device_id: getOrCreateDeviceId(),
        device_type: "WEB",
        ip_address: getClientIpFallback(),
      });

      saveSession(response.data);

      return { success: true, data: response.data };
    } catch (error) {
      if (error?.response?.status === 404) {
        return {
          success: false,
          error: "No restaurant account found with these credentials. Please sign up first.",
        };
      }

      return {
        success: false,
        error: extractApiError(error, "Restaurant login failed"),
      };
    }
  },

  // Login with mobile
  loginWithMobile: async (mobile, password) => {
    try {
      const response = await api.post("/auth/login/mobile/", {
        mobile,
        password,
        device_id: getOrCreateDeviceId(),
        device_type: "WEB",
        ip_address: getClientIpFallback(),
      });

      saveSession(response.data);

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: extractApiError(error, "Login failed"),
      };
    }
  },

  // Send OTP
  sendOTP: async (mobile) => {
    try {
      const response = await api.post("/auth/otp/send/", {
        mobile,
      });

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: extractApiError(error, "Failed to send OTP"),
      };
    }
  },

  // Verify OTP
  verifyOTP: async (mobile, otp, rememberDevice = false) => {
    try {
      const response = await api.post("/auth/otp/verify/", {
        mobile,
        otp,
        device_id: rememberDevice
          ? `${getOrCreateDeviceId()}-remembered`
          : getOrCreateDeviceId(),
        device_type: "WEB",
        ip_address: getClientIpFallback(),
      });

      saveSession(response.data);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: extractApiError(error, "OTP verification failed"),
      };
    }
  },

  // Register user
  register: async (payload) => {
    try {
      const response = await api.post("/auth/register/", payload);
      saveSession(response.data);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: extractApiError(error, "Registration failed"),
      };
    }
  },

  // Register restaurant account
  registerRestaurant: async (payload) => {
    try {
      const response = await api.post("/api/restaurant/register", payload);
      saveSession(response.data);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: extractApiError(error, "Restaurant registration failed"),
      };
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await api.post("/auth/password/reset/request/", {
        email,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: extractApiError(error, "Failed to send reset email"),
      };
    }
  },

  // Reset password
  resetPassword: async (mobile, otp, newPassword) => {
    try {
      const response = await api.post("/auth/password/reset/confirm/", {
        mobile,
        otp,
        new_password: newPassword,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: extractApiError(error, "Failed to reset password"),
      };
    }
  },

  // Change the authenticated user's password
  changePassword: async (currentPassword, newPassword, confirmNewPassword) => {
    try {
      const response = await api.post("/auth/password/change/", {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_new_password: confirmNewPassword,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: extractApiError(error, "Failed to change password"),
      };
    }
  },

  // Refresh token
  refreshAccessToken: async () => {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        return { success: false, error: "No refresh token found" };
      }

      const response = await api.post("/auth/token/refresh/", {
        refresh_token: refreshToken,
      });

      localStorage.setItem(ACCESS_TOKEN_KEY, response.data.access_token);
      syncAuthCookies({ accessToken: response.data.access_token });
      return { success: true, data: response.data };
    } catch (error) {
      clearSession();
      return {
        success: false,
        error: extractApiError(error, "Failed to refresh session"),
      };
    }
  },

  // Logout
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        await api.post("/auth/logout/", {
          refresh_token: refreshToken,
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearSession();
      window.location.href = "/login";
    }
  },

  // Check if email is available (auth-wide)
  checkEmailUnique: async (email) => {
    try {
      // Create a separate axios instance without the 401 redirect interceptor
      const checkEmailApi = axios.create({
        baseURL: API_BASE_URL,
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await checkEmailApi.get("/auth/check-email/", {
        params: { email },
      });
      const data = response.data ?? {};
      const raw =
        data.is_available ?? data.isAvailable ?? data.available;
      if (typeof raw !== "boolean") {
        return {
          success: false,
          isAvailable: true,
          error: "Unexpected email check response",
        };
      }

      return { success: true, isAvailable: raw };
    } catch (error) {
      // On any network/server error treat as unknown — don't block the user
      return {
        success: false,
        isAvailable: true,
        error: extractApiError(error, "Failed to check email"),
      };
    }
  },

  // Verify token and refresh local user info
  verifyToken: async () => {
    try {
      const response = await api.get("/auth/me/");
      const normalizedUser = normalizeUserForClient(response.data.user);
      localStorage.setItem(USER_ROLE_KEY, normalizedUser.role || "");
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(normalizedUser));
      syncAuthCookies({ role: normalizedUser.role || "" });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: extractApiError(error, "Token verification failed"),
      };
    }
  },

  // Update the authenticated user profile
  updateProfile: async (payload) => {
    try {
      const response = await api.patch("/auth/me/update/", payload, {
        headers:
          typeof FormData !== "undefined" && payload instanceof FormData
            ? { "Content-Type": undefined }
            : undefined,
      });
      const normalizedUser = normalizeUserForClient(response.data.user);
      localStorage.setItem(USER_ROLE_KEY, normalizedUser.role || "");
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(normalizedUser));
      syncAuthCookies({ role: normalizedUser.role || "" });
      return { success: true, data: normalizedUser };
    } catch (error) {
      return {
        success: false,
        error: extractApiError(error, "Failed to save profile"),
      };
    }
  },

  // Fetch the authenticated user profile (used by /dashboard/account)
  getProfile: async () => {
    try {
      const response = await api.get("/auth/me/");
      const normalizedUser = normalizeUserForClient(response.data.user);
      if (isBrowser()) {
        localStorage.setItem(USER_ROLE_KEY, normalizedUser.role || "");
        localStorage.setItem(USER_INFO_KEY, JSON.stringify(normalizedUser));
        syncAuthCookies({ role: normalizedUser.role || "" });
      }
      return { success: true, data: normalizedUser };
    } catch (error) {
      return {
        success: false,
        error: extractApiError(error, "Failed to load profile"),
      };
    }
  },

  // Get current user
  getCurrentUser: () => {
    if (!isBrowser()) return null;
    try {
      const userInfo = localStorage.getItem(USER_INFO_KEY);
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error("Error parsing user info:", error);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    if (!isBrowser()) return false;
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    return !!token;
  },

  // Get user role
  getUserRole: () => {
    if (!isBrowser()) return null;
    return localStorage.getItem(USER_ROLE_KEY);
  },

  // Get user info
  getUserInfo: () => {
    if (!isBrowser()) return null;
    const userInfo = localStorage.getItem(USER_INFO_KEY);
    return userInfo ? JSON.parse(userInfo) : null;
  },

  // Check if user has specific role
  hasRole: (requiredRole) => {
    if (!isBrowser()) return false;
    const userRole = localStorage.getItem(USER_ROLE_KEY);
    return userRole === requiredRole;
  },

  // Check if user has any of the specified roles
  hasAnyRole: (roles) => {
    if (!isBrowser()) return false;
    const userRole = localStorage.getItem(USER_ROLE_KEY);
    return roles.includes(userRole);
  },

  completeOAuthFromQuery: async (searchParams) => {
    const error = searchParams.get("error");
    if (error) {
      return {
        success: false,
        error: decodeURIComponent(error.replace(/\+/g, " ")),
      };
    }

    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");

    if (!accessToken || !refreshToken) {
      return { success: false, error: "Missing OAuth tokens" };
    }

    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    syncAuthCookies({ accessToken, refreshToken });

    const verifyResult = await authService.verifyToken();
    if (!verifyResult.success) {
      clearSession();
      return {
        success: false,
        error: verifyResult.error || "Failed to complete sign in",
      };
    }

    return { success: true, data: verifyResult.data };
  },
};

// Role hierarchy for permission checking
export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  CASHIER: "cashier",
  WAITER: "waiter",
};

// Role permissions
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: ["all"],
  [ROLES.MANAGER]: ["orders", "inventory", "reports", "staff"],
  [ROLES.CASHIER]: ["orders", "payments"],
  [ROLES.WAITER]: ["orders", "tables"],
};

// Permission checker
export const hasPermission = (permission) => {
  const userRole = authService.getUserRole();
  if (!userRole) return false;

  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes("all") || permissions.includes(permission);
};

export default authService;
