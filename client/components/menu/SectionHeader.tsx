import React from 'react'
import Link from 'next/link'
import Button from '@/components/ui/Button'

type Props = {
  title: string
  subtitle: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
  actionVariant?: 'primary' | 'ghost' | 'outline'
}

export default function SectionHeader({
  title,
  subtitle,
  actionLabel,
  actionHref,
  onAction,
  actionVariant = 'primary',
}: Props) {
  const buttonClasses =
    'inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-purple-600 px-5 py-2.5 font-semibold text-white shadow-[0_24px_80px_-36px_rgba(147,51,234,0.85)] transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_28px_90px_-40px_rgba(147,51,234,0.75)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400'

  return (
    <div className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-slate-950/90 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.8)] sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-violet-300">{subtitle}</p>
        <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">{title}</h1>
      </div>
      {actionLabel && actionHref ? (
        <Link href={actionHref} className={buttonClasses}>
          {actionLabel}
        </Link>
      ) : actionLabel && onAction ? (
        <Button onClick={onAction} variant={actionVariant}>
          {actionLabel}
        </Button>
      ) : (
        actionLabel ? <Button variant={actionVariant}>{actionLabel}</Button> : null
      )}
    </div>
  )
}
