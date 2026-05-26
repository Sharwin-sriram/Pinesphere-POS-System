"use client"
import React from 'react'
import { ChevronDown } from 'lucide-react'

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  description?: string
  error?: string
  success?: string
  selectClassName?: string
}

export default function Select({
  label,
  description,
  error,
  success,
  className = '',
  selectClassName = '',
  children,
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
      {label ? <div className="mb-2 font-medium text-slate-200">{label}</div> : null}
      <div className="relative">
        <select
          aria-invalid={Boolean(error)}
          className={`w-full appearance-none rounded-2xl border px-4 py-3 pr-11 transition duration-200 focus:border-transparent focus:outline-none focus:ring-2 ${stateClasses} ${selectClassName}`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
      {helperText ? <p className={`mt-2 text-xs leading-5 ${helperTone}`}>{helperText}</p> : null}
    </label>
  )
}
