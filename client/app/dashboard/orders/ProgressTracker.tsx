"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Bike,
  ChefHat,
  CheckCircle2,
  Package,
  PartyPopper,
  Receipt,
  XCircle,
  RefreshCw,
  CreditCard,
} from "lucide-react";
import { OrderStatus } from "./types";
import { FAILURE_STATUSES, LIFECYCLE_STEPS, STATUS_INDEX } from "./orderConfig";

// ─── Icon map ─────────────────────────────────────────────────────────────────
const STEP_ICONS: Record<string, React.ReactNode> = {
  receipt:       <Receipt      className="h-4 w-4" strokeWidth={1.75} />,
  "check-circle":<CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />,
  "chef-hat":    <ChefHat      className="h-4 w-4" strokeWidth={1.75} />,
  package:       <Package      className="h-4 w-4" strokeWidth={1.75} />,
  bike:          <Bike         className="h-4 w-4" strokeWidth={1.75} />,
  "party-popper":<PartyPopper  className="h-4 w-4" strokeWidth={1.75} />,
};

const FAILURE_ICONS: Record<string, React.ReactNode> = {
  CANCELLED:      <XCircle      className="h-5 w-5" strokeWidth={1.75} />,
  PAYMENT_FAILED: <CreditCard   className="h-5 w-5" strokeWidth={1.75} />,
  REFUNDED:       <RefreshCw    className="h-5 w-5" strokeWidth={1.75} />,
};

