"use client"
import React, { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  description?: string
  error?: string
  success?: string
  selectClassName?: string
}

const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  {
    label,
    description,
    error,
    success,
    className = '',
    selectClassName = '',
    children,
    id,
    ...props
  }: Props,
  ref
) {
  const stateClasses = error
    ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)]'
    : success
      ? 'border-[var(--color-success)] focus:border-[var(--color-success)]'
      : 'border-[var(--color-border)] focus:border-[var(--color-border)]'

  const helperText = error || success || description
  const helperTone = error
    ? 'text-[var(--color-danger)]'
    : success
      ? 'text-[var(--color-success)]'
      : 'text-[var(--color-text-muted)]'

  const errorId = id ? `${id}-error` : undefined

  return (
    <label className={`block text-[length:var(--text-sm)] text-[var(--color-text-secondary)] ${className}`}>
      {label ? (
        <div className="mb-2 font-medium text-[var(--color-text-secondary)]">{label}</div>
      ) : null}
      <div className="relative">
        <select
          ref={ref}
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`h-10 w-full appearance-none rounded-md border bg-[var(--color-bg-tertiary)] px-4 pr-11 text-[length:var(--text-base)] text-[var(--color-text-primary)] transition duration-150 focus:outline-none focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 ${stateClasses} ${selectClassName}`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]"
          strokeWidth={1.5}
        />
      </div>
      {helperText ? (
        <p id={error ? errorId : undefined} className={`mt-2 text-[length:var(--text-sm)] leading-[var(--leading-normal)] ${helperTone}`}>
          {helperText}
        </p>
      ) : null}
    </label>
  )
})

export default Select
