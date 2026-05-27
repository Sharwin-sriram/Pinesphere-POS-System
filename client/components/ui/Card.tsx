import React from 'react'

type Props = {
  children: React.ReactNode
  className?: string
}

export default function Card({children, className = ''}: Props) {
  return (
    <div className={`bg-slate-950/95 ring-1 ring-white/10 border border-white/10 backdrop-blur-3xl rounded-[32px] p-6 shadow-[0_28px_80px_-40px_rgba(15,23,42,0.8)] ${className}`}>
      {children}
    </div>
  )
}
