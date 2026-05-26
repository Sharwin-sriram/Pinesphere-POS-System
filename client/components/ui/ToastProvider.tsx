"use client"
import React, { createContext, useContext, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Trash2, XCircle } from 'lucide-react'
import Button from '@/components/ui/Button'

type ToastVariant = 'success' | 'error' | 'warning'

type ToastOptions = {
  variant: ToastVariant
  title: string
  description?: string
  duration?: number
  actionLabel?: string
  onAction?: () => void
  persistent?: boolean
}

type ToastRecord = ToastOptions & {
  id: string
}

type ConfirmDeleteOptions = {
  title: string
  description?: string
  confirmLabel?: string
  onConfirm: () => void
}

type ToastContextValue = {
  showToast: (options: ToastOptions) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  warning: (title: string, description?: string) => void
  confirmDelete: (options: ConfirmDeleteOptions) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

function getToastId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const variantStyles: Record<
  ToastVariant,
  {
    icon: typeof CheckCircle2
    iconClass: string
    borderClass: string
    actionVariant: 'primary' | 'secondary' | 'ghost' | 'danger'
  }
> = {
  success: {
    icon: CheckCircle2,
    iconClass: 'text-[var(--color-success)]',
    borderClass: 'border-l-[3px] border-l-[var(--color-success)]',
    actionVariant: 'ghost',
  },
  error: {
    icon: XCircle,
    iconClass: 'text-[var(--color-danger)]',
    borderClass: 'border-l-[3px] border-l-[var(--color-danger)]',
    actionVariant: 'secondary',
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'text-[var(--color-warning)]',
    borderClass: 'border-l-[3px] border-l-[var(--color-warning)]',
    actionVariant: 'primary',
  },
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([])

  const dismissToast = (id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }

  const showToast = (options: ToastOptions) => {
    const nextToast: ToastRecord = {
      id: getToastId(),
      duration: 3000,
      ...options,
    }
    setToasts((current) => [...current.slice(-3), nextToast])
  }

  const success = (title: string, description?: string) => {
    showToast({ variant: 'success', title, description })
  }

  const error = (title: string, description?: string) => {
    showToast({ variant: 'error', title, description })
  }

  const warning = (title: string, description?: string) => {
    showToast({ variant: 'warning', title, description })
  }

  const confirmDelete = ({
    title,
    description,
    confirmLabel = 'Delete item',
    onConfirm,
  }: ConfirmDeleteOptions) => {
    showToast({
      variant: 'warning',
      title,
      description,
      actionLabel: confirmLabel,
      onAction: onConfirm,
      persistent: true,
    })
  }

  useEffect(() => {
    const timers = toasts
      .filter((toast) => !toast.persistent)
      .map((toast) => window.setTimeout(() => dismissToast(toast.id), toast.duration ?? 3000))

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [toasts])

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, confirmDelete }}>
      {children}

      <div
        className="pointer-events-none fixed bottom-6 right-6 flex w-[min(100vw-3rem,420px)] min-w-[320px] flex-col gap-3"
        style={{ zIndex: 'var(--z-toast)' }}
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => {
            const { icon: Icon, iconClass, borderClass, actionVariant } = variantStyles[toast.variant]
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15, ease: [0, 0, 0.2, 1] }}
                className={`pointer-events-auto flex items-start gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-5 py-4 ${borderClass}`}
              >
                <div className={`mt-0.5 shrink-0 ${iconClass}`}>
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[length:var(--text-base)] font-semibold text-[var(--color-text-primary)]">
                    {toast.title}
                  </p>
                  {toast.description ? (
                    <p className="mt-2 text-[length:var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)]">
                      {toast.description}
                    </p>
                  ) : null}
                  {toast.actionLabel ? (
                    <div className="mt-4 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={actionVariant}
                        onClick={() => {
                          toast.onAction?.()
                          dismissToast(toast.id)
                        }}
                        leftIcon={
                          toast.variant === 'warning' ? (
                            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                          ) : undefined
                        }
                      >
                        {toast.actionLabel}
                      </Button>
                      <button
                        type="button"
                        onClick={() => dismissToast(toast.id)}
                        className="text-[length:var(--text-sm)] font-medium text-[var(--color-text-muted)] transition duration-150 hover:text-[var(--color-text-primary)]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  className="shrink-0 text-[length:var(--text-sm)] text-[var(--color-text-muted)] transition duration-150 hover:text-[var(--color-text-primary)]"
                >
                  Dismiss
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
