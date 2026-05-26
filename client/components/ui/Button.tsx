"use client"
import React from 'react'
import { Loader2 } from 'lucide-react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  children,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 disabled:cursor-not-allowed disabled:opacity-60'
  const variants: Record<string,string> = {
    primary:
      'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-purple-600 text-white shadow-[0_24px_80px_-36px_rgba(147,51,234,0.85)] hover:-translate-y-0.5 hover:shadow-[0_28px_90px_-40px_rgba(147,51,234,0.75)]',
    ghost: 'border border-white/15 bg-white/10 text-white hover:bg-white/15',
    outline: 'border border-white/20 bg-transparent text-white hover:bg-white/10'
  }
  const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} disabled={disabled || loading} {...props}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : leftIcon}
      <span>{children}</span>
      {!loading ? rightIcon : null}
    </button>
  )
}
