"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiArrowLeft, FiRefreshCw, FiCheck, FiClock, FiShield, FiSmartphone } from "react-icons/fi";
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import AuthCard from "./AuthCard";
import OTPInput from "./OTPInput";
import Loader from "./Loader";
import { authService } from "../lib/authService";

const VerifyOTP = () => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneNumber = searchParams.get("phone") || "";

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const formatPhoneNumber = (phone: string) => {
    if (phone.length <= 3) return phone;
    if (phone.length <= 6) return `${phone.slice(0, 3)} ${phone.slice(3)}`;
    return `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOTPComplete = async (otpValue: string) => {
    setOtp(otpValue);
    await verifyOTP(otpValue);
  };

  const verifyOTP = async (otpValue: string) => {
    setIsLoading(true);
    setError("");

    try {
      const result = await authService.verifyOTP(phoneNumber, otpValue, rememberDevice);

      if (result.success) {
        setIsVerified(true);
        
        toast.success("🎉 OTP verified successfully!", {
          duration: 3000,
          position: "top-center",
          style: {
            background: "linear-gradient(135deg, rgba(34, 197, 94, 0.95), rgba(16, 185, 129, 0.95))",
            color: "white",
            borderRadius: "16px",
            backdropFilter: "blur(20px)",
            fontSize: "16px",
            fontWeight: "600",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          },
        });

        // Redirect to dashboard after success
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 2000);
      } else {
        setError(result.error || "Invalid OTP. Please try again.");
        toast.error(result.error || "Invalid OTP. Please try again.", {
          duration: 4000,
          position: "top-center",
          style: {
            background: "linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95))",
            color: "white",
            borderRadius: "16px",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          },
        });
      }
    } catch (err) {
      const errorMessage = "Verification failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center",
        style: {
          background: "linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95))",
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

  const handleResendOTP = async () => {
    setIsResending(true);
    setError("");

    try {
      const result = await authService.sendOTP(phoneNumber);

      if (result.success) {
        setCountdown(60);
        setCanResend(false);
        
        toast.success("📱 New OTP sent successfully!", {
          duration: 3000,
          position: "top-center",
          style: {
            background: "linear-gradient(135deg, rgba(34, 197, 94, 0.95), rgba(16, 185, 129, 0.95))",
            color: "white",
            borderRadius: "16px",
            backdropFilter: "blur(20px)",
            fontSize: "16px",
            fontWeight: "600",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          },
        });
      } else {
        toast.error(result.error || "Failed to resend OTP", {
          duration: 4000,
          position: "top-center",
          style: {
            background: "linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95))",
            color: "white",
            borderRadius: "16px",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          },
        });
      }
    } catch (err) {
      toast.error("Failed to resend OTP. Please try again.", {
        duration: 4000,
        position: "top-center",
        style: {
          background: "linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95))",
          color: "white",
          borderRadius: "16px",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        },
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleBack = () => {
    window.location.href = "/otp-login";
  };

  return (
    <>
      <Toaster />
      <AuthCard
        title="Verify OTP"
        subtitle={`Enter the 6-digit code sent to +91 ${formatPhoneNumber(phoneNumber)}`}
      >
        <div className="space-y-6">
          {/* Status Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-4 mb-6"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
              isVerified 
                ? "bg-green-500 text-white" 
                : "bg-blue-100 text-blue-600"
            }`}>
              {isVerified ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <FiCheck className="w-6 h-6" />
                </motion.div>
              ) : (
                <FiShield className="w-6 h-6" />
              )}
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-700">
                {isVerified ? "Verification Complete!" : "Secure Verification"}
              </p>
              <p className="text-sm text-slate-500">
                {isVerified ? "Redirecting to dashboard..." : "Enter your OTP below"}
              </p>
            </div>
          </motion.div>

          {/* Phone Number Display */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100"
          >
            <div className="flex items-center justify-center gap-3">
              <FiSmartphone className="w-5 h-5 text-blue-600" />
              <span className="font-mono text-lg font-semibold text-blue-700">
                +91 {formatPhoneNumber(phoneNumber)}
              </span>
            </div>
          </motion.div>

          {/* OTP Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <OTPInput
              value={otp}
              onChange={setOtp}
              onComplete={handleOTPComplete}
              error={error}
              disabled={isLoading || isVerified}
            />
          </motion.div>

          {/* Timer and Resend */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center space-y-3"
          >
            {!canResend ? (
              <div className="flex items-center justify-center gap-2 text-slate-600">
                <FiClock className="w-4 h-4" />
                <span className="text-sm">
                  Resend OTP in <span className="font-mono font-semibold text-blue-600">{formatTime(countdown)}</span>
                </span>
              </div>
            ) : (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleResendOTP}
                disabled={isResending || isVerified}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-4 focus:ring-orange-400/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {isResending ? (
                  <Loader />
                ) : (
                  <>
                    <FiRefreshCw className="w-4 h-4" />
                    Resend OTP
                  </>
                )}
              </motion.button>
            )}
          </motion.div>

          {/* Remember Device */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-3"
          >
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberDevice}
                onChange={(e) => setRememberDevice(e.target.checked)}
                disabled={isVerified}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-sm text-slate-600">Remember this device</span>
            </label>
          </motion.div>

          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={handleBack}
            disabled={isLoading || isVerified}
            whileHover={{ scale: 1.02, x: -2 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-white/90 backdrop-blur-sm text-slate-700 py-4 px-6 rounded-2xl font-semibold hover:bg-white focus:outline-none focus:ring-4 focus:ring-slate-400/30 transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg border border-slate-200/50 group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {/* Button background animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-50/0 via-slate-100/50 to-slate-50/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            
            <div className="relative flex items-center">
              <FiArrowLeft className="mr-2" />
              Back to Phone Number
            </div>
          </motion.button>

          {/* Security Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center space-y-2 pt-2"
          >
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-4 border border-slate-100">
              <p className="text-slate-600 text-sm font-medium mb-2">
                🔒 Your verification code expires in 1 minute
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <FiShield className="w-3 h-3" />
                  Encrypted
                </span>
                <span className="flex items-center gap-1">
                  <FiClock className="w-3 h-3" />
                  One-time use
                </span>
                <span>Secure login</span>
              </div>
            </div>
          </motion.div>
        </div>
      </AuthCard>
    </>
  );
};

export default VerifyOTP;