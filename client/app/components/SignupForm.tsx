"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiMail, FiPhone, FiEye, FiEyeOff, FiLock, FiUser, FiArrowRight } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { MdRestaurant } from "react-icons/md";
import InputField from "./InputField";
import Loader from "./Loader";
import { useToast } from "./Toast";
import { authService } from "../lib/authService";

const SignupForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { success, error, ToastContainer } = useToast();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

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
        window.location.href = "/dashboard";
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex relative overflow-hidden">
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        <div className="particle particle-4"></div>
        <div className="absolute inset-0 bg-pattern-light"></div>

        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-center items-center p-12"
        >
          <div className="text-center">
            <div className="mb-8 floating">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl floating-slow">
                <MdRestaurant className="text-4xl text-white" />
              </div>
              <h1 className="text-4xl font-bold text-slate-800 mb-2 gradient-text-light">
                PineSphere POS
              </h1>
              <p className="text-blue-600 text-lg font-medium">
                Create your restaurant account
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10"
        >
          <div className="w-full max-w-md">
            <div className="lg:hidden text-center mb-8">
              <motion.div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4 floating">
                <MdRestaurant className="text-2xl text-white" />
              </motion.div>
              <h1 className="text-2xl font-bold gradient-text-light">
                PineSphere POS
              </h1>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-3xl p-8 shadow-2xl floating-slow"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  Create Account
                </h2>
                <p className="text-slate-600">Sign up to get started</p>
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

              <form onSubmit={handleSubmit} className="space-y-4">
                <InputField type="text" name="firstName" placeholder="First name" value={formData.firstName} onChange={handleInputChange} icon={<FiUser />} error={errors.firstName} />
                <InputField type="text" name="lastName" placeholder="Last name" value={formData.lastName} onChange={handleInputChange} icon={<FiUser />} error={errors.lastName} />
                <InputField type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleInputChange} icon={<FiMail />} error={errors.email} />
                <InputField type="tel" name="mobile" placeholder="Enter mobile number" value={formData.mobile} onChange={handleInputChange} icon={<FiPhone />} error={errors.mobile} />

                <div className="relative">
                  <InputField type={showPassword ? "text" : "password"} name="password" placeholder="Create password" value={formData.password} onChange={handleInputChange} icon={<FiLock />} error={errors.password} />
                  <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute right-4 top-4 text-slate-500 hover:text-slate-700 transition-colors">
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>

                <div className="relative">
                  <InputField type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm password" value={formData.confirmPassword} onChange={handleInputChange} icon={<FiLock />} error={errors.confirmPassword} />
                  <button type="button" onClick={() => setShowConfirmPassword((prev) => !prev)} className="absolute right-4 top-4 text-slate-500 hover:text-slate-700 transition-colors">
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white py-4 px-4 rounded-2xl font-medium hover:from-blue-600 hover:to-cyan-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl"
                >
                  {isLoading ? <Loader /> : "Create Account"}
                </motion.button>

                <div className="text-center">
                  <a href="/login" className="text-sm text-blue-500 hover:text-blue-600 transition-colors font-medium">
                    Already have an account? Sign in
                  </a>
                </div>
              </form>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default SignupForm;