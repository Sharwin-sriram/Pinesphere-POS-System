"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiMail,
  FiArrowRight,
  FiSmartphone,
  FiShield,
  FiClock,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import AuthCard from "./AuthCard";
import PhoneInput from "./PhoneInput";
import Loader from "./Loader";
import { authService } from "../lib/authService";

const OTPLogin = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [demoOtp, setDemoOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const router = useRouter();

  const validatePhoneNumber = () => {
    if (!phoneNumber) {
      setError("Mobile number is required");
      return false;
    }
    if (phoneNumber.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return false;
    }
    setError("");
    return true;
  };

  const handleSendOTP = async () => {
    if (!validatePhoneNumber()) return;

    setIsLoading(true);

    try {
      // Call API to send OTP
      const result = await authService.sendOTP(phoneNumber);

      if (result.success) {
        setOtpSent(true);

        // Store demo OTP if in demo mode
        if (result.data?.data?.demoOtp) {
          setDemoOtp(result.data.data.demoOtp);
        }

        toast.success("📱 OTP sent successfully!", {
          duration: 4000,
          position: "top-center",
          style: {
            background:
              "linear-gradient(135deg, rgba(34, 197, 94, 0.95), rgba(16, 185, 129, 0.95))",
            color: "white",
            borderRadius: "16px",
            backdropFilter: "blur(20px)",
            fontSize: "16px",
            fontWeight: "600",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          },
        });

        // Navigate to verify OTP page with phone number
        setTimeout(() => {
          window.location.href = `/verify-otp?phone=${phoneNumber}`;
        }, 2000);
      } else {
        toast.error(result.error || "Failed to send OTP", {
          duration: 4000,
          position: "top-center",
          style: {
            background:
              "linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95))",
            color: "white",
            borderRadius: "16px",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          },
        });
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.", {
        duration: 4000,
        position: "top-center",
        style: {
          background:
            "linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95))",
          color: "white",
          borderRadius: "16px",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = () => {
    window.location.href = "/login";
  };

  return (
    <>
      <Toaster />
      <AuthCard
        title="OTP Login"
        subtitle="Enter your mobile number to receive a verification code"
      >
        <div className="space-y-6">
          {/* Security Features */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 gap-3 mb-6"
          >
            {/* Feature badges removed per design request */}
          </motion.div>

          {/* Phone Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <PhoneInput
              value={phoneNumber}
              onChange={setPhoneNumber}
              error={error}
              disabled={isLoading}
            />
          </motion.div>

          {/* Demo Mode OTP Display */}
          {demoOtp && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="relative bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-6 overflow-hidden"
            >
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-200/30 to-yellow-200/30 rounded-full -translate-y-10 translate-x-10" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-amber-200/20 to-yellow-200/20 rounded-full translate-y-8 -translate-x-8" />

              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">🧪</span>
                  </div>
                  <p className="text-sm font-bold text-amber-800">
                    Demo Mode - Test OTP
                  </p>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-amber-200/50">
                  <p className="text-3xl font-bold text-amber-700 tracking-[0.3em] text-center font-mono">
                    {demoOtp}
                  </p>
                </div>

                <p className="text-xs text-amber-600 text-center mt-3 flex items-center justify-center gap-1">
                  <FiClock className="w-3 h-3" />
                  Valid for 1 minute
                </p>
              </div>
            </motion.div>
          )}

          {/* Send OTP Button */}
          <motion.button
            type="button"
            onClick={handleSendOTP}
            disabled={isLoading || !phoneNumber || otpSent}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`w-full py-4 px-6 rounded-2xl font-semibold focus:outline-none focus:ring-4 focus:ring-blue-400/30 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl relative overflow-hidden group ${
              otpSent
                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                : "bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:from-blue-600 hover:to-cyan-500"
            } ${
              (isLoading || !phoneNumber) && !otpSent
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {/* Button background animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

            <div className="relative flex items-center justify-center">
              {isLoading ? (
                <Loader />
              ) : otpSent ? (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="w-5 h-5 mr-2"
                  >
                    ✓
                  </motion.div>
                  OTP Sent Successfully
                </>
              ) : (
                <>
                  <FiSmartphone className="mr-2" />
                  Send OTP
                  <FiArrowRight className="ml-2" />
                </>
              )}
            </div>
          </motion.button>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="relative"
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-6 py-2 bg-white/80 backdrop-blur-sm text-slate-500 rounded-full border border-slate-200/50">
                or continue with
              </span>
            </div>
          </motion.div>

          {/* Email Login Option */}
          <motion.button
            type="button"
            onClick={handleEmailLogin}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="w-full bg-white/90 backdrop-blur-sm text-slate-700 py-4 px-6 rounded-2xl font-semibold hover:bg-white focus:outline-none focus:ring-4 focus:ring-slate-400/30 transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg border border-slate-200/50 group relative overflow-hidden"
          >
            {/* Button background animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-50/0 via-slate-100/50 to-slate-50/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

            <div className="relative flex items-center">
              <FiMail className="mr-2" />
              Login with Email
            </div>
          </motion.button>

          {/* Enhanced info block removed per request */}
        </div>
      </AuthCard>
    </>
  );
};

export default OTPLogin;
