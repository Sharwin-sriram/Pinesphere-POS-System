"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import AuthShell from "./auth/AuthShell";
import InputField from "./InputField";

const iconProps = { className: "h-4 w-4", strokeWidth: 1.5 as const };

// DS: color — legacy premium page aligned to AuthShell (unused route fallback)
const PremiumLoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "", rememberMe: false });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login attempt:", formData);
  };

  return (
    <AuthShell title="Sign in" subtitle="Premium login preview">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <InputField
          type="text"
          name="email"
          placeholder="you@restaurant.com"
          value={formData.email}
          onChange={handleInputChange}
          icon={<Mail {...iconProps} />}
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
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-[var(--color-text-muted)]"
          >
            {showPassword ? <EyeOff {...iconProps} /> : <Eye {...iconProps} />}
          </button>
        </div>
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
        <button
          type="submit"
          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-[var(--color-accent)] font-semibold text-[var(--color-text-inverse)] hover:bg-[var(--color-accent-hover)]"
        >
          Sign in
        </button>
      </form>
    </AuthShell>
  );
};

export default PremiumLoginPage;
