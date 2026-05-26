import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

const ACCESS_TOKEN_KEY = "pos_token";
const REFRESH_TOKEN_KEY = "pos_refresh_token";
const USER_ROLE_KEY = "pos_user_role";
const USER_INFO_KEY = "pos_user_info";
const DEVICE_ID_KEY = "pos_device_id";

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
    name: `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
      user?.email ||
      user?.mobile ||
      "User",
  };
}

function saveSession({ access_token, refresh_token, user }) {
  localStorage.setItem(ACCESS_TOKEN_KEY, access_token);
  if (refresh_token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
  }

  const normalizedUser = normalizeUserForClient(user);
  localStorage.setItem(USER_ROLE_KEY, normalizedUser.role || "");
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(normalizedUser));
}

function clearSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_ROLE_KEY);
  localStorage.removeItem(USER_INFO_KEY);
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
    const fieldMessage = Object.values(data)
      .flat()
      .find((value) => typeof value === "string");
    if (fieldMessage) {
      return fieldMessage;
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
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
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

  // Verify token and refresh local user info
  verifyToken: async () => {
    try {
      const response = await api.get("/auth/me/");
      const normalizedUser = normalizeUserForClient(response.data.user);
      localStorage.setItem(USER_ROLE_KEY, normalizedUser.role || "");
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(normalizedUser));
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: extractApiError(error, "Token verification failed"),
      };
    }
  },

  // Get current user
  getCurrentUser: () => {
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
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    return !!token;
  },

  // Get user role
  getUserRole: () => {
    return localStorage.getItem(USER_ROLE_KEY);
  },

  // Check if user has specific role
  hasRole: (requiredRole) => {
    const userRole = localStorage.getItem(USER_ROLE_KEY);
    return userRole === requiredRole;
  },

  // Check if user has any of the specified roles
  hasAnyRole: (roles) => {
    const userRole = localStorage.getItem(USER_ROLE_KEY);
    return roles.includes(userRole);
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
