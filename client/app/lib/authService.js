import axios from "axios";

// Base API configuration - use Next.js API routes
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("pos_token");
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
      // Token expired or invalid
      localStorage.removeItem("pos_token");
      localStorage.removeItem("pos_user_role");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Auth service functions
export const authService = {
  // Login with username
  loginWithUsername: async (username, password, role) => {
    try {
      const response = await api.post("/auth/login", {
        username,
        password,
        role,
        loginType: "username",
      });

      const { token, user } = response.data;

      // Store token and user info
      localStorage.setItem("pos_token", token);
      localStorage.setItem("pos_user_role", user.role);
      localStorage.setItem("pos_user_info", JSON.stringify(user));

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  },

  // Login with email
  loginWithEmail: async (email, password, role) => {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
        role,
        loginType: "email",
      });

      const { token, user } = response.data;

      // Store token and user info
      localStorage.setItem("pos_token", token);
      localStorage.setItem("pos_user_role", user.role);
      localStorage.setItem("pos_user_info", JSON.stringify(user));

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  },

  // Login with mobile
  loginWithMobile: async (mobile, password, role) => {
    try {
      const response = await api.post("/auth/login", {
        mobile,
        password,
        role,
        loginType: "mobile",
      });

      const { token, user } = response.data;

      // Store token and user info
      localStorage.setItem("pos_token", token);
      localStorage.setItem("pos_user_role", user.role);
      localStorage.setItem("pos_user_info", JSON.stringify(user));

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  },

  // Send OTP
  sendOTP: async (phoneNumber) => {
    try {
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber,
          countryCode: "+91",
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to send OTP");
      }
      
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to send OTP",
      };
    }
  },

  // Verify OTP
  verifyOTP: async (phoneNumber, otp, rememberDevice = false) => {
    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: `+91${phoneNumber}`,
          otp,
          rememberDevice,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "OTP verification failed");
      }

      const { token, user } = data.data;

      // Store token and user info
      localStorage.setItem("pos_token", token);
      localStorage.setItem("pos_user_role", user.role);
      localStorage.setItem("pos_user_info", JSON.stringify(user));

      return { success: true, data: data.data };
    } catch (error) {
      return {
        success: false,
        error: error.message || "OTP verification failed",
      };
    }
  },
  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await api.post("/auth/forgot-password", { email });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to send reset email",
      };
    }
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post("/auth/reset-password", {
        token,
        newPassword,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to reset password",
      };
    }
  },

  // Logout
  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem("pos_token");
      localStorage.removeItem("pos_user_role");
      localStorage.removeItem("pos_user_info");
      window.location.href = "/login";
    }
  },

  // Verify token
  verifyToken: async () => {
    try {
      const response = await api.get("/auth/verify");
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Token verification failed",
      };
    }
  },

  // Get current user
  getCurrentUser: () => {
    try {
      const userInfo = localStorage.getItem("pos_user_info");
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error("Error parsing user info:", error);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem("pos_token");
    return !!token;
  },

  // Get user role
  getUserRole: () => {
    return localStorage.getItem("pos_user_role");
  },

  // Check if user has specific role
  hasRole: (requiredRole) => {
    const userRole = localStorage.getItem("pos_user_role");
    return userRole === requiredRole;
  },

  // Check if user has any of the specified roles
  hasAnyRole: (roles) => {
    const userRole = localStorage.getItem("pos_user_role");
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
