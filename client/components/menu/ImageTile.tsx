"use client"
import React from 'react'
import ImageWithFallback from '@/components/ui/ImageWithFallback'
import { motion } from 'framer-motion'

type Props = {
  title: string
  subtitle: string
  label: string
  src: string
  alt: string
}

export default function ImageTile({ title, subtitle, label, src, alt }: Props) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="group overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/90 shadow-[0_28px_80px_-40px_rgba(15,23,42,0.8)]"
    >
      <div className="relative h-72 overflow-hidden bg-slate-900/60 sm:h-80">
        <ImageWithFallback
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/12 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-100">
            {label}
          </span>
          <h3 className="mt-3 text-xl font-semibold text-white sm:text-2xl">{title}</h3>
          <p className="mt-2 max-w-xs text-sm leading-6 text-slate-300">{subtitle}</p>
        </div>
      </div>
    </motion.div>
  )
}
