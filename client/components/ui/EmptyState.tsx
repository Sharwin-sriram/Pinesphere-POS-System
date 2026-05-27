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
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  previewSrc = '/images/placeholder.jpg',
  previewAlt = 'Empty state illustration',
}: Props) {
  return (
    <div className="overflow-hidden rounded-[32px] border border-dashed border-white/10 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.18),_transparent_34%),linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,6,23,0.92))] p-6 shadow-[0_28px_80px_-40px_rgba(15,23,42,0.8)] sm:p-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-center">
        <div className="space-y-4">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl border border-violet-400/20 bg-violet-500/10 text-violet-200 shadow-[0_20px_60px_-24px_rgba(139,92,246,0.6)]">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-white">{title}</h3>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">{description}</p>
          </div>
          {actionLabel && onAction ? <Button onClick={onAction}>{actionLabel}</Button> : null}
        </div>

        <div className="relative h-52 overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/80">
          <ImageWithFallback
            src={previewSrc}
            alt={previewAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 320px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.18),_transparent_28%),linear-gradient(180deg,rgba(2,6,23,0.02),rgba(2,6,23,0.5))]" />
        </div>
      </div>
    </div>
  )
}
