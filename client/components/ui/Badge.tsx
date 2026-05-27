import React from 'react'

type BadgeVariant = 'default' | 'accent' | 'blue' | 'success' | 'warning' | 'danger'

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]',
  accent: 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]',
  blue: 'bg-[var(--color-blue-subtle)] text-[var(--color-blue)]',
  success: 'bg-[var(--color-success-subtle)] text-[var(--color-success)]',
  warning: 'bg-[var(--color-warning-subtle)] text-[var(--color-warning)]',
  danger: 'bg-[var(--color-danger-subtle)] text-[var(--color-danger)]',
}

export default function Badge({
  children,
  className = '',
  variant = 'default',
}: {
  children: React.ReactNode
  className?: string
  variant?: BadgeVariant
}) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 whitespace-nowrap rounded-sm px-2 py-[3px] text-[length:var(--text-xs)] font-medium uppercase tracking-[var(--tracking-widest)]',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}
