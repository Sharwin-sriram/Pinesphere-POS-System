"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import ToastProvider from '@/components/ui/ToastProvider'

const navItems = [
  { label: 'Overview', href: '/menu' },
  { label: 'Dashboard', href: '/menu/dashboard' },
  { label: 'Categories', href: '/menu/categories' },
  { label: 'Items', href: '/menu/items' },
  { label: 'Modifiers', href: '/menu/modifiers' },
  { label: 'Combos', href: '/menu/combos' },
  { label: 'Pricing', href: '/menu/pricing' },
]

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <ToastProvider>
      <div className="min-h-screen overflow-x-clip bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.18),_transparent_24%),_linear-gradient(180deg,_#020617_0%,_#0b1220_100%)] text-slate-100">
        <div className="flex min-h-screen">
          <aside className="sticky top-0 hidden h-screen w-72 flex-col border-r border-white/10 bg-slate-950/90 p-6 backdrop-blur-xl md:flex">
            <div className="mb-10">
              <p className="text-xs uppercase tracking-[0.28em] text-violet-300">Menu Management</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Restaurant menu control center</h2>
            </div>
            <nav className="space-y-2">
              {navItems.map((item) => {
                const active = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-3xl px-4 py-3 text-sm font-medium transition ${
                      active ? 'bg-white/10 text-white shadow-[0_0_0_1px_rgba(148,163,184,0.15)]' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            <div className="mt-auto rounded-[32px] border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
              <p className="font-semibold text-white">Keep menu updates fluid</p>
              <p className="mt-2 leading-6 text-slate-400">Add categories, items, modifiers and combos instantly with a polished restaurant workflow.</p>
            </div>
          </aside>

          <div className="flex flex-1 flex-col">
            <div className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/90 px-4 py-4 backdrop-blur-xl md:hidden">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-violet-300">Menu Management</p>
                  <p className="text-lg font-semibold text-white">Restaurant menu control</p>
                </div>
                <button
                  onClick={() => setMenuOpen((open) => !open)}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-white transition hover:bg-white/10"
                >
                  {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
              {menuOpen ? (
                <div className="mt-4 space-y-2 rounded-3xl border border-white/10 bg-slate-950/95 p-4 shadow-2xl">
                  {navItems.map((item) => {
                    const active = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className={`block rounded-2xl px-4 py-3 text-sm transition ${
                          active ? 'bg-white/10 text-white' : 'text-slate-200 hover:bg-white/10'
                        }`}
                      >
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              ) : null}
            </div>

            <main className="min-h-screen flex-1 px-4 pb-8 pt-6 sm:px-6 md:px-8 xl:px-10">
              <div className="mx-auto w-full max-w-[1440px]">{children}</div>
            </main>
          </div>
        </div>
      </div>
    </ToastProvider>
  )
}
