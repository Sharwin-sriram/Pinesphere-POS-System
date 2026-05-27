'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function HRLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard Home', href: '/hr', icon: '🏠' },
    { name: 'Employee Directory', href: '/hr/employees', icon: '👥' },
    { name: 'Attendance', href: '/hr/attendance', icon: '⏱️' },
    { name: 'Shift Planner', href: '/hr/shifts', icon: '📅' },
    { name: 'Leave Management', href: '/hr/leaves', icon: '🏖️' },
    { name: 'Payroll', href: '/hr/payroll', icon: '💰' },
    { name: 'Performance', href: '/hr/performance', icon: '📈' },
    { name: 'Incentives', href: '/hr/incentives', icon: '🏆' },
    { name: 'Reports', href: '/hr/reports', icon: '📊' },
    { name: 'Notifications', href: '/hr/notifications', icon: '🔔' },
    { name: 'Settings', href: '/hr/settings', icon: '⚙️' },
  ];

  return (
    <div className="flex h-screen bg-[var(--color-bg-primary)] font-sans text-[var(--color-text-primary)]">

      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[var(--color-bg-secondary)] flex flex-col z-10 border-r border-[var(--color-border)] hidden md:flex">
        <div className="p-6 border-b border-[var(--color-border)] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center text-[var(--color-text-inverse)] font-semibold text-sm">
            PS
          </div>
          <h1 className="text-xl font-semibold text-[var(--color-text-primary)] tracking-tight">Manager Dashboard</h1>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar-light">
          <ul className="space-y-1 px-3">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/hr' && pathname.startsWith(item.href));
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                        ? 'bg-[var(--color-accent)] text-[var(--color-text-inverse)] font-semibold '
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'
                      }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-sm">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile Snippet */}
        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-tertiary)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-[var(--color-text-inverse)] font-semibold">
              AM
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">Admin Manager</p>
              <p className="text-xs text-[var(--color-text-muted)] truncate">admin@example.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="md:p-8 p-4">
          {children}
        </div>
      </main>

    </div>
  );
}
