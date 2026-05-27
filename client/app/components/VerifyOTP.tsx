"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Check, Clock, RefreshCw, Shield, Smartphone } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import AuthCard from "./AuthCard";
import OTPInput from "./OTPInput";
import Loader from "./Loader";
import authService from "../lib/authService";
import { authToastError, authToastSuccess } from "./auth/authToast";
import { getRoleHomePath } from "../lib/authRoutes";

const iconProps = { className: "h-4 w-4", strokeWidth: 1.5 as const };

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

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    setCanResend(true);
  }, [countdown]);

  const formatPhoneNumber = (phone: string) => {
    if (phone.length <= 3) return phone;
    if (phone.length <= 6) return `${phone.slice(0, 3)} ${phone.slice(3)}`;
    return `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const verifyOTP = async (otpValue: string) => {
    setIsLoading(true);
    setError("");
    try {
      const result = await authService.verifyOTP(phoneNumber, otpValue, rememberDevice);
      if (result.success) {
        setIsVerified(true);
        toast.success("OTP verified", authToastSuccess);
        setTimeout(() => router.push(getRoleHomePath(authService.getUserRole())), 1500);
      } else {
        setError(result.error || "Invalid code. Check the message and try again");
        toast.error(result.error || "Invalid code", authToastError);
      }
    } catch {
      const message = "Verification failed. Try again in a moment";
      setError(message);
      toast.error(message, authToastError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPComplete = async (otpValue: string) => {
    setOtp(otpValue);
    await verifyOTP(otpValue);
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setError("");
    try {
      const result = await authService.sendOTP(phoneNumber);
      if (result.success) {
        setCountdown(60);
        setCanResend(false);
        toast.success("New code sent", authToastSuccess);
      } else {
        toast.error(result.error || "Could not resend code", authToastError);
      }
    } catch {
      toast.error("Could not resend code", authToastError);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      <Toaster />
      <AuthCard
        title="Verify code"
        subtitle={`Enter the 6-digit code sent to +91 ${formatPhoneNumber(phoneNumber)}`}
      >
        <div className="space-y-5">
          <div className="flex items-center justify-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] p-4">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-md ${
                isVerified
                  ? "bg-[var(--color-success-subtle)] text-[var(--color-success)]"
                  : "bg-[var(--color-bg-secondary)] text-[var(--color-blue)]"
              }`}
            >
              {isVerified ? <Check className="h-5 w-5" strokeWidth={1.5} /> : <Shield className="h-5 w-5" strokeWidth={1.5} />}
            </div>
            <div>
              <p className="text-[length:var(--text-base)] font-semibold text-[var(--color-text-primary)]">
                {isVerified ? "Verification complete" : "Enter your code"}
              </p>
              <p className="text-[length:var(--text-sm)] text-[var(--color-text-secondary)]">
                {isVerified ? "Redirecting to dashboard" : "Code expires in a few minutes"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-4 py-3">
            <Smartphone className="h-4 w-4 text-[var(--color-text-muted)]" strokeWidth={1.5} />
            <span className="font-mono text-[length:var(--text-base)] font-medium text-[var(--color-text-primary)]">
              +91 {formatPhoneNumber(phoneNumber)}
            </span>
          </div>

          <OTPInput onChange={setOtp} onComplete={handleOTPComplete} error={error} disabled={isLoading || isVerified} />

          <div className="text-center">
            {!canResend ? (
              <p className="flex items-center justify-center gap-2 text-[length:var(--text-sm)] text-[var(--color-text-secondary)]">
                <Clock {...iconProps} />
                Resend code in{" "}
                <span className="font-mono font-semibold text-[var(--color-text-primary)]">{formatTime(countdown)}</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isResending || isVerified}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[var(--color-border)] px-5 text-[length:var(--text-sm)] font-medium text-[var(--color-text-primary)] transition duration-150 hover:border-[var(--color-border-hover)] disabled:opacity-40"
              >
                {isResending ? <Loader /> : (
                  <>
                    <RefreshCw {...iconProps} />
                    Resend code
                  </>
                )}
              </button>
            )}
          </div>

          <label className="flex cursor-pointer items-center justify-center gap-2 text-[length:var(--text-sm)] text-[var(--color-text-secondary)]">
            <input
              type="checkbox"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
              disabled={isVerified}
              className="h-4 w-4 rounded-sm border border-[var(--color-border)] accent-[var(--color-accent)]"
            />
            Remember this device
          </label>

          <button
            type="button"
            onClick={() => router.push("/otp-login")}
            disabled={isLoading || isVerified}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-[var(--color-border)] text-[var(--color-text-primary)] transition duration-150 hover:border-[var(--color-border-hover)] disabled:opacity-40"
          >
            <ArrowLeft {...iconProps} />
            Back to phone number
          </button>
        </div>
      </AuthCard>
    </>
  );
};

export default VerifyOTP;
