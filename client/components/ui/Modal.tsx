"use client"
import React, { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

type Props = {
  open: boolean
  onClose: () => void
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
}: Props) {
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
    md: 'max-w-[560px]',
    lg: 'max-w-[560px]',
    xl: 'max-w-[560px]',
  }

  return (
    <AnimatePresence>
      {open ? (
        <div
          className="fixed inset-0 flex items-center justify-center px-4 py-6 sm:px-6"
          style={{ zIndex: 'var(--z-modal)' }}
        >
          <motion.button
            type="button"
            aria-label="Close modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-[var(--color-bg-overlay)]"
            style={{ zIndex: 'var(--z-overlay)' }}
            onClick={closeOnOverlayClick ? onClose : undefined}
          />

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
            className={`relative w-full ${sizeMap[size]} overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] ${className}`}
            style={{ zIndex: 'var(--z-modal)' }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] px-6 pb-4 pt-6">
              <div>
                {title ? (
                  <h3 className="text-[length:var(--text-lg)] font-semibold text-[var(--color-text-primary)]">
                    {title}
                  </h3>
                ) : null}
                {description ? (
                  <p className="mt-2 max-w-2xl text-[length:var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)]">
                    {description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[var(--color-border)] text-[var(--color-text-secondary)] transition duration-150 hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="max-h-[calc(100vh-11rem)] overflow-y-auto px-6 py-6 text-[var(--color-text-primary)]">
              <div className="space-y-5">{children}</div>
            </div>

            {footer ? (
              <div className="flex justify-end gap-3 border-t border-[var(--color-border)] px-6 pb-6 pt-4">
                {footer}
              </div>
            ) : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}
