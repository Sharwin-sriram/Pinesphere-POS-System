"use client";

import { Gift } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

const DEFAULT_OFFERS = [
  "50% OFF on your first order for the first 7 days",
  "Free delivery on orders above ₹299 this week",
  "Weekend special: Flat ₹100 OFF on selected restaurants",
];

export default function OfferBanner() {
  const offers = useMemo(() => DEFAULT_OFFERS, []);
  const [active] = useState(0);

  return (
    <motion.section
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
      className="rounded-lg border border-[var(--color-border)] bg-[linear-gradient(90deg,rgba(245,158,11,0.14),rgba(59,130,246,0.10))] px-4 py-3 sm:px-6"
      aria-label="Promotional offer"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
          <Gift className="h-4 w-4 text-[var(--color-accent)]" strokeWidth={1.5} />
        </div>
        <p className="text-[length:var(--text-sm)] font-semibold text-[var(--color-text-primary)]">
          {offers[active]}
        </p>
        <span className="ml-auto hidden sm:inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-2 py-1 text-[length:var(--text-xs)] text-[var(--color-text-secondary)]">
          Limited time
        </span>
      </div>
    </motion.section>
  );
}

