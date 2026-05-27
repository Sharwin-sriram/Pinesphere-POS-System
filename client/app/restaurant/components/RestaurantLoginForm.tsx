"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useSearchParams } from "next/navigation";
import AuthShell from "../../components/auth/AuthShell";
import InputField from "../../components/InputField";
import Loader from "../../components/Loader";
import { useToast } from "../../components/Toast";
import { authService } from "../../lib/authService";
import { getRoleHomePath } from "../../lib/authRoutes";

const iconProps = { className: "h-4 w-4", strokeWidth: 1.5 as const };

interface RestaurantLoginFormState {
  email: string;
  password: string;
}

type RestaurantLoginErrors = Partial<Record<keyof RestaurantLoginFormState, string>>;

const RestaurantLoginForm: React.FC = () => {
  const [formData, setFormData] = useState<RestaurantLoginFormState>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<RestaurantLoginErrors>({});
  const { success, error, ToastContainer } = useToast();
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof RestaurantLoginFormState]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateField = (name: keyof RestaurantLoginFormState, value: string): string => {
    if (name === "email") {
      if (!value) return "Email is required";
      if (!/\S+@\S+\.\S+/.test(value)) return "Please enter a valid email";
    }
    if (name === "password") {
      if (!value) return "Password is required";
      if (value.length < 8) return "Password must be at least 8 characters";
    }
    return "";
  };

  const validateForm = (): boolean => {
    const newErrors: RestaurantLoginErrors = {};
    (Object.keys(formData) as (keyof RestaurantLoginFormState)[]).forEach((key) => {
      const message = validateField(key, formData[key]);
      if (message) {
        newErrors[key] = message;
      }
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return false;
    }
    return true;
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldName = name as keyof RestaurantLoginFormState;
    const message = validateField(fieldName, value);
    setErrors((prev) => ({ ...prev, [fieldName]: message }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    try {
      const result = await authService.restaurantLogin({
        email: formData.email,
        password: formData.password,
      });
      if (result.success) {
        success("Signed in", "Welcome to your restaurant dashboard");
        setTimeout(() => {
          const role = authService.getUserRole();
          const redirectPath = role ? getRoleHomePath(role) : "/restaurant/dashboard";
          const safeNext = nextPath && nextPath.startsWith("/") ? nextPath : null;
          window.location.href = safeNext || redirectPath;
        }, 1200);
      } else {
        error("Sign in failed", result.error || "Invalid email or password");
      }
    } catch {
      error("Sign in failed", "Network error. Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <AuthShell title="Restaurant login" subtitle="Access your restaurant dashboard">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="restaurant-login-email"
              className="text-[length:var(--text-sm)] font-medium text-[var(--color-text-secondary)]"
            >
              Email address
            </label>
            <InputField
              id="restaurant-login-email"
              type="text"
              name="email"
              placeholder="you@restaurant.com"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleBlur}
              icon={<Mail {...iconProps} />}
              error={errors.email}
              ref={emailRef}
              autoComplete="email"
              inputMode="email"
              autoCapitalize="off"
              spellCheck={false}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="restaurant-login-password"
              className="text-[length:var(--text-sm)] font-medium text-[var(--color-text-secondary)]"
            >
              Password
            </label>
            <div className="relative">
              <InputField
                id="restaurant-login-password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                onBlur={handleBlur}
                icon={<Lock {...iconProps} />}
                error={errors.password}
                ref={passwordRef}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-2.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff {...iconProps} /> : <Eye {...iconProps} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <a
              href="/restaurant/forgot-password"
              className="ml-auto text-[length:var(--text-sm)] text-[var(--color-blue)] hover:text-[var(--color-blue-hover)]"
            >
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[var(--color-accent)] font-semibold text-[var(--color-text-inverse)] transition duration-150 hover:bg-[var(--color-accent-hover)] active:scale-[0.97] disabled:opacity-40"
          >
            {isLoading ? (
              <Loader />
            ) : (
              <>
                Login
                <ArrowRight {...iconProps} />
              </>
            )}
          </button>

          <p className="mt-4 text-center text-[length:var(--text-sm)] text-[var(--color-text-secondary)]">
            Don&apos;t have an account?{" "}
            <a
              href="/restaurant/signup"
              className="font-medium text-[var(--color-blue)] hover:text-[var(--color-blue-hover)]"
            >
              Sign up
            </a>
          </p>
        </form>
      </AuthShell>
    </>
  );
};

export default RestaurantLoginForm;

