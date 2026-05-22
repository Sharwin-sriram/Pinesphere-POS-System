'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiArrowRight } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import AuthCard from './AuthCard';
import PhoneInput from './PhoneInput';
import Loader from './Loader';
import { authService } from '../lib/authService';

const OTPLogin = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const validatePhoneNumber = () => {
    if (!phoneNumber) {
      setError('Mobile number is required');
      return false;
    }
    if (phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return false;
    }
    setError('');
    return true;
  };

  const handleSendOTP = async () => {
    if (!validatePhoneNumber()) return;

    setIsLoading(true);
    
    try {
      // Simulate API call to send OTP
      const result = await authService.sendOTP(phoneNumber);
      
      if (result.success) {
        toast.success('OTP sent successfully!', {
          duration: 3000,
          position: 'top-center',
          style: {
            background: 'rgba(34, 197, 94, 0.9)',
            color: 'white',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
          },
        });
        
        // Navigate to verify OTP page with phone number
        setTimeout(() => {
          router.push(`/verify-otp?phone=${phoneNumber}`);
        }, 1000);
      } else {
        toast.error(result.error || 'Failed to send OTP', {
          duration: 4000,
          position: 'top-center',
          style: {
            background: 'rgba(239, 68, 68, 0.9)',
            color: 'white',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
          },
        });
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: 'rgba(239, 68, 68, 0.9)',
          color: 'white',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = () => {
    router.push('/login');
  };

  return (
    <>
      <Toaster />
      <AuthCard
        title="Login with OTP"
        subtitle="Enter your mobile number to receive a verification code"
      >
        <div className="space-y-6">
          {/* Phone Input */}
          <PhoneInput
            value={phoneNumber}
            onChange={setPhoneNumber}
            error={error}
            disabled={isLoading}
          />

          {/* Send OTP Button */}
          <motion.button
            type="button"
            onClick={handleSendOTP}
            disabled={isLoading || !phoneNumber}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white py-4 px-4 rounded-2xl font-medium hover:from-blue-600 hover:to-cyan-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <Loader />
            ) : (
              <>
                Send OTP
                <FiArrowRight className="ml-2" />
              </>
            )}
          </motion.button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/60 text-slate-500 rounded-full">or</span>
            </div>
          </div>

          {/* Email Login Option */}
          <motion.button
            type="button"
            onClick={handleEmailLogin}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-white/80 backdrop-blur-sm text-slate-700 py-4 px-4 rounded-2xl font-medium hover:bg-white/95 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg border border-white/40"
          >
            <FiMail className="mr-2" />
            Login with Email
          </motion.button>

          {/* Info Text */}
          <div className="text-center space-y-2">
            <p className="text-slate-500 text-sm">
              We'll send a 6-digit verification code to your mobile number
            </p>
            <p className="text-slate-400 text-xs">
              Standard SMS charges may apply
            </p>
          </div>
        </div>
      </AuthCard>
    </>
  );
};

export default OTPLogin;