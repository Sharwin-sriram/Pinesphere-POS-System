'use client';

import { ArrowRight, Check, CheckCircle, Info, Key, MessageSquare, Phone, UtensilsCrossed } from "lucide-react";
import React from 'react';
import { motion } from 'framer-motion';



const OTPDemo = () => {
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
 OTP Login Demo
 </h1>
 <p className="text-[var(--color-text-secondary)]">
 How the OTP system works (Testing Mode)
 </p>
 </motion.div>

 {/* Important Notice */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.2 }}
 className="glass-card rounded-2xl p-6 mb-8 border-l-4 border-orange-500"
 >
 <div className="flex items-start">
 <Info className="text-orange-500 mr-3 mt-1 flex-shrink-0" />
 <div>
 <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">Important: Testing Mode</h3>
 <p className="text-[var(--color-text-secondary)] mb-2">
 This is a <strong>demo application</strong>. No real SMS is sent to your phone number. 
 The OTP system is simulated for testing purposes only.
 </p>
 <p className="text-[var(--color-text-secondary)]">
 In a production environment, you would integrate with SMS providers like Twilio, AWS SNS, or similar services.
 </p>
 </div>
 </div>
 </motion.div>

 {/* How it Works */}
 <div className="grid md:grid-cols-3 gap-6 mb-8">
 {/* Step 1 */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.3 }}
 className="glass-card rounded-2xl p-6 text-center floating-slow"
 >
 <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
 <Phone className="text-2xl text-white" />
 </div>
 <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">1. Enter Phone</h3>
 <p className="text-[var(--color-text-secondary)] text-sm">
 Enter your mobile number with country code (+91 for India)
 </p>
 </motion.div>

 {/* Step 2 */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.4 }}
 className="glass-card rounded-2xl p-6 text-center floating-slow"
 >
 <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
 <MessageSquare className="text-2xl text-white" />
 </div>
 <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">2. Receive OTP</h3>
 <p className="text-[var(--color-text-secondary)] text-sm">
 In demo mode, you'll see the OTP: <span className="font-mono font-semibold">123456</span>
 </p>
 </motion.div>

 {/* Step 3 */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.5 }}
 className="glass-card rounded-2xl p-6 text-center floating-slow"
 >
 <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
 <Key className="text-2xl text-white" />
 </div>
 <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">3. Verify OTP</h3>
 <p className="text-[var(--color-text-secondary)] text-sm">
 Enter the 6-digit code to complete login
 </p>
 </motion.div>
 </div>

 {/* Demo Credentials */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.6 }}
 className="glass-card rounded-2xl p-6 mb-8"
 >
 <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center">
 <CheckCircle className="text-green-500 mr-2" />
 Demo Credentials
 </h3>
 <div className="grid md:grid-cols-2 gap-6">
 <div>
 <h4 className="font-medium text-slate-700 mb-2">Phone Number:</h4>
 <p className="text-[var(--color-text-secondary)]">Any 10-digit number</p>
 <p className="text-slate-500 text-sm">Examples: 9876543210, 8765432109, etc.</p>
 </div>
 <div>
 <h4 className="font-medium text-slate-700 mb-2">OTP Code:</h4>
 <p className="text-[var(--color-text-secondary)] font-mono bg-[var(--color-bg-tertiary)] px-3 py-2 rounded text-lg font-semibold">123456</p>
 <p className="text-slate-500 text-sm">Always use this code for testing</p>
 </div>
 </div>
 </motion.div>

 {/* Real Implementation */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.7 }}
 className="glass-card rounded-2xl p-6 mb-8"
 >
 <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Real Implementation</h3>
 <p className="text-[var(--color-text-secondary)] mb-4">
 In a production environment, you would:
 </p>
 <div className="space-y-2 text-[var(--color-text-secondary)]">
 <p className="flex items-center">
 <ArrowRight className="mr-2 text-blue-500" />
 Integrate with SMS providers (Twilio, AWS SNS, Firebase)
 </p>
 <p className="flex items-center">
 <ArrowRight className="mr-2 text-blue-500" />
 Generate random 6-digit OTP codes
 </p>
 <p className="flex items-center">
 <ArrowRight className="mr-2 text-blue-500" />
 Store OTP with expiration time in database
 </p>
 <p className="flex items-center">
 <ArrowRight className="mr-2 text-blue-500" />
 Send actual SMS to user's phone number
 </p>
 <p className="flex items-center">
 <ArrowRight className="mr-2 text-blue-500" />
 Verify OTP against stored value
 </p>
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
 className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-6 py-3 rounded-2xl font-medium hover:from-blue-600 hover:to-cyan-500 transition-all duration-150 hover: flex items-center"
 >
 <Phone className="mr-2" />
 Try OTP Login
 </a>
 <a
 href="/login"
 className="bg-white/80 text-slate-700 px-6 py-3 rounded-2xl font-medium hover:bg-white/95 transition-all duration-150 hover: border border-white/40 flex items-center"
 >
 <Key className="mr-2" />
 Regular Login
 </a>
 <a
 href="/test-guide"
 className="bg-gradient-to-r from-green-500 to-emerald-400 text-white px-6 py-3 rounded-2xl font-medium hover:from-green-600 hover:to-emerald-500 transition-all duration-150 hover: flex items-center"
 >
 <Info className="mr-2" />
 Test Guide
 </a>
 </motion.div>
 </div>
 </div>
 );
};

export default OTPDemo;