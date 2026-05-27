"use client";

import { Bell, Camera, ChevronDown, Menu, Package, Search, ShoppingCart, User } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { useCart } from "./CartContext";
import authService, { getUserAvatarUrl } from "../../lib/authService";

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { cartCount } = useCart();
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState<ReturnType<typeof authService.getCurrentUser>>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Load auth state client-side only (avoids SSR hydration mismatch)
  useEffect(() => {
    setAuthed(authService.isAuthenticated());
    setUser(authService.getCurrentUser());

    // Refresh profile from backend to get latest image
    if (authService.isAuthenticated()) {
      authService.getProfile().then((result) => {
        if (result.success) setUser(authService.getCurrentUser());
      });
    }
  }, []);

  const avatarUrl = getUserAvatarUrl(user);

  const initial = (user?.name?.[0] || user?.email?.[0] || "U").toUpperCase();
  const profileLabel = authed ? "Profile menu" : "Login";

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (menuRef.current?.contains(target)) return;
      if (buttonRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full glass-light border-b border-white/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">

        {/* Left: menu toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={onMenuClick}
            className="p-2 bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] rounded-xl transition-all text-[var(--color-text-secondary)] lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Center: search */}
        <div className="hidden sm:flex flex-1 max-w-2xl ml-4">
          <div className="relative group w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-[var(--color-text-muted)] group-focus-within:text-[var(--color-accent)] transition-colors h-4 w-4" strokeWidth={1.5} />
            </div>
            <input
              type="text"
              placeholder="Search for restaurants, cuisines, or dishes..."
              className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-2xl pl-12 pr-4 py-3 text-[var(--color-text-primary)] focus:outline-none focus:ring-4 focus:ring-[var(--color-accent-subtle)] focus:bg-[var(--color-bg-secondary)] transition-all"
            />
          </div>
        </div>

        {/* Right: cart + notifications + profile */}
        <div className="flex items-center gap-2">

          {/* Cart */}
          <Link
            href="/dashboard/cart"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)] transition-smooth"
            aria-label="My cart"
          >
            <ShoppingCart className="h-4 w-4" strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-accent)] text-[10px] font-semibold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Notifications */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)] transition-smooth"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" strokeWidth={1.5} />
          </button>

          {/* Profile */}
          {authed ? (
            <div className="relative">
              <button
                ref={buttonRef}
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-2 py-1.5 text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)] transition-smooth"
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label={profileLabel}
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="Profile" className="h-6 w-6 rounded-full object-cover" />
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-bg-tertiary)] text-xs font-semibold text-[var(--color-text-primary)]">
                    {initial}
                  </span>
                )}
                <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>

              {open && (
                <div
                  ref={menuRef}
                  role="menu"
                  className="absolute right-0 mt-2 w-48 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] shadow-sm p-1.5 z-50"
                >
                  {/* User info header */}
                  <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-[var(--color-border)] mb-1">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarUrl} alt="Profile" className="h-8 w-8 rounded-full object-cover shrink-0" />
                    ) : (
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-tertiary)] text-sm font-semibold text-[var(--color-text-primary)]">
                        {initial}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[var(--color-text-primary)] truncate">{user?.name || "User"}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)] truncate">{user?.email || ""}</p>
                    </div>
                  </div>

                  <Link
                    href="/dashboard/account"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]"
                    role="menuitem"
                  >
                    <User className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Account
                  </Link>
                  <Link
                    href="/dashboard/orders"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]"
                    role="menuitem"
                  >
                    <Package className="h-3.5 w-3.5" strokeWidth={1.5} />
                    My Orders
                  </Link>

                  <div className="my-1 border-t border-[var(--color-border)]" />

                  <button
                    onClick={() => authService.logout()}
                    className="w-full text-left flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)]"
                    role="menuitem"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex h-9 items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 text-sm font-medium text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)] transition-smooth"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
