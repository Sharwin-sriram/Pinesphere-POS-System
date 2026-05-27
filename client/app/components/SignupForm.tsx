"use client";

import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react";
import AuthShell from "./auth/AuthShell";
import GoogleIcon from "./auth/GoogleIcon";
import InputField from "./InputField";
import Loader from "./Loader";
import { useToast } from "./Toast";
import { authService } from "../lib/authService";
import { getRoleHomePath } from "../lib/authRoutes";

const iconProps = { className: "h-4 w-4", strokeWidth: 1.5 as const };

const SignupForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { success, error, ToastContainer } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
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
        window.location.href = getRoleHomePath(authService.getUserRole());
      } else {
        error("Create account failed", result.error || "Unable to create account. Try again");
      }
    } catch {
      error("Create account failed", "Something went wrong. Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <AuthShell title="Create account" subtitle="Register your restaurant to get started">
        <form onSubmit={handleSubmit} className="space-y-4">
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
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-2.5 text-[var(--color-text-muted)]"
              aria-label={showPassword ? "Hide password" : "Show password"}
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
              onClick={() => setShowConfirmPassword((p) => !p)}
              className="absolute right-3 top-2.5 text-[var(--color-text-muted)]"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff {...iconProps} /> : <Eye {...iconProps} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-[var(--color-accent)] font-semibold text-[var(--color-text-inverse)] transition duration-150 hover:bg-[var(--color-accent-hover)] active:scale-[0.97] disabled:opacity-40"
          >
            {isLoading ? <Loader /> : "Create account"}
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
              window.location.href = authService.getGoogleOAuthUrl("/oauth/callback");
            }}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-[var(--color-border)] font-medium text-[var(--color-text-primary)] transition duration-150 hover:border-[var(--color-border-hover)]"
          >
            <GoogleIcon />
            Sign up with Google
            <ArrowRight className="h-4 w-4 text-[var(--color-text-muted)]" strokeWidth={1.5} />
          </button>

          <p className="text-center text-[length:var(--text-sm)] text-[var(--color-text-secondary)]">
            Already have an account?{" "}
            <a href="/login" className="font-medium text-[var(--color-blue)] hover:text-[var(--color-blue-hover)]">
              Sign in
            </a>
          </p>
        </form>
      </AuthShell>
    </>
  );
};

export default SignupForm;
