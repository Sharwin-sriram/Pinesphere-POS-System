"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiMail,
  FiPhone,
  FiEye,
  FiEyeOff,
  FiLock,
  FiUser,
  FiChevronDown,
} from "react-icons/fi";
import { MdRestaurant } from "react-icons/md";
import InputField from "./InputField";
import Loader from "./Loader";
import { useToast } from "./Toast";
import { authService } from "../lib/authService";

const LoginForm = () => {
  const [loginType, setLoginType] = useState("email");
  const [formData, setFormData] = useState({
    email: "",
    mobile: "",
    password: "",
    role: "cashier",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { success, error, ToastContainer } = useToast();

  const roles = [
    { value: "admin", label: "Admin" },
    { value: "manager", label: "Manager" },
    { value: "cashier", label: "Cashier" },
    { value: "waiter", label: "Waiter" },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (loginType === "email") {
      if (!formData.email) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Please enter a valid email";
      }
    } else {
      if (!formData.mobile) {
        newErrors.mobile = "Mobile number is required";
      } else if (!/^\d{10}$/.test(formData.mobile)) {
        newErrors.mobile = "Please enter a valid 10-digit mobile number";
      }
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      let result;

      if (loginType === "email") {
        result = await authService.loginWithEmail(
          formData.email,
          formData.password,
          formData.role,
        );
      } else {
        result = await authService.loginWithMobile(
          formData.mobile,
          formData.password,
          formData.role,
        );
      }

      if (result.success) {
        success("Login Successful", "Welcome to PineSphere POS!");

        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      } else {
        error("Login Failed", result.error);
      }
    } catch (err) {
      error("Login Failed", "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex relative overflow-hidden">
        {/* Floating Particles */}
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        <div className="particle particle-4"></div>
        <div className="particle particle-5"></div>
        <div className="particle particle-6"></div>

        {/* Background Pattern */}
        <div className="absolute inset-0 bg-pattern-light"></div>

        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-center items-center p-12"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="mb-8 floating"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl floating-slow">
                <MdRestaurant className="text-4xl text-white" />
              </div>
              <h1 className="text-4xl font-bold text-slate-800 mb-2 gradient-text-light">
                PineSphere POS
              </h1>
              <p className="text-blue-600 text-lg font-medium">
                Restaurant Management System
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-4 floating-delayed"
            >
              <h2 className="text-2xl text-slate-700 font-light">
                Welcome Back
              </h2>
              <p className="text-slate-600 max-w-md">
                Access your restaurant management dashboard. Streamline
                operations, manage orders, and enhance customer experience with
                our lightweight, floating interface.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-12 grid grid-cols-3 gap-8 text-center"
            >
              <motion.div className="floating" style={{ animationDelay: "0s" }}>
                <div className="text-2xl font-bold text-blue-500">24/7</div>
                <div className="text-sm text-slate-500">Support</div>
              </motion.div>
              <motion.div
                className="floating"
                style={{ animationDelay: "-2s" }}
              >
                <div className="text-2xl font-bold text-cyan-500">99.9%</div>
                <div className="text-sm text-slate-500">Uptime</div>
              </motion.div>
              <motion.div
                className="floating"
                style={{ animationDelay: "-4s" }}
              >
                <div className="text-2xl font-bold text-purple-500">500+</div>
                <div className="text-sm text-slate-500">Restaurants</div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10"
        >
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <motion.div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4 floating">
                <MdRestaurant className="text-2xl text-white" />
              </motion.div>
              <h1 className="text-2xl font-bold gradient-text-light">
                PineSphere POS
              </h1>
            </div>

            {/* Login Form Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-3xl p-8 shadow-2xl floating-slow"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  Sign In
                </h2>
                <p className="text-slate-600">Access your POS dashboard</p>
              </div>

              {/* Login Type Toggle */}
              <div className="flex bg-white/60 backdrop-blur-sm rounded-2xl p-1 mb-6 border border-white/40">
                <button
                  type="button"
                  onClick={() => setLoginType("email")}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                    loginType === "email"
                      ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg transform scale-105"
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  <FiMail className="inline mr-2" />
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setLoginType("mobile")}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                    loginType === "mobile"
                      ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg transform scale-105"
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  <FiPhone className="inline mr-2" />
                  Mobile
                </button>
              </div>

              {/* OTP Login Option */}
              <div className="text-center mb-6">
                <motion.button
                  type="button"
                  onClick={() => (window.location.href = "/otp-login")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="text-blue-500 hover:text-blue-600 text-sm font-medium transition-colors"
                >
                  Login with OTP instead →
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email/Mobile Input */}
                {loginType === "email" ? (
                  <InputField
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    icon={<FiMail />}
                    error={errors.email}
                  />
                ) : (
                  <InputField
                    type="tel"
                    name="mobile"
                    placeholder="Enter mobile number"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    icon={<FiPhone />}
                    error={errors.mobile}
                  />
                )}

                {/* Password Input */}
                <div className="relative">
                  <InputField
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    icon={<FiLock />}
                    error={errors.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>

                {/* Role Selector */}
                <div className="relative">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full bg-white/60 backdrop-blur-sm border border-white/40 rounded-2xl px-4 py-4 pl-12 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 appearance-none"
                  >
                    {roles.map((role) => (
                      <option
                        key={role.value}
                        value={role.value}
                        className="bg-white"
                      >
                        {role.label}
                      </option>
                    ))}
                  </select>
                  <FiUser className="absolute left-4 top-5 text-slate-500" />
                  <FiChevronDown className="absolute right-4 top-5 text-slate-500" />
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-500 bg-white/60 border-white/40 rounded focus:ring-blue-400 focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-slate-600">
                      Remember me
                    </span>
                  </label>
                  <a
                    href="/forgot-password"
                    className="text-sm text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>

                {/* Submit Error */}
                {errors.submit && (
                  <div className="text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded-2xl p-3">
                    {errors.submit}
                  </div>
                )}

                {/* Login Button */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white py-4 px-4 rounded-2xl font-medium hover:from-blue-600 hover:to-cyan-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl"
                >
                  {isLoading ? <Loader /> : "Sign In"}
                </motion.button>
              </form>

              {/* Footer */}
              <div className="mt-8 text-center">
                <p className="text-slate-500 text-sm">
                  Need help? Contact{" "}
                  <a
                    href="mailto:support@pinesphere.com"
                    className="text-blue-500 hover:text-blue-600"
                  >
                    support@pinesphere.com
                  </a>
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default LoginForm;
