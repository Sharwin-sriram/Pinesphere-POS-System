import React from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({ children, className = "" }: Props) {
  return (
    <div
      className={`rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6 ${className}`}
    >
      {children}
    </div>
  );
}
