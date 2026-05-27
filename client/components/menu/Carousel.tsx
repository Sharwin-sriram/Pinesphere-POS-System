"use client"
import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import SlideCard from '@/components/menu/SlideCard'

type Slide = {
  id: string
  title: string
  subtitle: string
  label: string
  background: string
}

type Props = {
  slides: Slide[]
  interval?: number
}

export default function Carousel({ slides, interval = 4200 }: Props) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  const length = slides.length
  const safeActive = length > 0 ? active % length : 0
  const activeSlide = slides[safeActive] ?? slides[0]

  useEffect(() => {
    if (paused || length <= 1) return
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % length)
    }, interval)
    return () => window.clearInterval(timer)
  }, [interval, length, paused])

  useEffect(() => {
    if (!slides || slides.length === 0) return
    slides.forEach((slide) => {
      try {
        const image = new window.Image()
        image.src = slide.background
      } catch {
        // ignore preload failures, ImageWithFallback will handle render safety
      }
    })
  }, [slides])

  if (!slides || slides.length === 0) return null

  return (
    <div className="space-y-4">
      <div
        className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/90 shadow-[0_28px_80px_-40px_rgba(15,23,42,0.8)]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={activeSlide?.id}
            initial={{ opacity: 0, x: 50, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.98 }}
            transition={{ duration: 0.85, ease: 'easeOut' }}
            className="relative h-[480px]"
          >
            <SlideCard slide={activeSlide} priority={active === 0} />
          </motion.div>
        </AnimatePresence>

        {length > 1 ? (
          <>
            <div className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden items-center justify-between px-4 sm:flex">
              <button
                type="button"
                aria-label="Previous slide"
                className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/60 text-white backdrop-blur-xl transition hover:bg-white/10"
                onClick={() => setActive((current) => (current - 1 + length) % length)}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Next slide"
                className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/60 text-white backdrop-blur-xl transition hover:bg-white/10"
                onClick={() => setActive((current) => (current + 1) % length)}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="absolute inset-x-0 bottom-4 flex justify-center gap-3">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Go to slide ${index + 1}`}
                  className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                    index === safeActive ? 'bg-violet-300 shadow-[0_0_0_8px_rgba(124,58,237,0.12)]' : 'bg-white/20 hover:bg-white/40'
                  }`}
                  onClick={() => setActive(index)}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
