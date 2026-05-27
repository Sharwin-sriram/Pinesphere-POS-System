"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Lock, Mail, Phone, UtensilsCrossed, User } from "lucide-react";
import AuthShell from "../../components/auth/AuthShell";
import InputField from "../../components/InputField";
import Loader from "../../components/Loader";
import { useToast } from "../../components/Toast";
import { authService } from "../../lib/authService";
import { getRoleHomePath } from "../../lib/authRoutes";
import { debounce } from "../../dashboard/utils/debounce";

import Select from "../../../components/ui/Select";

const iconProps = { className: "h-4 w-4", strokeWidth: 1.5 as const };

type SignupStep = 1 | 2;

type EmailUniqueState = "unknown" | "checking" | "available" | "unavailable";

const CUISINE_OPTIONS = [
  "American",
  "Fast Food",
  "Burgers",
  "Italian",
  "Pizzas",
  "Mughlai",
  "Biryani",
  "North Indian",
  "Desserts",
  "Bakery",
  "Cakes",
];

interface RestaurantSignupFormState {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  restaurantName: string;
  cuisineTypes: string[];
  city: string;
  phone: string;
  fssaiLicense: string;
}

type RestaurantSignupErrors = Partial<Record<keyof RestaurantSignupFormState, string>>;

const RestaurantSignupForm: React.FC = () => {
  const [step, setStep] = useState<SignupStep>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<RestaurantSignupErrors>({});
  const { success, error, ToastContainer } = useToast();

  const [emailUniqueState, setEmailUniqueState] = useState<EmailUniqueState>("unknown");

  const [formData, setFormData] = useState<RestaurantSignupFormState>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    restaurantName: "",
    cuisineTypes: [],
    city: "",
    phone: "",
    fssaiLicense: "",
  });

  const fieldOrderStep1: (keyof RestaurantSignupFormState)[] = useMemo(
    () => ["fullName", "email", "password", "confirmPassword"],
    []
  );
  const fieldRefs = useRef<Partial<Record<keyof RestaurantSignupFormState, HTMLElement | null>>>(
    {}
  );

  const setRef =
    (key: keyof RestaurantSignupFormState) =>
    (el: HTMLElement | null): void => {
      fieldRefs.current[key] = el;
    };

  const passwordRequirements = useMemo(() => {
    const hasUpper = /[A-Z]/.test(formData.password);
    const hasNumber = /\d/.test(formData.password);
    const hasSpecial = /[^A-Za-z0-9]/.test(formData.password);
    const longEnough = formData.password.length >= 8;
    const score = [hasUpper, hasNumber, hasSpecial, longEnough].filter(Boolean).length;
    return { hasUpper, hasNumber, hasSpecial, longEnough, score };
  }, [formData.password]);

  const passwordStrengthLabel = useMemo(() => {
    if (passwordRequirements.score <= 1) return "Weak";
    if (passwordRequirements.score === 2) return "Fair";
    if (passwordRequirements.score === 3) return "Good";
    return "Strong";
  }, [passwordRequirements.score]);

  // Debounced email uniqueness check.
  const emailCheckIdRef = useRef(0);
  const lastCheckedEmailRef = useRef("");

  const validateStep1Format = (values: RestaurantSignupFormState): RestaurantSignupErrors => {
    const newErrors: RestaurantSignupErrors = {};
    const normalizedEmail = values.email.trim();

    if (!values.fullName.trim()) newErrors.fullName = "Full name is required";
    else if (values.fullName.trim().length < 2 || values.fullName.trim().length > 80) {
      newErrors.fullName = "Full name must be between 2 and 80 characters";
    }

    if (!normalizedEmail) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(normalizedEmail)) newErrors.email = "Please enter a valid email";

    if (!values.password) newErrors.password = "Password is required";
    else {
      if (values.password.length < 8) newErrors.password = "Password must be at least 8 characters";
      if (!/[A-Z]/.test(values.password) || !/\d/.test(values.password) || !/[^A-Za-z0-9]/.test(values.password)) {
        newErrors.password = "Password must include uppercase, number, and special character";
      }
    }

    if (!values.confirmPassword) newErrors.confirmPassword = "Confirm password is required";
    else if (values.confirmPassword !== values.password) newErrors.confirmPassword = "Passwords do not match";

    return newErrors;
  };

  const validateStep1Base = (values: RestaurantSignupFormState): RestaurantSignupErrors => {
    const newErrors = validateStep1Format(values);
    const normalizedEmail = values.email.trim().toLowerCase();

    if (
      !newErrors.email &&
      emailUniqueState === "unavailable" &&
      normalizedEmail === lastCheckedEmailRef.current
    ) {
      newErrors.email = "Email already registered";
    }

    return newErrors;
  };

  const doCheckEmailUnique = async (emailToCheck: string, requestId: number) => {
    try {
      const result = await authService.checkEmailUnique(emailToCheck);
      if (emailCheckIdRef.current !== requestId) return;

      if (!result.success) {
        setEmailUniqueState("unknown");
        setErrors((prev) => ({ ...prev, email: "" }));
        return;
      }

      lastCheckedEmailRef.current = emailToCheck.trim().toLowerCase();

      if (result.isAvailable) {
        setEmailUniqueState("available");
        setErrors((prev) => ({ ...prev, email: "" }));
      } else {
        setEmailUniqueState("unavailable");
        setErrors((prev) => ({ ...prev, email: "Email already registered" }));
      }
    } catch {
      if (emailCheckIdRef.current !== requestId) return;
      setEmailUniqueState("unknown");
      setErrors((prev) => ({ ...prev, email: "" }));
    }
  };

  const checkEmailDebouncedRef = useRef(
    debounce((emailToCheck: string, requestId: number) => {
      void doCheckEmailUnique(emailToCheck, requestId);
    }, 400)
  );

  useEffect(() => {
    return () => {
      checkEmailDebouncedRef.current.cancel?.();
    };
  }, []);

  const validateStep2Base = (values: RestaurantSignupFormState): RestaurantSignupErrors => {
    const newErrors: RestaurantSignupErrors = {};

    if (!values.restaurantName.trim()) newErrors.restaurantName = "Restaurant name is required";

    if (!values.cuisineTypes || values.cuisineTypes.length === 0) {
      newErrors.cuisineTypes = "Please select at least one cuisine";
    }

    if (!values.city.trim()) newErrors.city = "City is required";

    if (!values.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\d{10,15}$/.test(values.phone.trim())) newErrors.phone = "Please enter a valid phone number";

    if (!values.fssaiLicense.trim()) newErrors.fssaiLicense = "FSSAI license number is required";
    else if (!/^\d{14}$/.test(values.fssaiLicense.trim())) newErrors.fssaiLicense = "FSSAI must be a 14-digit number";

    return newErrors;
  };

  const focusFirstError = (stepToValidate: SignupStep, currentErrors: RestaurantSignupErrors) => {
    const order = stepToValidate === 1 ? fieldOrderStep1 : ["restaurantName", "cuisineTypes", "city", "phone", "fssaiLicense"];
    for (const key of order) {
      if (!currentErrors[key as keyof RestaurantSignupFormState]) continue;
      const el = fieldRefs.current[key as keyof RestaurantSignupFormState];
      if (el) {
        el.focus();
        return;
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const key = name as keyof RestaurantSignupFormState;

    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (key === "email") {
      setEmailUniqueState("unknown");
      lastCheckedEmailRef.current = "";
      checkEmailDebouncedRef.current.cancel?.();
    }

    // If user fixes a field, clear its error.
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }

    // If password changes, re-validate confirm password immediately (spec requirement).
    if (key === "password" && formData.confirmPassword.trim()) {
      const nextPassword = value;
      if (formData.confirmPassword !== nextPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match" }));
      } else {
        setErrors((prev) => ({ ...prev, confirmPassword: "" }));
      }
    }
  };

  const handleEmailBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const emailToCheck = e.target.value.trim();

    // Only start uniqueness check if email format is valid (ignore stale uniqueness state).
    const formatErrors = validateStep1Format({
      ...formData,
      email: emailToCheck,
      confirmPassword: formData.confirmPassword,
    });

    if (formatErrors.email) {
      setEmailUniqueState("unknown");
      setErrors((prev) => ({ ...prev, email: formatErrors.email || "" }));
      return;
    }

    setEmailUniqueState("checking");
    const requestId = emailCheckIdRef.current + 1;
    emailCheckIdRef.current = requestId;
    checkEmailDebouncedRef.current(emailToCheck, requestId);
  };

  const handleBlurConfirm = (e: React.FocusEvent<HTMLInputElement>) => {
    const confirm = e.target.value;
    if (!confirm.trim()) {
      setErrors((prev) => ({ ...prev, confirmPassword: "Confirm password is required" }));
      return;
    }

    if (confirm !== formData.password) setErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match" }));
    else setErrors((prev) => ({ ...prev, confirmPassword: "" }));
  };

  const handleNextFromStep1 = () => {
    const newErrors = validateStep1Base(formData);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      focusFirstError(1, newErrors);
      return;
    }
    setStep(2);
  };

  const handleBackToStep1 = () => {
    setStep(1);
    // Keep entered values intact per spec; clear Step 2 validation errors.
    setErrors((prev) => ({
      ...prev,
      restaurantName: "",
      cuisineTypes: "",
      city: "",
      phone: "",
      fssaiLicense: "",
    }));
  };

  const handleCuisineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
    setFormData((prev) => ({ ...prev, cuisineTypes: selected }));
    if (errors.cuisineTypes) setErrors((prev) => ({ ...prev, cuisineTypes: "" }));
  };

  const redirectAfterAuth = () => {
    const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    const next = searchParams.get("next");
    const safeNext = next && next.startsWith("/") ? next : null;
    const role = authService.getUserRole();
    const fallback = role ? getRoleHomePath(role) : "/restaurant/dashboard";
    window.location.href = safeNext || fallback;
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== 2) return;

    const newErrors = validateStep2Base(formData);
    setErrors(newErrors);

    const hasErrors = Object.keys(newErrors).length > 0;
    if (hasErrors) {
      focusFirstError(2, newErrors);
      return;
    }

    // Step 1 guard (spec): ensure Step 1 still validates cleanly before firing API.
    const step1Errors = validateStep1Base(formData);
    if (Object.keys(step1Errors).length > 0) {
      setErrors(step1Errors);
      setStep(1);
      focusFirstError(1, step1Errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        full_name: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        restaurant_name: formData.restaurantName.trim(),
        cuisine_types: formData.cuisineTypes,
        city: formData.city.trim(),
        phone: formData.phone.trim(),
        fssai_license: formData.fssaiLicense.trim(),
      };

      const result = await authService.registerRestaurant(payload);
      if (result.success) {
        success("Account created", "Welcome to your restaurant");
        redirectAfterAuth();
      } else {
        // Best-effort step routing based on likely duplicate-email errors.
        if (String(result.error || "").toLowerCase().includes("email")) {
          error("Create account failed", result.error || "Email already registered");
          setErrors((prev) => ({ ...prev, email: "Email already registered" }));
          setStep(1);
        } else {
          error("Create account failed", result.error || "Unable to create account");
        }
      }
    } catch {
      error("Create account failed", "Network error. Please try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between">
      <p className="text-[length:var(--text-sm)] font-semibold text-[var(--color-text-secondary)]">
        Step {step} of 2
      </p>
      <div className="flex items-center gap-3">
        <div className={`h-2 w-10 rounded-full ${step === 1 ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]"}`} />
        <div className={`h-2 w-10 rounded-full ${step === 2 ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]"}`} />
      </div>
    </div>
  );

  return (
    <>
      <ToastContainer />
      <AuthShell title="Create account" subtitle="Create your restaurant account">
        <form onSubmit={handleCreateAccount} className="space-y-4">
          {renderStepIndicator()}

          {step === 1 ? (
            <>
              <div className="space-y-2">
                <label htmlFor="restaurant-signup-fullName" className="text-[length:var(--text-sm)] font-medium text-[var(--color-text-secondary)]">
                  Full name
                </label>
                <InputField
                  id="restaurant-signup-fullName"
                  type="text"
                  name="fullName"
                  placeholder="e.g. Priya Sharma"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  onBlur={(e) => {
                    const nextFullName = e.target.value;
                    const base = validateStep1Base({ ...formData, fullName: nextFullName });
                    setErrors((prev) => ({ ...prev, fullName: base.fullName || "" }));
                  }}
                  icon={<User {...iconProps} />}
                  hasError={!!errors.fullName}
                  ref={setRef("fullName")}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="restaurant-signup-email" className="text-[length:var(--text-sm)] font-medium text-[var(--color-text-secondary)]">
                  Email address
                </label>
                <InputField
                  id="restaurant-signup-email"
                  type="text"
                  name="email"
                  placeholder="you@restaurant.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleEmailBlur}
                  icon={<Mail {...iconProps} />}
                  hasError={!!errors.email}
                  ref={setRef("email")}
                  autoComplete="email"
                  inputMode="email"
                  autoCapitalize="off"
                  spellCheck={false}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="restaurant-signup-password" className="text-[length:var(--text-sm)] font-medium text-[var(--color-text-secondary)]">
                  Password
                </label>
                <div className="relative">
                  <InputField
                    id="restaurant-signup-password"
                    type="password"
                    name="password"
                    placeholder="Create password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onBlur={(e) => {
                      const nextPassword = e.target.value;
                      const base = validateStep1Base({ ...formData, password: nextPassword });
                      setErrors((prev) => ({ ...prev, password: base.password || "" }));
                      if (formData.confirmPassword.trim()) {
                        const confirmBase = validateStep1Base({ ...formData, password: nextPassword });
                        setErrors((prev) => ({ ...prev, confirmPassword: confirmBase.confirmPassword || "" }));
                      }
                    }}
                    icon={<Lock {...iconProps} />}
                    hasError={!!errors.password}
                    ref={setRef("password")}
                  />
                </div>
                <p className="mt-2 text-[length:var(--text-xs)] text-[var(--color-text-secondary)]">
                  Strength: <span className="font-semibold text-[var(--color-text-primary)]">{passwordStrengthLabel}</span>
                </p>
                <div className="flex gap-2 pt-2">
                  {[0, 1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className={`h-2 flex-1 rounded-md ${idx < passwordRequirements.score ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]"}`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="restaurant-signup-confirmPassword" className="text-[length:var(--text-sm)] font-medium text-[var(--color-text-secondary)]">
                  Confirm password
                </label>
                <InputField
                  id="restaurant-signup-confirmPassword"
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onBlur={handleBlurConfirm}
                  icon={<Lock {...iconProps} />}
                  hasError={!!errors.confirmPassword}
                  ref={setRef("confirmPassword")}
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleNextFromStep1}
                  className="inline-flex h-10 w-full items-center justify-center rounded-md bg-[var(--color-accent)] font-semibold text-[var(--color-text-inverse)] transition duration-150 hover:bg-[var(--color-accent-hover)] active:scale-[0.97] disabled:opacity-40"
                >
                  Next
                  <ArrowRight {...iconProps} />
                </button>

                {/* Error summary — shown below the button */}
                {Object.values(errors).some(Boolean) && (
                  <ul
                    role="alert"
                    aria-live="polite"
                    className="mt-3 space-y-1 rounded-md border border-[var(--color-danger)] bg-[var(--color-danger-subtle)] px-4 py-3"
                  >
                    {fieldOrderStep1
                      .filter((k) => errors[k])
                      .map((k) => (
                        <li key={k} className="text-[length:var(--text-sm)] text-[var(--color-danger)] list-disc ml-2">
                          {errors[k]}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <div className="space-y-2">
                <label htmlFor="restaurant-signup-restaurantName" className="text-[length:var(--text-sm)] font-medium text-[var(--color-text-secondary)]">
                  Restaurant name
                </label>
                <InputField
                  id="restaurant-signup-restaurantName"
                  type="text"
                  name="restaurantName"
                  placeholder="e.g. Dominos Pizza"
                  value={formData.restaurantName}
                  onChange={handleInputChange}
                  icon={<UtensilsCrossed {...iconProps} />}
                  hasError={!!errors.restaurantName}
                  ref={setRef("restaurantName")}
                />
              </div>

              <div className="space-y-2">
                <Select
                  label="Cuisine type"
                  id="restaurant-signup-cuisineTypes"
                  multiple
                  value={formData.cuisineTypes}
                  error={errors.cuisineTypes}
                  onChange={handleCuisineChange}
                  ref={setRef("cuisineTypes")}
                >
                  {CUISINE_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="restaurant-signup-city" className="text-[length:var(--text-sm)] font-medium text-[var(--color-text-secondary)]">
                  City
                </label>
                <InputField
                  id="restaurant-signup-city"
                  type="text"
                  name="city"
                  placeholder="e.g. Bengaluru"
                  value={formData.city}
                  onChange={handleInputChange}
                  hasError={!!errors.city}
                  ref={setRef("city")}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="restaurant-signup-phone" className="text-[length:var(--text-sm)] font-medium text-[var(--color-text-secondary)]">
                  Phone number
                </label>
                <InputField
                  id="restaurant-signup-phone"
                  type="tel"
                  name="phone"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={handleInputChange}
                  icon={<Phone {...iconProps} />}
                  hasError={!!errors.phone}
                  ref={setRef("phone")}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="restaurant-signup-fssaiLicense" className="text-[length:var(--text-sm)] font-medium text-[var(--color-text-secondary)]">
                  FSSAI license number
                </label>
                <InputField
                  id="restaurant-signup-fssaiLicense"
                  type="text"
                  name="fssaiLicense"
                  placeholder="14-digit number"
                  value={formData.fssaiLicense}
                  onChange={handleInputChange}
                  icon={<UtensilsCrossed {...iconProps} />}
                  hasError={!!errors.fssaiLicense}
                  ref={setRef("fssaiLicense")}
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleBackToStep1}
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-md border border-[var(--color-border)] bg-transparent font-semibold text-[var(--color-text-primary)] transition duration-150 hover:border-[var(--color-border-hover)]"
                >
                  <ArrowLeft {...iconProps} />
                  Back
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-[var(--color-accent)] font-semibold text-[var(--color-text-inverse)] transition duration-150 hover:bg-[var(--color-accent-hover)] active:scale-[0.97] disabled:opacity-40"
                >
                  {isSubmitting ? <Loader /> : "Create Account"}
                </button>
              </div>

              {/* Step 2 error summary */}
              {Object.values(errors).some(Boolean) && (
                <ul
                  role="alert"
                  aria-live="polite"
                  className="mt-1 space-y-1 rounded-md border border-[var(--color-danger)] bg-[var(--color-danger-subtle)] px-4 py-3"
                >
                  {(["restaurantName", "cuisineTypes", "city", "phone", "fssaiLicense"] as const).filter((k) => errors[k]).map((k) => (
                    <li key={k} className="text-[length:var(--text-sm)] text-[var(--color-danger)] list-disc ml-2">
                      {errors[k]}
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : null}
        </form>
      </AuthShell>
    </>
  );
};

export default RestaurantSignupForm;

