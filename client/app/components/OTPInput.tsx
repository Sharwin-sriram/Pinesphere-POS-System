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
            transition={{ duration: 0.15 }}
            className={`h-12 w-12 rounded-md border bg-[var(--color-bg-tertiary)] text-center text-[length:var(--text-lg)] font-semibold transition duration-150 focus:outline-none sm:h-14 sm:w-14 sm:text-[length:var(--text-xl)] ${
              error
                ? "border-[var(--color-danger)] text-[var(--color-danger)]"
                : digit
                  ? "border-[var(--color-border-focus)] text-[var(--color-text-primary)]"
                  : "border-[var(--color-border)] text-[var(--color-text-primary)]"
            } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
 />
 ))}
 </div>

 {error && (
 <motion.div
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
        className="flex items-center justify-center text-center text-[length:var(--text-sm)] text-[var(--color-danger)]"
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
        <p className="text-[length:var(--text-sm)] text-[var(--color-text-secondary)]">
          Enter the 6-digit code sent to your mobile number
        </p>
        <p className="mt-1 text-[length:var(--text-xs)] text-[var(--color-text-muted)]">
          You can paste the code from your messages
        </p>
 </div>
 </div>
 );
};

export default OTPInput;
