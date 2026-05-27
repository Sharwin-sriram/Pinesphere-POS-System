"use client";

import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import AuthShell from "./auth/AuthShell";
import GoogleIcon from "./auth/GoogleIcon";
import InputField from "./InputField";
import Loader from "./Loader";
import { useToast } from "./Toast";
import { authService } from "../lib/authService";
import { getRoleHomePath } from "../lib/authRoutes";

const iconProps = { className: "h-4 w-4", strokeWidth: 1.5 as const };

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: "", password: "", rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { success, error, ToastContainer } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Please enter a valid email";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const result = await authService.loginWithEmail(formData.email, formData.password);
      if (result.success) {
        success("Signed in", "Welcome to Pinesphere POS");
        setTimeout(() => {
          window.location.href = getRoleHomePath(authService.getUserRole());
        }, 1500);
      } else {
        error("Sign in failed", result.error || "Check your email and password, then try again");
      }
    } catch {
      error("Sign in failed", "Something went wrong. Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <AuthShell title="Sign in" subtitle="Access your POS dashboard">
        <div className="mb-6 text-center">
          <button
            type="button"
            onClick={() => {
              window.location.href = "/otp-login";
            }}
            className="text-[length:var(--text-sm)] font-medium text-[var(--color-blue)] transition duration-150 hover:text-[var(--color-blue-hover)]"
          >
            Sign in with OTP instead
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <InputField
            type="text"
            name="email"
            placeholder="you@restaurant.com"
            value={formData.email}
            onChange={handleInputChange}
            icon={<Mail {...iconProps} />}
            error={errors.email}
            autoComplete="email"
            inputMode="email"
            autoCapitalize="off"
            spellCheck={false}
          />

          <div className="relative">
            <InputField
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              icon={<Lock {...iconProps} />}
              error={errors.password}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff {...iconProps} /> : <Eye {...iconProps} />}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-[length:var(--text-sm)] text-[var(--color-text-secondary)]">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="h-4 w-4 rounded-sm border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] accent-[var(--color-accent)]"
              />
              Remember me
            </label>
            <a
              href="/forgot-password"
              className="text-[length:var(--text-sm)] text-[var(--color-blue)] hover:text-[var(--color-blue-hover)]"
            >
              Forgot password
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-[var(--color-accent)] text-[length:var(--text-base)] font-semibold text-[var(--color-text-inverse)] transition duration-150 hover:bg-[var(--color-accent-hover)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isLoading ? <Loader /> : "Sign in"}
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--color-border)]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[var(--color-bg-secondary)] px-3 text-[length:var(--text-xs)] font-medium uppercase tracking-widest text-[var(--color-text-muted)]">
                Or
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              window.location.href = authService.getGoogleOAuthUrl("/oauth/callback");
            }}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-[var(--color-border)] bg-transparent text-[length:var(--text-base)] font-medium text-[var(--color-text-primary)] transition duration-150 hover:border-[var(--color-border-hover)]"
          >
            <GoogleIcon />
            Sign in with Google
            <ArrowRight className="h-4 w-4 text-[var(--color-text-muted)]" strokeWidth={1.5} />
          </button>
        </form>

        <p className="mt-6 text-center text-[length:var(--text-sm)] text-[var(--color-text-secondary)]">
          No account yet?{" "}
          <a href="/signup" className="font-medium text-[var(--color-blue)] hover:text-[var(--color-blue-hover)]">
            Create account
          </a>
        </p>
      </AuthShell>
    </>
  );
};

export default LoginForm;
