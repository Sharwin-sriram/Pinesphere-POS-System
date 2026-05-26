"use client";

import { useState } from "react";
import { ArrowLeft, Check, Mail } from "lucide-react";
import AuthCard from "./AuthCard";
import InputField from "./InputField";
import Loader from "./Loader";
import { authService } from "../lib/authService";

const iconProps = { className: "h-4 w-4", strokeWidth: 1.5 as const };

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
      const result = await authService.forgotPassword(email);
      if (result.success) setIsEmailSent(true);
      else setError(result.error || "Could not send reset email. Try again in a few minutes");
    } catch {
      setError("Could not send reset email. Try again in a few minutes");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter your email and we will send a link to reset your password"
    >
      {!isEmailSent ? (
        <>
          <form onSubmit={handleSubmit} className="space-y-5">
            <InputField
              type="email"
              name="email"
              placeholder="you@restaurant.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              icon={<Mail {...iconProps} />}
              error={error}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex h-10 w-full items-center justify-center rounded-md bg-[var(--color-accent)] font-semibold text-[var(--color-text-inverse)] transition duration-150 hover:bg-[var(--color-accent-hover)] active:scale-[0.97] disabled:opacity-40"
            >
              {isLoading ? <Loader /> : "Send reset link"}
            </button>
          </form>
          <div className="mt-6 text-center">
            <a
              href="/login"
              className="inline-flex items-center gap-2 text-[length:var(--text-sm)] text-[var(--color-blue)] hover:text-[var(--color-blue-hover)]"
            >
              <ArrowLeft {...iconProps} />
              Back to sign in
            </a>
          </div>
        </>
      ) : (
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-[var(--color-success)] bg-[var(--color-success-subtle)]">
            <Check className="h-6 w-6 text-[var(--color-success)]" strokeWidth={1.5} />
          </div>
          <h3 className="text-[length:var(--text-lg)] font-semibold text-[var(--color-text-primary)]">
            Check your email
          </h3>
          <p className="mt-3 text-[length:var(--text-sm)] text-[var(--color-text-secondary)]">
            We sent a reset link to <span className="font-medium text-[var(--color-text-primary)]">{email}</span>
          </p>
          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={() => {
                setIsEmailSent(false);
                setEmail("");
              }}
              className="inline-flex h-10 w-full items-center justify-center rounded-md border border-[var(--color-border)] text-[var(--color-text-primary)] transition duration-150 hover:border-[var(--color-border-hover)]"
            >
              Try another email
            </button>
            <a
              href="/login"
              className="inline-flex items-center justify-center gap-2 text-[length:var(--text-sm)] text-[var(--color-blue)]"
            >
              <ArrowLeft {...iconProps} />
              Back to sign in
            </a>
          </div>
        </div>
      )}
    </AuthCard>
  );
};

export default ForgotPassword;
