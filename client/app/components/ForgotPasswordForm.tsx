"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiMail, FiArrowLeft, FiCheck } from "react-icons/fi";
import { MdRestaurant } from "react-icons/md";
import InputField from "./InputField";
import Loader from "./Loader";
import AuthCard from "./AuthCard";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsEmailSent(true);
    } catch (error) {
      setError("Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  return (
    <>
      <AuthCard
        title="Forgot Password?"
        subtitle="Enter your email address and we'll send you a link to reset your password."
      >
        {!isEmailSent ? (
          <>
            <form onSubmit={handleSubmit} className="space-y-6">
              <InputField
                type="email"
                name="email"
                placeholder="Enter your email address"
                value={email}
                onChange={handleEmailChange}
                icon={<FiMail />}
                error={error}
              />

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 py-3 px-4 rounded-lg font-medium hover:from-amber-200 hover:to-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? <Loader /> : "Send Reset Link"}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <a
                href="/login"
                className="inline-flex items-center text-amber-300 hover:text-amber-200 transition-colors text-sm"
              >
                <FiArrowLeft className="mr-2" />
                Back to Sign In
              </a>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <FiCheck className="text-2xl text-white" />
            </motion.div>

            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Check Your Email
            </h2>
            <p className="text-slate-600 mb-6">
              We've sent a password reset link to <br />
              <span className="text-orange-400 font-medium">{email}</span>
            </p>

            <div className="space-y-4">
              <motion.button
                onClick={() => {
                  setIsEmailSent(false);
                  setEmail("");
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-slate-800 py-3 px-4 rounded-lg font-medium transition-all duration-200"
              >
                Try Another Email
              </motion.button>

              <a
                href="/login"
                className="inline-flex items-center text-amber-300 hover:text-amber-200 transition-colors text-sm"
              >
                <FiArrowLeft className="mr-2" />
                Back to Sign In
              </a>
            </div>
          </motion.div>
        )}
      </AuthCard>
    </>
  );
};

export default ForgotPassword;
