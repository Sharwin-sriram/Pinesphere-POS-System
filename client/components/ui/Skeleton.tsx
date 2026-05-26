import React from 'react'

export default function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-shimmer rounded-ds-md bg-[var(--color-bg-tertiary)] ${className}`}
    />
  )
}
