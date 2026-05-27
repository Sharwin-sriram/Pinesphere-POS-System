"use client";

import { motion } from "framer-motion";
import { UtensilsCrossed } from "lucide-react";
import type { ReactNode } from "react";

interface AuthCardProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  showLogo?: boolean;
}

// DS: color — centered auth card on light shell
const AuthCard = ({ children, title, subtitle, showLogo = true }: AuthCardProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-primary)] p-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
        className="w-full max-w-md"
      >
        {showLogo ? (
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
              <UtensilsCrossed className="h-7 w-7 text-[var(--color-accent)]" strokeWidth={1.5} />
            </div>
            <h1 className="text-[length:var(--text-xl)] font-semibold text-[var(--color-text-primary)]">
              Pinesphere POS
            </h1>
            <p className="mt-1 text-[length:var(--text-sm)] text-[var(--color-text-secondary)]">
              Restaurant management system
            </p>
          </div>
        ) : null}

        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-8">
          <div className="mb-8 text-center">
            <h2 className="text-[length:var(--text-xl)] font-semibold text-[var(--color-text-primary)]">{title}</h2>
            {subtitle ? (
              <p className="mt-2 text-[length:var(--text-sm)] leading-relaxed text-[var(--color-text-secondary)]">
                {subtitle}
              </p>
            ) : null}
          </div>
          {children}
          <p className="mt-8 text-center text-[length:var(--text-sm)] text-[var(--color-text-muted)]">
            Need help?{" "}
            <a
              href="mailto:support@pinesphere.com"
              className="text-[var(--color-blue)] hover:text-[var(--color-blue-hover)]"
            >
              support@pinesphere.com
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthCard;
