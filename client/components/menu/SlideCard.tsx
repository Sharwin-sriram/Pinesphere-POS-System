"use client"
import React from 'react'
import ImageWithFallback from '@/components/ui/ImageWithFallback'

type Slide = {
  id: string
  title: string
  subtitle: string
  label: string
  background: string
}

type Props = {
  slide: Slide
  priority?: boolean
}

export default function SlideCard({ slide, priority = false }: Props) {
  return (
    <div className="relative h-full overflow-hidden rounded-[32px] bg-slate-950/90">
      <ImageWithFallback
        src={slide?.background}
        alt={slide.title}
        fill
        priority={priority}
        sizes="(max-width: 1280px) 100vw, 1400px"
        className="object-cover transition-transform duration-700 ease-out"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/12 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.12),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.08),_transparent_18%)] mix-blend-screen" />
      <div className="absolute inset-0 bg-black/12" />

      <div className="relative z-10 flex h-full flex-col justify-end p-6 sm:p-8">
        <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/90">
          {slide.label}
        </span>
        <h3 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight text-white sm:text-4xl">
          {slide.title}
        </h3>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
          {slide.subtitle}
        </p>
      </div>
    </div>
  )
}
