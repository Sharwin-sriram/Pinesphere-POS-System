"use client";

import { motion } from "framer-motion";
import { UtensilsCrossed } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
};

// DS: layout — split auth shell (branding + form)
export default function AuthShell({ children, title = "Sign in", subtitle }: Props) {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-[var(--color-bg-primary)]">
      <motion.aside
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
        className="hidden w-1/2 flex-col justify-center border-r border-[var(--color-border)] p-12 lg:flex"
      >
        <div className="mx-auto max-w-md">
          <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
            <UtensilsCrossed className="h-7 w-7 text-[var(--color-accent)]" strokeWidth={1.5} />
          </div>
          <h1 className="text-[length:var(--text-2xl)] font-semibold tracking-tight text-[var(--color-text-primary)]">
            Pinesphere POS
          </h1>
          <p className="mt-2 text-[length:var(--text-base)] text-[var(--color-text-secondary)]">
            Restaurant management for orders, staff, and inventory in one place.
          </p>
          <dl className="mt-12 grid grid-cols-3 gap-6 text-center">
            <div>
              <dt className="text-[length:var(--text-lg)] font-semibold text-[var(--color-accent)]">24/7</dt>
              <dd className="text-[length:var(--text-sm)] text-[var(--color-text-muted)]">Support</dd>
            </div>
            <div>
              <dt className="text-[length:var(--text-lg)] font-semibold text-[var(--color-blue)]">99.9%</dt>
              <dd className="text-[length:var(--text-sm)] text-[var(--color-text-muted)]">Uptime</dd>
            </div>
            <div>
              <dt className="text-[length:var(--text-lg)] font-semibold text-[var(--color-text-primary)]">500+</dt>
              <dd className="text-[length:var(--text-sm)] text-[var(--color-text-muted)]">Restaurants</dd>
            </div>
          </dl>
        </div>
      </motion.aside>

      <motion.main
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
        className="flex w-full flex-1 items-center justify-center p-6 lg:w-1/2 lg:p-12"
      >
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
              <UtensilsCrossed className="h-5 w-5 text-[var(--color-accent)]" strokeWidth={1.5} />
            </div>
            <span className="text-[length:var(--text-lg)] font-semibold text-[var(--color-text-primary)]">
              Pinesphere POS
            </span>
          </div>

          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-8">
            <div className="mb-8 text-center">
              <h2 className="text-[length:var(--text-xl)] font-semibold text-[var(--color-text-primary)]">{title}</h2>
              {subtitle ? (
                <p className="mt-2 text-[length:var(--text-sm)] text-[var(--color-text-secondary)]">{subtitle}</p>
              ) : null}
            </div>
            {children}
          </div>

          <p className="mt-6 text-center text-[length:var(--text-sm)] text-[var(--color-text-muted)]">
            Need help?{" "}
            <a
              href="mailto:support@pinesphere.com"
              className="text-[var(--color-blue)] transition duration-150 hover:text-[var(--color-blue-hover)]"
            >
              support@pinesphere.com
            </a>
          </p>
        </div>
      </motion.main>
    </div>
  );
}
