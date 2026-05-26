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

const variantStyles: Record<ToastVariant, { icon: typeof CheckCircle2; iconClass: string; actionVariant: 'primary' | 'outline' | 'ghost' }> = {
  success: {
    icon: CheckCircle2,
    iconClass: 'text-emerald-300',
    actionVariant: 'ghost',
  },
  error: {
    icon: XCircle,
    iconClass: 'text-rose-300',
    actionVariant: 'outline',
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'text-amber-300',
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
      duration: 3600,
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

  const confirmDelete = ({ title, description, confirmLabel = 'Delete', onConfirm }: ConfirmDeleteOptions) => {
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
      .map((toast) => window.setTimeout(() => dismissToast(toast.id), toast.duration ?? 3600))

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [toasts])

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, confirmDelete }}>
      {children}

      <div className="pointer-events-none fixed right-4 top-4 z-[90] flex w-[min(100vw-2rem,24rem)] flex-col gap-3">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => {
            const { icon: Icon, iconClass, actionVariant } = variantStyles[toast.variant]
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 24, y: -12, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 18, scale: 0.96 }}
                transition={{ duration: 0.24, ease: 'easeOut' }}
                className="pointer-events-auto overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.18),_transparent_30%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.94))] p-4 shadow-[0_24px_80px_-38px_rgba(15,23,42,0.85)] backdrop-blur-2xl"
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${iconClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">{toast.title}</p>
                    {toast.description ? <p className="mt-2 text-sm leading-6 text-slate-400">{toast.description}</p> : null}
                    {toast.actionLabel ? (
                      <div className="mt-4 flex items-center gap-2">
                        <Button
                          size="sm"
                          variant={actionVariant}
                          onClick={() => {
                            toast.onAction?.()
                            dismissToast(toast.id)
                          }}
                          leftIcon={toast.variant === 'warning' ? <Trash2 className="h-4 w-4" /> : undefined}
                        >
                          {toast.actionLabel}
                        </Button>
                        <button
                          type="button"
                          onClick={() => dismissToast(toast.id)}
                          className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 transition hover:text-slate-300"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => dismissToast(toast.id)}
                    className="rounded-2xl border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-400 transition hover:bg-white/10 hover:text-white"
                  >
                    Dismiss
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
