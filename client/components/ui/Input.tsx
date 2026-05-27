"use client"
import React from 'react'

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  description?: string
  error?: string
  success?: string
  inputClassName?: string
}

export default function Input({
  label,
  description,
  error,
  success,
  className = '',
  inputClassName = '',
  ...props
}: Props) {
  const stateClasses = error
    ? 'border-rose-400/60 bg-rose-500/10 text-rose-50 focus:ring-rose-400/50'
    : success
      ? 'border-emerald-400/40 bg-emerald-500/10 text-white focus:ring-emerald-400/50'
      : 'border-white/10 bg-slate-950/90 text-white focus:ring-violet-500/60'

  const helperText = error || success || description
  const helperTone = error ? 'text-rose-200' : success ? 'text-emerald-200' : 'text-slate-500'

  return (
    <label className={`block text-sm text-slate-300 ${className}`}>
      {label && <div className="mb-2 font-medium text-slate-200">{label}</div>}
      <input
        aria-invalid={Boolean(error)}
        className={`w-full rounded-2xl border px-4 py-3 text-white placeholder:text-slate-500 transition duration-200 focus:border-transparent focus:outline-none focus:ring-2 ${stateClasses} ${inputClassName}`}
        {...props}
      />
      {helperText ? <p className={`mt-2 text-xs leading-5 ${helperTone}`}>{helperText}</p> : null}
    </label>
  )
}
