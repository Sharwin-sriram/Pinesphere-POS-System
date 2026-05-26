'use client';

import { ArrowRight, Check, Info, Key, Phone, UtensilsCrossed } from "lucide-react";
import React from 'react';
import { motion } from 'framer-motion';



const TestGuide = () => {
 return (
 <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
 {/* Floating Particles */}
 <div className="particle particle-1"></div>
 <div className="particle particle-2"></div>
 <div className="particle particle-3"></div>
 <div className="particle particle-4"></div>
 <div className="particle particle-5"></div>
 <div className="particle particle-6"></div>

 {/* Background Pattern */}
 <div className="absolute inset-0 "></div>

 <div className="max-w-4xl mx-auto relative z-10">
 {/* Header */}
 <motion.div
 initial={{ opacity: 0, y: -20 }}
 animate={{ opacity: 1, y: 0 }}
 className="text-center mb-12"
 >
 <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4 floating">
 <UtensilsCrossed className="h-6 w-6 text-[var(--color-accent)]" strokeWidth={1.5} />
 </div>
 <h1 className="text-3xl font-semibold gradient-text-light mb-2">
 PineSphere POS - OTP Testing Guide
 </h1>
 <p className="text-[var(--color-text-secondary)]">
 How to test the OTP login functionality
 </p>
 </motion.div>

 {/* Test Instructions */}
 <div className="grid md:grid-cols-2 gap-8 mb-8">
 {/* Step 1 */}
 <motion.div
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: 0.2 }}
 className="glass-card rounded-2xl p-6 floating-slow"
 >
 <div className="flex items-center mb-4">
 <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
 1
 </div>
 <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Access OTP Login</h3>
 </div>
 <div className="space-y-3 text-[var(--color-text-secondary)]">
 <p className="flex items-center">
 <ArrowRight className="mr-2 text-blue-500" />
 Go to <code className="bg-blue-100 px-2 py-1 rounded text-sm">/otp-login</code>
 </p>
 <p className="flex items-center">
 <ArrowRight className="mr-2 text-blue-500" />
 Or click "Login with OTP instead" from main login
 </p>
 </div>
 </motion.div>

 {/* Step 2 */}
 <motion.div
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: 0.3 }}
 className="glass-card rounded-2xl p-6 floating-slow"
 >
 <div className="flex items-center mb-4">
 <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
 2
 </div>
 <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Enter Phone Number</h3>
 </div>
 <div className="space-y-3 text-[var(--color-text-secondary)]">
 <p className="flex items-center">
 <Phone className="mr-2 text-green-500" />
 Enter any 10-digit number (e.g., 9876543210)
 </p>
 <p className="flex items-center">
 <ArrowRight className="mr-2 text-green-500" />
 Click "Send OTP" button
 </p>
 </div>
 </motion.div>

 {/* Step 3 */}
 <motion.div
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: 0.4 }}
 className="glass-card rounded-2xl p-6 floating-slow"
 >
 <div className="flex items-center mb-4">
 <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
 3
 </div>
 <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Verify OTP</h3>
 </div>
 <div className="space-y-3 text-[var(--color-text-secondary)]">
 <p className="flex items-center">
 <Key className="mr-2 text-purple-500" />
 Enter OTP: <code className="bg-purple-100 px-2 py-1 rounded text-sm font-semibold">123456</code>
 </p>
 <p className="flex items-center">
 <Check className="mr-2 text-purple-500" />
 Auto-submits when complete
 </p>
 </div>
 </motion.div>

 {/* Step 4 */}
 <motion.div
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: 0.5 }}
 className="glass-card rounded-2xl p-6 floating-slow"
 >
 <div className="flex items-center mb-4">
 <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
 4
 </div>
 <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Success!</h3>
 </div>
 <div className="space-y-3 text-[var(--color-text-secondary)]">
 <p className="flex items-center">
 <Check className="mr-2 text-orange-500" />
 Redirects to dashboard
 </p>
 <p className="flex items-center">
 <ArrowRight className="mr-2 text-orange-500" />
 User logged in successfully
 </p>
 </div>
 </motion.div>
 </div>

 {/* Test Credentials */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.6 }}
 className="glass-card rounded-2xl p-6 mb-8"
 >
 <div className="flex items-center mb-4">
 <Info className="text-blue-500 mr-3" />
 <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Test Credentials</h3>
 </div>
 <div className="grid md:grid-cols-2 gap-6">
 <div>
 <h4 className="font-medium text-slate-700 mb-2">Phone Number:</h4>
 <p className="text-[var(--color-text-secondary)]">Any 10-digit number (e.g., 9876543210)</p>
 </div>
 <div>
 <h4 className="font-medium text-slate-700 mb-2">OTP:</h4>
 <p className="text-[var(--color-text-secondary)] font-mono bg-[var(--color-bg-tertiary)] px-3 py-1 rounded">123456</p>
 </div>
 </div>
 </motion.div>

 {/* Features to Test */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.7 }}
 className="glass-card rounded-2xl p-6 mb-8"
 >
 <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Features to Test:</h3>
 <div className="grid md:grid-cols-2 gap-4">
 <div className="space-y-2">
 <p className="flex items-center text-[var(--color-text-secondary)]">
 <Check className="mr-2 text-green-500" />
 Country code selector
 </p>
 <p className="flex items-center text-[var(--color-text-secondary)]">
 <Check className="mr-2 text-green-500" />
 Phone number formatting
 </p>
 <p className="flex items-center text-[var(--color-text-secondary)]">
 <Check className="mr-2 text-green-500" />
 OTP auto-focus next box
 </p>
 <p className="flex items-center text-[var(--color-text-secondary)]">
 <Check className="mr-2 text-green-500" />
 Paste OTP support
 </p>
 </div>
 <div className="space-y-2">
 <p className="flex items-center text-[var(--color-text-secondary)]">
 <Check className="mr-2 text-green-500" />
 Resend OTP countdown
 </p>
 <p className="flex items-center text-[var(--color-text-secondary)]">
 <Check className="mr-2 text-green-500" />
 Remember device option
 </p>
 <p className="flex items-center text-[var(--color-text-secondary)]">
 <Check className="mr-2 text-green-500" />
 Toast notifications
 </p>
 <p className="flex items-center text-[var(--color-text-secondary)]">
 <Check className="mr-2 text-green-500" />
 Loading states
 </p>
 </div>
 </div>
 </motion.div>

 {/* Quick Links */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.8 }}
 className="flex flex-wrap gap-4 justify-center"
 >
 <a
 href="/otp-login"
 className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-6 py-3 rounded-2xl font-medium hover:from-blue-600 hover:to-cyan-500 transition-all duration-150 hover:"
 >
 Test OTP Login
 </a>
 <a
 href="/login"
 className="bg-white/80 text-slate-700 px-6 py-3 rounded-2xl font-medium hover:bg-white/95 transition-all duration-150 hover: border border-white/40"
 >
 Regular Login
 </a>
 <a
 href="/dashboard"
 className="bg-gradient-to-r from-green-500 to-emerald-400 text-white px-6 py-3 rounded-2xl font-medium hover:from-green-600 hover:to-emerald-500 transition-all duration-150 hover:"
 >
 Dashboard
 </a>
 </motion.div>
 </div>
 </div>
 );
};

export default TestGuide;