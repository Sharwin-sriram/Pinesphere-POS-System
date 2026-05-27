"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class RestaurantCardErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Keep clean console, but log it for dev visibility without throwing unhandled
    console.warn("RestaurantCardErrorBoundary caught a card failure:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex h-56 flex-col justify-between overflow-hidden rounded-lg border border-[var(--color-danger-subtle)] bg-[var(--color-bg-secondary)] p-4 text-center">
            <div className="my-auto py-2">
              <span className="inline-block rounded-full bg-[var(--color-danger-subtle)] p-2 text-[var(--color-danger)] mb-2 text-sm">
                ⚠️
              </span>
              <h4 className="text-[length:var(--text-sm)] font-semibold text-[var(--color-text-primary)]">
                Card Load Failure
              </h4>
              <p className="text-[10px] text-[var(--color-text-muted)] mt-1 max-w-[200px] mx-auto truncate">
                {this.state.error?.message || "Render error"}
              </p>
            </div>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-primary)] py-1.5 text-[length:var(--text-xs)] font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition"
              aria-label="Retry loading card"
            >
              Retry
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
