"use client"
import { CheckCircle2, AlertTriangle, BellRing } from 'lucide-react'

type Props = {
  type: 'success' | 'error' | 'warning'
  title: string
  message: string
}

const iconMap = {
  success: <CheckCircle2 className="h-5 w-5 text-emerald-300" />,
  error: <AlertTriangle className="h-5 w-5 text-rose-300" />,
  warning: <BellRing className="h-5 w-5 text-amber-300" />,
}

export default function Toast({ type, title, message }: Props) {
  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-[28px] border border-white/10 bg-slate-950/95 p-4 shadow-[0_28px_80px_-40px_rgba(15,23,42,0.9)] backdrop-blur-xl">
      <div className="flex items-start gap-3">
        <div className="mt-1">{iconMap[type]}</div>
        <div>
          <p className="font-semibold text-white">{title}</p>
          <p className="mt-1 text-sm text-slate-400">{message}</p>
        </div>
      </div>
    </div>
  )
}
