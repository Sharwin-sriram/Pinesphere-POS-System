import React from 'react'

type Props = {
  children: React.ReactNode
  className?: string
  interactive?: boolean
}

export default function Card({ children, className = '', interactive = false }: Props) {
  // DS: shadow — border only; DS: radius — lg (12px)
  return (
    <div
      className={[
        'rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6',
        interactive
          ? 'cursor-pointer transition duration-150 hover:border-[var(--color-border-hover)] active:border-[var(--color-border-focus)]'
          : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  )
}
