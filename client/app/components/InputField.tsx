import type { ReactNode } from "react";

interface InputFieldProps {
  type: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: ReactNode;
  error?: string;
  disabled?: boolean;
}

// DS: shadow — border-only focus; DS: radius — md
const InputField = ({
  type,
  name,
  placeholder,
  value,
  onChange,
  icon,
  error,
  disabled = false,
}: InputFieldProps) => {
  return (
    <div className="relative">
      {icon ? (
        <div className="pointer-events-none absolute left-4 top-1/2 z-10 flex h-4 w-4 -translate-y-1/2 items-center justify-center text-[var(--color-text-muted)]">
          {icon}
        </div>
      ) : null}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        className={[
          "h-10 w-full rounded-md border bg-[var(--color-bg-tertiary)] text-[length:var(--text-base)] text-[var(--color-text-primary)] transition duration-150 placeholder:text-[var(--color-text-muted)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          icon ? "pl-11 pr-4" : "px-4",
          error
            ? "border-[var(--color-danger)] focus:border-[var(--color-danger)]"
            : "border-[var(--color-border)] focus:border-[var(--color-border-focus)]",
        ].join(" ")}
      />
      {error ? (
        <p className="mt-2 text-[length:var(--text-sm)] text-[var(--color-danger)]">{error}</p>
      ) : null}
    </div>
  );
};

export default InputField;
