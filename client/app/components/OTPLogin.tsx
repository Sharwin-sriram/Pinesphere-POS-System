"use client";

import { useState } from "react";
import { ArrowRight, Clock, Mail, Smartphone } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import AuthCard from "./AuthCard";
import PhoneInput from "./PhoneInput";
import Loader from "./Loader";
import { authService } from "../lib/authService";
import { authToastError, authToastSuccess } from "./auth/authToast";

const iconProps = { className: "h-4 w-4", strokeWidth: 1.5 as const };

const OTPLogin = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [demoOtp, setDemoOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

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
      const result = await authService.sendOTP(phoneNumber);
      if (result.success) {
        setOtpSent(true);
        if (result.data?.data?.demoOtp) setDemoOtp(result.data.data.demoOtp);
        toast.success("OTP sent to your mobile number", authToastSuccess);
        setTimeout(() => {
          window.location.href = `/verify-otp?phone=${phoneNumber}`;
        }, 1500);
      } else {
        toast.error(result.error || "Could not send OTP. Try again", authToastError);
      }
    } catch {
      toast.error("Could not send OTP. Try again", authToastError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster />
      <AuthCard title="Sign in with OTP" subtitle="Enter your mobile number to receive a verification code">
        <div className="space-y-5">
          <PhoneInput value={phoneNumber} onChange={setPhoneNumber} error={error} disabled={isLoading} />

          {demoOtp ? (
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] p-4">
              <p className="text-[length:var(--text-sm)] font-medium text-[var(--color-text-secondary)]">
                Demo mode test code
              </p>
              <p className="mt-2 text-center font-mono text-[length:var(--text-2xl)] font-semibold tracking-widest text-[var(--color-accent)]">
                {demoOtp}
              </p>
              <p className="mt-2 flex items-center justify-center gap-1 text-[length:var(--text-xs)] text-[var(--color-text-muted)]">
                <Clock className="h-3 w-3" strokeWidth={1.5} />
                Valid for 1 minute
              </p>
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleSendOTP}
            disabled={isLoading || !phoneNumber || otpSent}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[var(--color-accent)] font-semibold text-[var(--color-text-inverse)] transition duration-150 hover:bg-[var(--color-accent-hover)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isLoading ? (
              <Loader />
            ) : otpSent ? (
              "Code sent"
            ) : (
              <>
                <Smartphone {...iconProps} />
                Send verification code
                <ArrowRight {...iconProps} />
              </>
            )}
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--color-border)]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[var(--color-bg-secondary)] px-3 text-[length:var(--text-xs)] uppercase tracking-widest text-[var(--color-text-muted)]">
                Or
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              window.location.href = "/login";
            }}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-[var(--color-border)] text-[var(--color-text-primary)] transition duration-150 hover:border-[var(--color-border-hover)]"
          >
            <Mail {...iconProps} />
            Sign in with email
          </button>
        </div>
      </AuthCard>
    </>
  );
};

export default OTPLogin;
