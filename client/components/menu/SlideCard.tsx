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
    <div className="relative h-[480px] w-full overflow-hidden rounded-4xl bg-slate-950/90">
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src={slide?.background}
          alt={slide.title}
          fill
          priority={priority}
          sizes="(max-width: 1280px) 100vw, 1400px"
          className="absolute inset-0 w-full h-full object-cover opacity-100 brightness-105 contrast-105 saturate-110 transition-opacity duration-700 ease-out"
        />
      </div>
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
      <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.08),transparent_22%)] mix-blend-screen opacity-70" />
      <div className="absolute inset-0 z-10 bg-black/10" />
      <div className="relative z-20 flex h-full flex-col justify-end p-6 sm:p-8">
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