"use client"
import { ReactNode } from 'react'
import { X } from 'lucide-react'

type Props = {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
}

export default function CRMModal({ open, title, description, onClose, children }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xl">
      <div className="w-full max-w-3xl overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/95 shadow-[0_32px_120px_-60px_rgba(15,23,42,0.85)]">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            {description ? <p className="mt-2 text-sm text-slate-400">{description}</p> : null}
          </div>
          <button onClick={onClose} className="rounded-full border border-white/10 bg-slate-900/80 p-2 text-slate-300 transition hover:bg-slate-900/95">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
