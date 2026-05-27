"use client"
import React from 'react'

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  description?: string
  error?: string
  success?: string
  textareaClassName?: string
}

export default function Textarea({
  label,
  description,
  error,
  success,
  className = '',
  textareaClassName = '',
  ...props
}: Props) {
  const stateClasses = error
    ? 'border-[var(--color-danger)]'
    : success
      ? 'border-[var(--color-success)]'
      : 'border-[var(--color-border)]'

  const helperText = error || success || description
  const helperTone = error
    ? 'text-[var(--color-danger)]'
    : success
      ? 'text-[var(--color-success)]'
      : 'text-[var(--color-text-muted)]'

  return (
    <label className={`block text-[length:var(--text-sm)] text-[var(--color-text-secondary)] ${className}`}>
      {label ? (
        <div className="mb-2 font-medium text-[var(--color-text-secondary)]">{label}</div>
      ) : null}
      <textarea
        aria-invalid={Boolean(error)}
        className={`min-h-[120px] w-full rounded-md border bg-[var(--color-bg-tertiary)] px-4 py-3 text-[length:var(--text-base)] text-[var(--color-text-primary)] transition duration-150 placeholder:text-[var(--color-text-muted)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${stateClasses} ${textareaClassName}`}
        {...props}
      />
      {helperText ? (
        <p className={`mt-2 text-[length:var(--text-sm)] leading-[var(--leading-normal)] ${helperTone}`}>
          {helperText}
        </p>
      ) : null}
    </label>
  )
}
