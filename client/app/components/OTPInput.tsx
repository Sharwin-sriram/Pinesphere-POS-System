import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  onChange?: (otp: string) => void;
  error?: string;
  disabled?: boolean;
  autoSubmit?: boolean;
}

const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  onComplete,
  onChange,
  error,
  disabled = false,
  autoSubmit = true,
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    if (disabled) return;

    // Only allow single digit
    if (value.length > 1) {
      value = value.slice(-1);
    }

    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Call onChange callback
    const otpString = newOtp.join("");
    onChange?.(otpString);

    // Auto-focus next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (autoSubmit && otpString.length === length && !otpString.includes("")) {
      onComplete(otpString);
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (disabled) return;

    // Handle backspace
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // If current input is empty, focus previous input
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
        onChange?.(newOtp.join(""));
      }
    }

    // Handle arrow keys
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Handle Enter key
    if (e.key === "Enter") {
      const otpString = otp.join("");
      if (otpString.length === length) {
        onComplete(otpString);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain");
    const pastedOtp = pastedData.replace(/\D/g, "").slice(0, length);

    if (pastedOtp.length > 0) {
      const newOtp = new Array(length).fill("");
      for (let i = 0; i < pastedOtp.length; i++) {
        newOtp[i] = pastedOtp[i];
      }
      setOtp(newOtp);
      onChange?.(newOtp.join(""));

      // Focus the next empty input or last input
      const nextEmptyIndex = newOtp.findIndex((val) => val === "");
      const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex;
      inputRefs.current[focusIndex]?.focus();

      // Auto-submit if complete
      if (autoSubmit && pastedOtp.length === length) {
        onComplete(pastedOtp);
      }
    }
  };

  const handleFocus = (index: number) => {
    // Select all text when focusing
    inputRefs.current[index]?.select();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center space-x-3">
        {otp.map((digit, index) => (
          <motion.input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => handleFocus(index)}
            disabled={disabled}
            whileFocus={{ scale: 1.1, y: -2 }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            className={`w-12 h-12 sm:w-14 sm:h-14 text-center text-lg sm:text-xl font-bold bg-white/60 backdrop-blur-sm border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 ${
              error
                ? "border-red-400 focus:ring-red-400 bg-red-50/60 text-red-600"
                : digit
                  ? "border-blue-400 bg-blue-50/60 text-blue-600"
                  : "border-white/40 hover:border-blue-300 text-slate-700"
            } ${
              disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-white/70"
            }`}
          />
        ))}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-red-500 text-sm text-center flex items-center justify-center"
        >
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </motion.div>
      )}

      <div className="text-center">
        <p className="text-slate-500 text-sm">
          Enter the 6-digit code sent to your mobile number
        </p>
        <p className="text-slate-400 text-xs mt-1">
          You can paste the OTP from your messages
        </p>
      </div>
    </div>
  );
};

export default OTPInput;
