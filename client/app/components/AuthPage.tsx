"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  PhoneCall,
  User,
  UtensilsCrossed,
} from "lucide-react";
import GoogleIcon from "./auth/GoogleIcon";
import InputField from "./InputField";
import Loader from "./Loader";
import { authService } from "../lib/authService";
import { useToast } from "./Toast";
import { getRoleHomePath } from "../lib/authRoutes";

const iconProps = { className: "h-4 w-4", strokeWidth: 1.5 as const };

interface AuthPageProps {
  defaultMode: "login" | "signup";
}

const AuthPage: React.FC<AuthPageProps> = ({ defaultMode }) => {
  const [mode, setMode] = useState<"login" | "signup">(defaultMode);
  const [currentPath, setCurrentPath] = useState<string>("/");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
    firstName: "",
    lastName: "",
    mobile: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { success, error, ToastContainer } = useToast();
  const errorRef = React.useRef(error);

  useEffect(() => {
    errorRef.current = error;
  }, [error]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateFromPath = () => {
      const path = window.location.pathname || "/";
      setCurrentPath(path);
      setMode(path === "/signup" ? "signup" : "login");
      setErrors({});
    };

    updateFromPath();
    window.addEventListener("popstate", updateFromPath);

    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get("oauth_error");
    if (oauthError) {
      errorRef.current?.(decodeURIComponent(oauthError));
      params.delete("oauth_error");
      const nextUrl = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
      window.history.replaceState({}, "", nextUrl);
    }

    return () => window.removeEventListener("popstate", updateFromPath);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleModeChange = (newMode: "login" | "signup") => {
    setMode(newMode);
    setErrors({});
    if (typeof window !== "undefined") {
      const nextPath = newMode === "signup" ? "/signup" : "/login";
      window.history.pushState({}, "", nextPath);
      setCurrentPath(nextPath);
    }
  };

  const validateLoginForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Please enter a valid email";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignupForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Please enter a valid email";
    if (!formData.mobile.trim()) newErrors.mobile = "Mobile number is required";
    else if (!/^\d{10,15}$/.test(formData.mobile.trim())) newErrors.mobile = "Please enter a valid mobile number";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (formData.confirmPassword !== formData.password) newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLoginForm()) return;
    setIsLoading(true);
    try {
      const result = await authService.loginWithEmail(formData.email, formData.password);
      if (result.success) {
        success("Signed in", "Welcome back to Pinesphere POS");
        setTimeout(() => {
          window.location.href = getRoleHomePath(authService.getUserRole());
        }, 1200);
      } else {
        error("Sign in failed", result.error || "Invalid email or password");
      }
    } catch {
      error("Sign in failed", "Something went wrong. Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignupForm()) return;
    setIsLoading(true);
    try {
      const result = await authService.register({
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
      });
      if (result.success) {
        success("Account created", "Welcome to Pinesphere POS");
        setTimeout(() => {
          window.location.href = getRoleHomePath(authService.getUserRole());
        }, 1200);
      } else {
        error("Create account failed", result.error || "Unable to create account");
      }
    } catch {
      error("Create account failed", "Something went wrong. Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  const tabClass = (active: boolean) =>
    [
      "flex-1 rounded-lg py-3 text-center text-[length:var(--text-base)] font-semibold transition duration-150",
      active
        ? "bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] shadow-sm"
        : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
    ].join(" ");

  return (
    <>
      <ToastContainer />
      <div className="flex min-h-screen bg-[var(--color-bg-primary)] font-[family-name:var(--font-ui)]">
        <aside className="hidden w-[40%] flex-shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-10 md:flex">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)]">
            <UtensilsCrossed className="h-6 w-6 text-[var(--color-accent)]" strokeWidth={1.5} />
          </div>
          <h2 className="text-[length:var(--text-2xl)] font-semibold tracking-tight text-[var(--color-text-primary)]">
            Pinesphere POS
          </h2>
          <p className="mt-2 text-[length:var(--text-base)] text-[var(--color-text-secondary)]">
            Restaurant management for orders, staff, and inventory.
          </p>
          <div className="mt-[1em] flex flex-col gap-[1em]">
            <button type="button" onClick={() => handleModeChange("login")} className={tabClass(mode === "login")}>
              Sign in
            </button>
            <button type="button" onClick={() => handleModeChange("signup")} className={tabClass(mode === "signup")}>
              Create account
            </button>
          </div>
        </aside>

        <main className="flex min-h-screen w-full flex-1 flex-col justify-center overflow-y-auto px-6 py-10 md:px-16 lg:px-24">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 flex gap-3 md:hidden">
              <button type="button" onClick={() => handleModeChange("login")} className={tabClass(mode === "login")}>
                Sign in
              </button>
              <button type="button" onClick={() => handleModeChange("signup")} className={tabClass(mode === "signup")}>
                Create account
              </button>
            </div>

            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] md:hidden">
                <UtensilsCrossed className="h-5 w-5 text-[var(--color-accent)]" strokeWidth={1.5} />
              </div>
              <h1 className="text-[length:var(--text-xl)] font-semibold text-[var(--color-text-primary)]">
                {mode === "login" ? "Sign in" : "Create account"}
              </h1>
            </div>

            <AnimatePresence mode="wait">
              {mode === "login" && currentPath !== "/signup" && (
                <motion.form
                  key="login-form"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleLoginSubmit}
                  className="space-y-4"
                >
                  <InputField
                    type="email"
                    name="email"
                    placeholder="you@restaurant.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    icon={<Mail {...iconProps} />}
                    error={errors.email}
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
                      className="absolute right-3 top-2.5 text-[var(--color-text-muted)]"
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
                        className="h-4 w-4 accent-[var(--color-accent)]"
                      />
                      Remember me
                    </label>
                    <a href="/forgot-password" className="text-[length:var(--text-sm)] text-[var(--color-blue)]">
                      Forgot password
                    </a>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[var(--color-accent)] font-semibold text-[var(--color-text-inverse)] transition duration-150 hover:bg-[var(--color-accent-hover)] active:scale-[0.97] disabled:opacity-40"
                  >
                    {isLoading ? <Loader /> : (
                      <>
                        Sign in
                        <ArrowRight {...iconProps} />
                      </>
                    )}
                  </button>
                </motion.form>
              )}

              {mode === "signup" && currentPath === "/signup" && (
                <motion.form
                  key="signup-form"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSignupSubmit}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      type="text"
                      name="firstName"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      icon={<User {...iconProps} />}
                      error={errors.firstName}
                    />
                    <InputField
                      type="text"
                      name="lastName"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      icon={<User {...iconProps} />}
                      error={errors.lastName}
                    />
                  </div>
                  <InputField
                    type="email"
                    name="email"
                    placeholder="you@restaurant.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    icon={<Mail {...iconProps} />}
                    error={errors.email}
                  />
                  <InputField
                    type="tel"
                    name="mobile"
                    placeholder="e.g. 9876543210"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    icon={<Phone {...iconProps} />}
                    error={errors.mobile}
                  />
                  <div className="relative">
                    <InputField
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Create password"
                      value={formData.password}
                      onChange={handleInputChange}
                      icon={<Lock {...iconProps} />}
                      error={errors.password}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-[var(--color-text-muted)]"
                    >
                      {showPassword ? <EyeOff {...iconProps} /> : <Eye {...iconProps} />}
                    </button>
                  </div>
                  <div className="relative">
                    <InputField
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      icon={<Lock {...iconProps} />}
                      error={errors.confirmPassword}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-[var(--color-text-muted)]"
                    >
                      {showConfirmPassword ? <EyeOff {...iconProps} /> : <Eye {...iconProps} />}
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[var(--color-accent)] font-semibold text-[var(--color-text-inverse)] transition duration-150 hover:bg-[var(--color-accent-hover)] active:scale-[0.97] disabled:opacity-40"
                  >
                    {isLoading ? <Loader /> : (
                      <>
                        Create account
                        <ArrowRight {...iconProps} />
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="mt-8 border-t border-[var(--color-border)] pt-6">
              <p className="mb-4 text-[length:var(--text-xs)] font-medium uppercase tracking-widest text-[var(--color-text-muted)]">
                Or continue with
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = authService.getGoogleOAuthUrl("/oauth/callback");
                  }}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md border border-[var(--color-border)] px-4 text-[length:var(--text-sm)] font-medium text-[var(--color-text-primary)] transition duration-150 hover:border-[var(--color-border-hover)]"
                >
                  <GoogleIcon />
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "/otp-login";
                  }}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md border border-[var(--color-border)] px-4 text-[length:var(--text-sm)] font-medium text-[var(--color-text-primary)] transition duration-150 hover:border-[var(--color-border-hover)]"
                >
                  <PhoneCall className="h-4 w-4" strokeWidth={1.5} />
                  OTP sign in
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default AuthPage;
