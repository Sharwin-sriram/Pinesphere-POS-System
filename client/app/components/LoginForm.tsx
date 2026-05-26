"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiMail,
  FiEye,
  FiEyeOff,
  FiLock,
  FiArrowRight,
} from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { MdRestaurant } from "react-icons/md";
import InputField from "./InputField";
import Loader from "./Loader";
import { useToast } from "./Toast";
import { authService } from "../lib/authService";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { success, error, ToastContainer } = useToast();


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

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
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
      const result = await authService.loginWithEmail(
        formData.email,
        formData.password,
      );

      if (result.success) {
        success("Login Successful", "Welcome to PineSphere POS!");

        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      } else {
        error("Login Failed", result.error);
      }
    } catch {
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

              <motion.button
                type="button"
                onClick={() => {
                  window.location.href = authService.getGoogleOAuthUrl("/oauth/callback");
                }}
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="mb-6 flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                <FcGoogle className="text-xl" />
                Continue with Google
                <FiArrowRight className="text-slate-400" />
              </motion.button>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <InputField
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  icon={<FiMail />}
                  error={errors.email}
                />

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

                {/* Role field removed by request */}

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
                <div className="mb-4">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                  >
                    Create an account
                  </Link>
                </div>
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
