import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface BannerProps {
  wsConnected: boolean;
}

export default function Banner({ wsConnected }: BannerProps) {
  if (wsConnected) return null;

  return (
    <div className="w-full bg-[var(--color-warning-subtle)] border-b border-[var(--color-warning)] px-4 py-3 flex items-center justify-between text-[var(--color-warning)] animate-fade-in z-30 transition-all duration-300">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-[var(--color-warning)] animate-pulse" />
        <span className="text-sm font-medium">
          Live updates paused — Reconnecting to real-time service...
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider bg-[var(--color-warning)]/10 px-2 py-1 rounded-md">
        <RefreshCw className="h-3 w-3 animate-spin" />
        <span>Polling Fallback Active</span>
      </div>
    </div>
  );
}
