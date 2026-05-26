"use client";

import { useState } from "react";
import { ChevronDown, Phone } from "lucide-react";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

const countryCodes = [
  { code: "+91", flag: "IN", name: "India" },
  { code: "+1", flag: "US", name: "United States" },
  { code: "+44", flag: "GB", name: "United Kingdom" },
];

const PhoneInput = ({ value, onChange, error, disabled = false }: PhoneInputProps) => {
  const [countryCode, setCountryCode] = useState("+91");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phoneNumber = e.target.value.replace(/\D/g, "");
    if (phoneNumber.length <= 10) onChange(phoneNumber);
  };

  const formatPhoneNumber = (phone: string) => {
    if (phone.length <= 3) return phone;
    if (phone.length <= 6) return `${phone.slice(0, 3)} ${phone.slice(3)}`;
    return `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;
  };

  return (
    <div className="relative">
      <Phone
        className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]"
        strokeWidth={1.5}
      />
      <div className="absolute left-11 top-1/2 z-10 -translate-y-1/2">
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          disabled={disabled}
          className="flex items-center gap-1 px-2 py-1 text-[length:var(--text-sm)] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-50"
        >
          <span>{countryCode}</span>
          <ChevronDown className="h-3 w-3" strokeWidth={1.5} />
        </button>
        {isDropdownOpen ? (
          <div className="absolute left-0 top-full z-50 mt-1 min-w-[12rem] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] py-1">
            {countryCodes.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => {
                  setCountryCode(country.code);
                  setIsDropdownOpen(false);
                }}
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-[length:var(--text-sm)] text-[var(--color-text-secondary)] transition duration-150 hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]"
              >
                <span className="font-medium">{country.code}</span>
                <span>{country.name}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <input
        type="tel"
        value={formatPhoneNumber(value)}
        onChange={handlePhoneChange}
        placeholder="e.g. 9876543210"
        disabled={disabled}
        className={[
          "h-10 w-full rounded-md border bg-[var(--color-bg-tertiary)] pl-28 pr-4 text-[length:var(--text-base)] text-[var(--color-text-primary)] transition duration-150 placeholder:text-[var(--color-text-muted)] focus:outline-none",
          error
            ? "border-[var(--color-danger)] focus:border-[var(--color-danger)]"
            : "border-[var(--color-border)] focus:border-[var(--color-border-focus)]",
        ].join(" ")}
      />
      {error ? <p className="mt-2 text-[length:var(--text-sm)] text-[var(--color-danger)]">{error}</p> : null}
      {isDropdownOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 cursor-default"
          aria-label="Close country list"
          onClick={() => setIsDropdownOpen(false)}
        />
      ) : null}
    </div>
  );
};

export default PhoneInput;