const FAILURE_LABELS: Record<string, { title: string; description: string; color: string }> = {
  CANCELLED:      { title: "Order Cancelled",    description: "This order has been cancelled.",          color: "text-red-600"   },
  PAYMENT_FAILED: { title: "Payment Failed",     description: "Payment could not be processed.",         color: "text-red-600"   },
  REFUNDED:       { title: "Order Refunded",     description: "Your refund has been initiated.",         color: "text-slate-600" },
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface ProgressTrackerProps {
  status: OrderStatus;
}

// ─── Step indicator ───────────────────────────────────────────────────────────
interface StepProps {
  step: (typeof LIFECYCLE_STEPS)[number];
  index: number;
  activeIndex: number;
  total: number;
  isFailure: boolean;
}

function Step({ step, index, activeIndex, isFailure }: StepProps) {
  const isCompleted = !isFailure && index < activeIndex;
  const isActive    = !isFailure && index === activeIndex;
  const isPending   = isFailure || index > activeIndex;

  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="relative flex flex-col items-center gap-2 flex-1 min-w-0"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
    >
      {/* Tooltip */}
      {showTooltip && (
        <div
          role="tooltip"
          className="absolute -top-14 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-primary)] shadow-md pointer-events-none"
        >
          {step.description}
          <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-[var(--color-border)]" />
        </div>
      )}

      {/* Circle */}
      <div
        aria-label={`${step.label}: ${isCompleted ? "completed" : isActive ? "in progress" : "pending"}`}
        className={[
          "relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-500 shrink-0",
          isCompleted
            ? "border-[var(--color-blue)] bg-[var(--color-blue)] text-white"
            : isActive
            ? "border-[var(--color-blue)] bg-white text-[var(--color-blue)] shadow-[0_0_0_4px_rgba(59,130,246,0.15)]"
            : "border-[var(--color-border)] bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]",
        ].join(" ")}
      >
        {isCompleted ? (
          <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
        ) : (
          STEP_ICONS[step.icon]
        )}

        {/* Active pulse ring */}
        {isActive && (
          <span className="absolute inset-0 rounded-full animate-ping bg-blue-400 opacity-20" />
        )}
      </div>

      {/* Label */}
      <div className="text-center px-1 hidden sm:block">
        <p
          className={[
            "text-[11px] font-semibold leading-tight transition-colors duration-300",
            isCompleted || isActive
              ? "text-[var(--color-text-primary)]"
              : "text-[var(--color-text-muted)]",
          ].join(" ")}
        >
          {step.label}
        </p>
        {isActive && (
          <p className="mt-0.5 text-[10px] text-[var(--color-blue)] font-medium">
            In progress
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Connector line ───────────────────────────────────────────────────────────
function Connector({ filled }: { filled: boolean }) {
  return (
    <div className="relative h-0.5 flex-1 mx-1 rounded-full bg-[var(--color-border)] overflow-hidden shrink">
      <div
        className={[
          "absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out",
          filled ? "w-full bg-[var(--color-blue)]" : "w-0",
        ].join(" ")}
      />
    </div>
  );
}

// ─── Mobile vertical step ─────────────────────────────────────────────────────
function MobileStep({ step, index, activeIndex, isFailure }: StepProps) {
  const isCompleted = !isFailure && index < activeIndex;
  const isActive    = !isFailure && index === activeIndex;
  const isLast      = index === LIFECYCLE_STEPS.length - 1;

  return (
    <div className="flex gap-4">
      {/* Left: circle + line */}
      <div className="flex flex-col items-center">
        <div
          className={[
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500",
            isCompleted
              ? "border-[var(--color-blue)] bg-[var(--color-blue)] text-white"
              : isActive
              ? "border-[var(--color-blue)] bg-white text-[var(--color-blue)] shadow-[0_0_0_4px_rgba(59,130,246,0.15)]"
              : "border-[var(--color-border)] bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]",
          ].join(" ")}
        >
          {isCompleted ? (
            <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
          ) : (
            STEP_ICONS[step.icon]
          )}
          {isActive && (
            <span className="absolute inset-0 rounded-full animate-ping bg-blue-400 opacity-20" />
          )}
        </div>
        {!isLast && (
          <div className="relative mt-1 w-0.5 flex-1 min-h-[2rem] rounded-full bg-[var(--color-border)] overflow-hidden">
            <div
              className={[
                "absolute inset-x-0 top-0 rounded-full transition-all duration-700 ease-out",
                isCompleted ? "h-full bg-[var(--color-blue)]" : "h-0",
              ].join(" ")}
            />
          </div>
        )}
      </div>

      {/* Right: text */}
      <div className="pb-6 pt-1">
        <p
          className={[
            "text-sm font-semibold leading-tight",
            isCompleted || isActive
              ? "text-[var(--color-text-primary)]"
              : "text-[var(--color-text-muted)]",
          ].join(" ")}
        >
          {step.label}
        </p>
        <p
          className={[
            "mt-0.5 text-xs",
            isActive ? "text-[var(--color-blue)]" : "text-[var(--color-text-muted)]",
          ].join(" ")}
        >
          {isActive ? "In progress · " : ""}{step.description}
        </p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ProgressTracker({ status }: ProgressTrackerProps) {
  const isFailure   = FAILURE_STATUSES.includes(status);
  const activeIndex = isFailure ? -1 : (STATUS_INDEX[status] ?? 0);
  const failureInfo = isFailure ? FAILURE_LABELS[status] : null;

  // Animate progress fill on mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  if (isFailure && failureInfo) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 px-6 py-5 flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
          {FAILURE_ICONS[status]}
        </div>
        <div>
          <p className={`font-semibold text-sm ${failureInfo.color}`}>{failureInfo.title}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{failureInfo.description}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── Desktop: horizontal ── */}
      <div className="hidden sm:block">
        <div className="flex items-start">
          {LIFECYCLE_STEPS.map((step, i) => (
            <React.Fragment key={step.key}>
              <Step
                step={step}
                index={i}
                activeIndex={mounted ? activeIndex : -1}
                total={LIFECYCLE_STEPS.length}
                isFailure={isFailure}
              />
              {i < LIFECYCLE_STEPS.length - 1 && (
                <Connector filled={mounted && i < activeIndex} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Mobile: vertical ── */}
      <div className="sm:hidden">
        {LIFECYCLE_STEPS.map((step, i) => (
          <MobileStep
            key={step.key}
            step={step}
            index={i}
            activeIndex={mounted ? activeIndex : -1}
            total={LIFECYCLE_STEPS.length}
            isFailure={isFailure}
          />
        ))}
      </div>
    </>
  );
}
