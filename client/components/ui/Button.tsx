"use client"
import React from 'react'
import { Loader2 } from 'lucide-react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'success' | 'success-outline'
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
  // DS: radius — md (8px); DS: motion — 150ms base transition
  const base =
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold transition duration-150 ease-[ease] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)] disabled:cursor-not-allowed disabled:opacity-40 font-[family-name:var(--font-ui)] text-[length:var(--text-base)] active:scale-[0.97]'
  const variants: Record<string, string> = {
    primary:
      'border-0 bg-[var(--color-accent)] text-[var(--color-text-inverse)] hover:bg-[var(--color-accent-hover)] active:bg-[var(--color-accent-active)]',
    secondary:
      'border border-[var(--color-border)] bg-transparent text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)]',
    outline:
      'border border-[var(--color-border)] bg-transparent text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)]',
    ghost:
      'border-0 bg-transparent px-3 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]',
    danger:
      'border border-[var(--color-danger)] bg-transparent text-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)]',
    success:
      'border-0 bg-[var(--color-accent-green)] text-[var(--color-text-inverse)] hover:bg-[var(--color-accent-green-hover)] active:bg-[var(--color-accent-green-active)]',
    'success-outline':
      'border border-[var(--color-accent-green)] bg-transparent text-[var(--color-accent-green)] hover:bg-[var(--color-accent-green-subtle)] hover:border-[var(--color-accent-green-hover)]',
  }
  const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
    sm: 'h-8 px-4 text-[length:var(--text-sm)]',
    md: 'h-10 px-5',
    lg: 'h-12 px-5 text-[length:var(--text-md)]',
  }

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" strokeWidth={1.5} /> : leftIcon}
      <span>{children}</span>
      {!loading ? rightIcon : null}
    </button>
  )
}
