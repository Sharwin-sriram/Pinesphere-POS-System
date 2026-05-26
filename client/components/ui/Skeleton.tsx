import React from 'react'

export default function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-shimmer rounded-md bg-[linear-gradient(90deg,var(--color-bg-tertiary)_25%,var(--color-bg-secondary)_50%,var(--color-bg-tertiary)_75%)] bg-[length:200%_100%] ${className}`}
    />
  )
}
