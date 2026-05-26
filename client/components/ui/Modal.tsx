"use client"
import React, { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

type Props = {
  open: boolean
  onClose: ()=>void
  title?: string
  description?: string
  children?: React.ReactNode
  footer?: React.ReactNode
  size?: 'md' | 'lg' | 'xl'
  className?: string
  closeOnOverlayClick?: boolean
}

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'lg',
  className = '',
  closeOnOverlayClick = true,
}: Props){
  useEffect(() => {
    if (!open) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [onClose, open])

  const sizeMap = {
    md: 'max-w-xl',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-6 sm:px-6">
          <motion.button
            type="button"
            aria-label="Close modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/88 backdrop-blur-2xl"
            onClick={closeOnOverlayClick ? onClose : undefined}
          />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className={`relative z-10 w-full ${sizeMap[size]} overflow-hidden rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.16),_transparent_30%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,0.96))] shadow-[0_40px_120px_-40px_rgba(15,23,42,0.85)] ${className}`}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/50 to-transparent" />
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5 sm:px-7">
              <div>
                {title ? <h3 className="text-xl font-semibold text-white sm:text-2xl">{title}</h3> : null}
                {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{description}</p> : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[calc(100vh-11rem)] overflow-y-auto px-6 py-6 sm:px-7">
              <div className="space-y-5 text-slate-300">{children}</div>
            </div>

            {footer ? <div className="border-t border-white/10 px-6 py-5 sm:px-7">{footer}</div> : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}
