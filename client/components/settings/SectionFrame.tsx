"use client";

import React from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export function SectionFrame({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-[length:var(--text-2xl)] font-semibold text-[var(--color-text-primary)]">{title}</h2>
          <p className="mt-1 max-w-2xl text-sm text-[var(--color-text-secondary)]">{description}</p>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      <Card className="space-y-6">{children}</Card>
    </div>
  );
}

export function UnsavedChangesBar({ onSave, onDiscard, saving }: { onSave: () => void; onDiscard: () => void; saving?: boolean }) {
  return (
    <div className="sticky top-4 z-20 flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-3 shadow-sm backdrop-blur">
      <p className="text-sm font-medium text-[var(--color-text-primary)]">You have unsaved changes</p>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={onDiscard}>
          Discard
        </Button>
        <Button variant="primary" size="sm" onClick={onSave} loading={saving}>
          Save
        </Button>
      </div>
    </div>
  );
}
