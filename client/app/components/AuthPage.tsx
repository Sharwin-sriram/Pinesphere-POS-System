"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiUser,
  FiPhone,
  FiPhoneCall,
  FiArrowRight,
} from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { authService } from "../lib/authService";
import { useToast } from "./Toast";

interface AuthPageProps {
  defaultMode: "login" | "signup";
}

const AuthPage: React.FC<AuthPageProps> = ({ defaultMode }) => {
  const [mode, setMode] = useState<"login" | "signup">(defaultMode);
  const [currentPath, setCurrentPath] = useState<string>("/");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
    firstName: "",
    lastName: "",
    mobile: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { success, error, ToastContainer } = useToast();

  const errorRef = React.useRef(error);
  // keep ref in sync without triggering effect re-runs
  useEffect(() => {
    errorRef.current = error;
  }, [error]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateFromPath = () => {
      const path = window.location.pathname || "/";
      setCurrentPath(path);
      setMode(path === "/signup" ? "signup" : "login");
      setErrors({});
    };

    updateFromPath();
    window.addEventListener("popstate", updateFromPath);

    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get("oauth_error");
    if (oauthError) {
      errorRef.current?.(decodeURIComponent(oauthError));
      params.delete("oauth_error");
      const nextUrl = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
      window.history.replaceState({}, "", nextUrl);
    }

    return () => window.removeEventListener("popstate", updateFromPath);
  // run once on mount; errorRef provides stable access to the latest error fn
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleModeChange = (newMode: "login" | "signup") => {
    setMode(newMode);
    setErrors({});
    if (typeof window !== "undefined") {
      const nextPath = newMode === "signup" ? "/signup" : "/login";
      window.history.pushState({}, "", nextPath);
      setCurrentPath(nextPath);
    }
  };

  const validateLoginForm = () => {
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

  const validateSignupForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^\d{10,15}$/.test(formData.mobile.trim())) {
      newErrors.mobile = "Please enter a valid mobile number";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLoginForm()) return;

    setIsLoading(true);
    try {
      const result = await authService.loginWithEmail(
        formData.email,
        formData.password,
      );

      if (result.success) {
        success("Login Successful", "Welcome back to PineSphere POS!");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1200);
      } else {
        error("Login Failed", result.error || "Invalid email or password");
      }
    } catch {
      error("Login Failed", "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignupForm()) return;

    setIsLoading(true);
    try {
      const result = await authService.register({
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
      });

      if (result.success) {
        success("Account Created", "Welcome to PineSphere POS!");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1200);
      } else {
        error("Signup Failed", result.error || "Unable to create account");
      }
    } catch {
      error("Signup Failed", "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="min-h-screen w-full bg-white flex flex-col md:flex-row overflow-hidden font-sans relative"
      >
        {/* Floating Particles */}
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        <div className="particle particle-4"></div>
        <div className="particle particle-5"></div>
        <div className="particle particle-6"></div>

        {/* Left Banner Section (Fullscreen Left Pane on Desktop) */}
        <div className="hidden md:flex md:w-[40%] relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex-col justify-center overflow-hidden min-h-screen flex-shrink-0">
          {/* Layered Diagonal Background Shapes */}
          <div className="absolute -bottom-1/4 -left-1/4 w-[150%] h-[150%] bg-gradient-to-tr from-blue-500/30 to-purple-600/30 transform rotate-12 pointer-events-none" />
          <div className="absolute -bottom-1/5 -left-1/5 w-[120%] h-[120%] bg-gradient-to-tr from-cyan-400/20 to-blue-500/20 transform rotate-45 shadow-2xl pointer-events-none" />
          <div className="absolute -bottom-1/10 -left-1/10 w-[100%] h-[100%] bg-gradient-to-tr from-purple-500/20 to-indigo-700/20 transform rotate-30 shadow-xl pointer-events-none" />

          {/* Vertically Aligned Tabs sticking out of the right edge */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-end space-y-3 w-full z-20">
            {/* Login Tab Button */}
            <button
              type="button"
              onClick={() => handleModeChange("login")}
              className={`w-[72%] py-4.5 pl-8 pr-6 text-left text-sm font-bold uppercase tracking-widest transition-all relative ${
                mode === "login"
                  ? "bg-white text-blue-600 rounded-l-full shadow-md z-10"
                  : "text-white/70 hover:text-white mr-2"
              }`}
            >
              {mode === "login" && (
                <>
                  <div className="active-tab-curve-top" />
                  <div className="active-tab-curve-bottom" />
                </>
              )}
              Login
            </button>

            {/* Sign Up Tab Button */}
            <button
              type="button"
              onClick={() => handleModeChange("signup")}
              className={`w-[72%] py-4.5 pl-8 pr-6 text-left text-sm font-bold uppercase tracking-widest transition-all relative ${
                mode === "signup"
                  ? "bg-white text-blue-600 rounded-l-full shadow-md z-10"
                  : "text-white/70 hover:text-white mr-2"
              }`}
            >
              {mode === "signup" && (
                <>
                  <div className="active-tab-curve-top" />
                  <div className="active-tab-curve-bottom" />
                </>
              )}
              Sign Up
            </button>
          </div>
        </div>

        {/* Mobile/Tablet Header Banner */}
        <div className="md:hidden w-full h-40 relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 overflow-hidden flex flex-col justify-center px-8 flex-shrink-0">
          <div className="absolute -bottom-1/2 -left-1/4 w-[150%] h-[150%] bg-gradient-to-tr from-cyan-400/20 to-blue-500/20 transform rotate-12 pointer-events-none" />
          <h2 className="text-white text-xl font-bold tracking-wide relative z-10">
            PineSphere POS
          </h2>
          <p className="text-white/70 text-sm mt-1 relative z-10">
            Restaurant Management System
          </p>
        </div>

        {/* Right Form Container (Fullscreen Right Pane on Desktop) */}
        <div className="w-full md:w-[60%] bg-white px-6 py-10 md:px-16 lg:px-24 flex flex-col justify-between relative min-h-screen overflow-y-auto">
          
          {/* Main centered form area */}
          <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center py-6">
            
            {/* Mobile Tab Toggle */}
            <div className="md:hidden flex justify-center bg-slate-100 p-1 rounded-full mb-8 max-w-xs mx-auto w-full">
              <button
                type="button"
                onClick={() => handleModeChange("login")}
                className={`flex-1 py-2 text-center text-sm font-bold uppercase tracking-wider rounded-full transition-all ${
                  mode === "login"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => handleModeChange("signup")}
                className={`flex-1 py-2 text-center text-sm font-bold uppercase tracking-wider rounded-full transition-all ${
                  mode === "signup"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Top Form Section (Logo and Title) */}
            <div className="text-center md:text-left flex flex-col items-center md:items-start mb-8 md:mb-10">
              {/* Interlocking Double Diamond Logo */}
              <div className="mb-2">
                <svg
                  width="72"
                  height="72"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="filter drop-shadow-[0_4px_8px_rgba(59,130,246,0.15)]"
                >
                  <defs>
                    <linearGradient
                      id="logo-grad"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="50%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                  {/* Left Diamond */}
                  <path
                    d="M 42 24 L 66 48 L 42 72 L 18 48 Z"
                    stroke="url(#logo-grad)"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Right Diamond */}
                  <path
                    d="M 58 28 L 82 52 L 58 76 L 34 52 Z"
                    stroke="url(#logo-grad)"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-black uppercase tracking-[0.2em] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mt-1">
                {mode === "login" ? "Login" : "Sign Up"}
              </h1>
            </div>

            {/* Center Form Section with Framer Motion AnimatePresence */}
            <div className="flex-1 flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {mode === "login" && currentPath !== "/signup" && (
                  <motion.form
                    key="login-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleLoginSubmit}
                    className="space-y-8"
                  >
                    {/* Email Input */}
                    <div className="space-y-2">
                      <div
                        className={`border-b ${
                          errors.email
                            ? "border-red-500"
                            : "border-slate-200 focus-within:border-blue-500"
                        } py-2.5 flex items-center space-x-3 transition-colors`}
                      >
                        <FiMail
                          className={`${
                            errors.email ? "text-red-500" : "text-slate-400"
                          } text-lg`}
                        />
                        <input
                          type="email"
                          name="email"
                          placeholder="Email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="bg-transparent border-none outline-none flex-1 text-slate-800 placeholder-slate-400 text-base py-1"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-sm text-red-500">{errors.email}</p>
                      )}
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                      <div
                        className={`border-b ${
                          errors.password
                            ? "border-red-500"
                            : "border-slate-200 focus-within:border-blue-500"
                        } py-2.5 flex items-center space-x-3 transition-colors relative`}
                      >
                        <FiLock
                          className={`${
                            errors.password ? "text-red-500" : "text-slate-400"
                          } text-xl w-5 h-5 inline-block flex-shrink-0`}
                        />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          placeholder="Password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="bg-transparent border-none outline-none flex-1 text-slate-800 placeholder-slate-400 text-base py-1 pr-8"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-1 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-red-500">{errors.password}</p>
                      )}
                    </div>

                    {/* Remember Me and Forgot Password */}
                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center space-x-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          name="rememberMe"
                          checked={formData.rememberMe}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-500 group-hover:text-slate-700 transition-colors font-medium">
                          Remember me
                        </span>
                      </label>
                      <a
                        href="/forgot-password"
                        className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                      >
                        Forgot Password?
                      </a>
                    </div>

                    {/* Actions Row */}
                    <div className="flex justify-end items-center pt-2">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-transparent border border-blue-500 text-blue-600 font-bold py-3 px-8 rounded-md hover:bg-blue-600 hover:text-white transition-all text-sm uppercase tracking-wider disabled:opacity-50 flex items-center space-x-2"
                      >
                        <span>{isLoading ? "Loading..." : "Login"}</span>
                        {!isLoading && <FiArrowRight className="text-sm" />}
                      </button>
                    </div>
                  </motion.form>
                )}
                {mode === "signup" && currentPath === "/signup" && (
                  <motion.form
                    key="signup-form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleSignupSubmit}
                      className="space-y-6"
                  >
                    {/* Name Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* First Name */}
                      <div className="space-y-2">
                        <div
                          className={`border-b ${
                            errors.firstName
                              ? "border-red-500"
                              : "border-slate-200 focus-within:border-blue-500"
                          } py-1.5 flex items-center space-x-3 transition-colors`}
                        >
                          <FiUser
                            className={`${
                              errors.firstName
                                ? "text-red-500"
                                : "text-slate-400"
                            } text-lg`}
                          />
                          <input
                            type="text"
                            name="firstName"
                            placeholder="First Name"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="bg-transparent border-none outline-none flex-1 text-slate-800 placeholder-slate-400 text-base py-1"
                          />
                        </div>
                        {errors.firstName && (
                          <p className="text-sm text-red-500">
                            {errors.firstName}
                          </p>
                        )}
                      </div>

                      {/* Last Name */}
                      <div className="space-y-2">
                        <div
                          className={`border-b ${
                            errors.lastName
                              ? "border-red-500"
                              : "border-slate-200 focus-within:border-blue-500"
                          } py-1.5 flex items-center space-x-3 transition-colors`}
                        >
                          <FiUser
                            className={`${
                              errors.lastName ? "text-red-500" : "text-slate-400"
                            } text-lg`}
                          />
                          <input
                            type="text"
                            name="lastName"
                            placeholder="Last Name"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="bg-transparent border-none outline-none flex-1 text-slate-800 placeholder-slate-400 text-base py-1"
                          />
                        </div>
                        {errors.lastName && (
                          <p className="text-sm text-red-500">
                            {errors.lastName}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Email and Mobile Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Email */}
                      <div className="space-y-2">
                        <div
                          className={`border-b ${
                            errors.email
                              ? "border-red-500"
                              : "border-slate-200 focus-within:border-blue-500"
                          } py-1.5 flex items-center space-x-3 transition-colors`}
                        >
                          <FiMail
                            className={`${
                              errors.email ? "text-red-500" : "text-slate-400"
                            } text-lg`}
                          />
                          <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="bg-transparent border-none outline-none flex-1 text-slate-800 placeholder-slate-400 text-base py-1"
                          />
                        </div>
                        {errors.email && (
                          <p className="text-sm text-red-500">{errors.email}</p>
                        )}
                      </div>

                      {/* Mobile */}
                      <div className="space-y-2">
                        <div
                          className={`border-b ${
                            errors.mobile
                              ? "border-red-500"
                              : "border-slate-200 focus-within:border-blue-500"
                          } py-1.5 flex items-center space-x-3 transition-colors`}
                        >
                          <FiPhone
                            className={`${
                              errors.mobile ? "text-red-500" : "text-slate-400"
                            } text-lg`}
                          />
                          <input
                            type="tel"
                            name="mobile"
                            placeholder="Mobile Number"
                            value={formData.mobile}
                            onChange={handleInputChange}
                            className="bg-transparent border-none outline-none flex-1 text-slate-800 placeholder-slate-400 text-base py-1"
                          />
                        </div>
                        {errors.mobile && (
                          <p className="text-sm text-red-500">
                            {errors.mobile}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Password Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Password */}
                      <div className="space-y-2">
                        <div
                          className={`border-b ${
                            errors.password
                              ? "border-red-500"
                              : "border-slate-200 focus-within:border-blue-500"
                          } py-1.5 flex items-center space-x-3 transition-colors relative`}
                        >
                          <FiLock
                            className={`${
                              errors.password ? "text-red-500" : "text-slate-400"
                            } text-xl w-5 h-5 inline-block flex-shrink-0`}
                          />
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="bg-transparent border-none outline-none flex-1 text-slate-800 placeholder-slate-400 text-base py-1 pr-8"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-1 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {showPassword ? <FiEyeOff /> : <FiEye />}
                          </button>

                        </div>
                        {errors.password && (
                          <p className="text-sm text-red-500">{errors.password}</p>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div className="space-y-2">
                        <div
                          className={`border-b ${
                            errors.confirmPassword
                              ? "border-red-500"
                              : "border-slate-200 focus-within:border-blue-500"
                          } py-1.5 flex items-center space-x-3 transition-colors relative`}
                        >
                          <FiLock
                            className={`${
                              errors.confirmPassword
                                ? "text-red-500"
                                : "text-slate-400"
                            } text-xl w-5 h-5 inline-block flex-shrink-0`}
                          />
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="bg-transparent border-none outline-none flex-1 text-slate-800 placeholder-slate-400 text-base py-1 pr-8"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-1 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-sm text-red-500">
                            {errors.confirmPassword}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="flex justify-end items-center pt-4">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="star-button"
                      >
                        <span>{isLoading ? "Loading..." : "Register"}</span>
                        {!isLoading && <FiArrowRight className="text-sm relative z-10" />}
                        
                        <div className="star-1">
                          <svg xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" version="1.1" viewBox="0 0 784.11 815.53">
                            <defs />
                            <g id="Layer_x0020_1">
                              <path className="star-path" d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93,-210.06 184.09,-378.37 392.05,-407.74 -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z" />
                            </g>
                          </svg>
                        </div>
                        <div className="star-2">
                          <svg xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" version="1.1" viewBox="0 0 784.11 815.53">
                            <defs />
                            <g id="Layer_x0020_1">
                              <path className="star-path" d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93,-210.06 184.09,-378.37 392.05,-407.74 -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z" />
                            </g>
                          </svg>
                        </div>
                        <div className="star-3">
                          <svg xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" version="1.1" viewBox="0 0 784.11 815.53">
                            <defs />
                            <g id="Layer_x0020_1">
                              <path className="star-path" d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93,-210.06 184.09,-378.37 392.05,-407.74 -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z" />
                            </g>
                          </svg>
                        </div>
                        <div className="star-4">
                          <svg xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" version="1.1" viewBox="0 0 784.11 815.53">
                            <defs />
                            <g id="Layer_x0020_1">
                              <path className="star-path" d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93,-210.06 184.09,-378.37 392.05,-407.74 -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z" />
                            </g>
                          </svg>
                        </div>
                        <div className="star-5">
                          <svg xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" version="1.1" viewBox="0 0 784.11 815.53">
                            <defs />
                            <g id="Layer_x0020_1">
                              <path className="star-path" d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93,-210.06 184.09,-378.37 392.05,-407.74 -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z" />
                            </g>
                          </svg>
                        </div>
                        <div className="star-6">
                          <svg xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" version="1.1" viewBox="0 0 784.11 815.53">
                            <defs />
                            <g id="Layer_x0020_1">
                              <path className="star-path" d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93,-210.06 184.09,-378.37 392.05,-407.74 -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z" />
                            </g>
                          </svg>
                        </div>
                      </button>
                    </div>

                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom Social Banner centered */}
          <div className="max-w-md mx-auto w-full border-t border-slate-100 pt-6 mt-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              Or Login with
            </span>
            <div className="flex items-center space-x-3">
              {/* Google Sign-in */}
              <button
                type="button"
                onClick={() => {
                  window.location.href =
                    authService.getGoogleOAuthUrl("/oauth/callback");
                }}
                className="flex items-center space-x-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 cursor-pointer"
              >
                <FcGoogle className="text-base" />
                <span>Google</span>
              </button>

              {/* Mobile/OTP Login Option */}
              <button
                type="button"
                onClick={() => (window.location.href = "/otp-login")}
                className="flex items-center space-x-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 cursor-pointer"
              >
                <FiPhoneCall className="text-slate-500 text-base" />
                <span>OTP Login</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default AuthPage;

