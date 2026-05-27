import type { ReactNode } from "react";
import React, { forwardRef } from "react";

interface InputFieldProps {
  type: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: ReactNode;
  /** Full error message — shows inline below the field AND marks border red. */
  error?: string;
  /** Border-only error state — marks border red without showing any message. */
  hasError?: boolean;
  disabled?: boolean;
  id?: string;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoCapitalize?: string;
  spellCheck?: boolean;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      type,
      name,
      placeholder,
      value,
      onChange,
      icon,
      error,
      hasError,
      disabled = false,
      id,
      onBlur,
      autoComplete,
      inputMode,
      autoCapitalize,
      spellCheck,
    },
    ref,
  ) => {
    const isInvalid = Boolean(error) || Boolean(hasError);
    const errorId = id ? `${id}-error` : undefined;

    const wrapperBorder = isInvalid
      ? "border-[var(--color-danger)] focus-within:border-[var(--color-danger)]"
      : "border-[var(--color-border)] focus-within:border-[var(--color-border-focus)]";

    return (
      <div>
        <div
          className={[
            "flex h-10 w-full items-center overflow-hidden rounded-md border bg-[var(--color-bg-tertiary)] transition duration-150",
            wrapperBorder,
            disabled ? "cursor-not-allowed opacity-50" : "",
          ].join(" ")}
        >
          {icon ? (
            <div className="pointer-events-none flex h-10 w-11 shrink-0 items-center justify-center text-[var(--color-text-muted)]">
              {icon}
            </div>
          ) : null}
          <input
            ref={ref}
            type={type}
            name={name}
            id={id}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            autoComplete={autoComplete}
            inputMode={inputMode}
            autoCapitalize={autoCapitalize}
            spellCheck={spellCheck}
            aria-invalid={isInvalid}
            aria-describedby={error ? errorId : undefined}
            className={[
              "flex-1 min-w-0 appearance-none bg-transparent text-[length:var(--text-base)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0",
              icon ? "pr-4" : "px-4",
            ].join(" ")}
          />
        </div>

        {/* Only render the message element when there's an actual message to show */}
        {error ? (
          <p
            id={errorId}
            role="alert"
            aria-live="polite"
            className="mt-1.5 text-[length:var(--text-sm)] text-[var(--color-danger)]"
          >
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);

export default InputField;
