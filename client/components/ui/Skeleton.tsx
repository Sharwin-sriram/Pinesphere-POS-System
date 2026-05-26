import React from 'react'

export default function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`relative isolate overflow-hidden rounded-2xl bg-white/[0.06] ${className}`}>
      <div className="absolute inset-0 animate-shimmer bg-[linear-gradient(110deg,rgba(255,255,255,0)_20%,rgba(255,255,255,0.16)_45%,rgba(255,255,255,0)_70%)] bg-[length:200%_100%]" />
    </div>
  )
}
