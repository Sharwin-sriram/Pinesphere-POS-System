"use client"
import React from 'react'
import type { LucideIcon } from 'lucide-react'
import Button from '@/components/ui/Button'
import ImageWithFallback from '@/components/ui/ImageWithFallback'

type Props = {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  previewSrc?: string
  previewAlt?: string
  buttonVariant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'success' | 'success-outline'
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  previewSrc,
  previewAlt = 'Empty state illustration',
  buttonVariant = 'primary',
}: Props) {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
      <Icon className="h-8 w-8 text-[var(--color-text-muted)]" strokeWidth={1.5} />
      <div className="space-y-2">
        <h3 className="text-[length:var(--text-lg)] font-semibold text-[var(--color-text-primary)]">
          {title}
        </h3>
        <p className="mx-auto max-w-[320px] text-[length:var(--text-base)] leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)]">
          {description}
        </p>
      </div>
      {actionLabel && onAction ? <Button variant={buttonVariant} onClick={onAction}>{actionLabel}</Button> : null}
      {previewSrc ? (
        <div className="relative mt-4 h-40 w-full max-w-[320px] overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)]">
          <ImageWithFallback
            src={previewSrc}
            alt={previewAlt}
            fill
            sizes="320px"
            className="object-cover"
            showLoader={false}
          />
        </div>
      ) : null}
    </div>
  )
}
