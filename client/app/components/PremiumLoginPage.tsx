"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiShield,
  FiClock,
  FiUsers,
  FiArrowRight,
} from "react-icons/fi";
import { MdRestaurant } from "react-icons/md";

const PremiumLoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Login attempt:", formData);
  };

  // Floating particles animation
  const particles = Array.from({ length: 20 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
      animate={{
        x: [0, Math.random() * 100 - 50],
        y: [0, Math.random() * 100 - 50],
        opacity: [0, 1, 0],
      }}
      transition={{
        duration: Math.random() * 3 + 2,
        repeat: Infinity,
        delay: Math.random() * 2,
      }}
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
    />
  ));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-2xl" />
        
        {/* Floating Particles */}
        {particles}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left Section - Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-lg"
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/25">
                <MdRestaurant className="text-3xl text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                PineSphere POS
              </h1>
              <p className="text-lg text-slate-600 font-medium">
                Restaurant Management System
              </p>
            </motion.div>

            {/* Welcome Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-12"
            >
              <h2 className="text-2xl font-semibold text-slate-800 mb-4">
                Welcome Back
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Access your restaurant management dashboard. Streamline operations, 
                manage orders, and enhance customer experience with our lightweight, 
                floating interface.
              </p>
            </motion.div>

            {/* Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="grid grid-cols-3 gap-8 mb-12"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl flex items-center justify-center mx-auto mb-3 border border-blue-200/50">
                  <FiClock className="text-blue-600" size={20} />
                </div>
                <div className="text-2xl font-bold text-slate-800">24/7</div>
                <div className="text-sm text-slate-600">Support</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-3 border border-cyan-200/50">
                  <FiShield className="text-cyan-600" size={20} />
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">99.9%</div>
                <div className="text-sm text-slate-600">Uptime</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl flex items-center justify-center mx-auto mb-3 border border-purple-200/50">
                  <FiUsers className="text-purple-600" size={20} />
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">500+</div>
                <div className="text-sm text-slate-600">Restaurants</div>
              </div>
            </motion.div>

            {/* Dashboard Illustration Placeholder */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="relative"
            >
              <div className="w-full h-48 bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-sm rounded-2xl border border-white/30 shadow-2xl shadow-slate-200/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="text-xs text-slate-500">Dashboard Preview</div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gradient-to-r from-blue-200/60 to-cyan-200/60 rounded-full w-3/4"></div>
                  <div className="h-4 bg-gradient-to-r from-purple-200/60 to-pink-200/60 rounded-full w-1/2"></div>
                  <div className="h-4 bg-gradient-to-r from-green-200/60 to-emerald-200/60 rounded-full w-2/3"></div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Section - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full max-w-md"
          >
            {/* Glassmorphism Login Card */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-slate-200/50 border border-white/50 relative overflow-hidden">
              {/* Card Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/20 to-white/10"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-transparent rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/10 to-transparent rounded-full blur-xl"></div>

              <div className="relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Sign In</h3>
                  <p className="text-slate-600">Access your POS dashboard</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Input */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3 bg-white/50 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-slate-800 placeholder-slate-400"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-12 py-3 bg-white/50 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-slate-800 placeholder-slate-400"
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Role field removed by request */}

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        formData.rememberMe 
                          ? 'bg-blue-500 border-blue-500' 
                          : 'bg-white/50 border-slate-300'
                      }`}>
                        {formData.rememberMe && <FiCheck className="text-white" size={12} />}
                      </div>
                      <span className="text-sm text-slate-600">Remember me</span>
                    </label>
                    <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
                      Forgot password?
                    </a>
                  </div>

                  {/* Login Button */}
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 flex items-center justify-center space-x-2 group"
                  >
                    <span>Sign In to Dashboard</span>
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                  </motion.button>
                </form>

                {/* Additional Links */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-slate-600">
                    Need help? Contact{" "}
                    <a href="#" className="text-blue-600 hover:text-blue-700 transition-colors">
                      support
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile Logo (visible on small screens) */}
            <div className="lg:hidden text-center mt-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-blue-500/25">
                <MdRestaurant className="text-2xl text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                PineSphere POS
              </h1>
              <p className="text-slate-600">Restaurant Management System</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PremiumLoginPage;
