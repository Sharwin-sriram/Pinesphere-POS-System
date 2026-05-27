"use client"
import React, { useState } from "react";
import Sidebar from "@/components/onboarding/Sidebar";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/onboarding/dashboard" },
  { label: "Register", href: "/onboarding/register" },
  { label: "Branches", href: "/onboarding/branches" },
  { label: "Subscriptions", href: "/onboarding/subscriptions" },
  { label: "Staff", href: "/onboarding/staff" },
  { label: "Documents", href: "/onboarding/documents" },
  { label: "Payment", href: "/onboarding/payment-setup" },
];

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.18),_transparent_25%),_linear-gradient(180deg,_#03050d_0%,_#0f172a_100%)] text-slate-100">
      <div className="flex min-h-screen">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <div className="flex flex-1 flex-col">
          <div className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl px-4 py-4 md:hidden">
            <div className="flex items-center justify-between gap-4">
              <div className="text-lg font-semibold text-white">Onboarding</div>
              <button
                onClick={() => setMenuOpen((open) => !open)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-white transition hover:bg-white/10"
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
            {menuOpen && (
              <div className="mt-4 space-y-2 rounded-3xl border border-white/10 bg-slate-950/95 p-4 shadow-2xl">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-2xl px-4 py-3 text-sm text-slate-100 transition hover:bg-white/10"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <main className="flex-1 min-h-screen px-4 pb-8 pt-6 sm:px-6 md:px-8 xl:px-10">
            <div className="mx-auto w-full max-w-[1440px]">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
