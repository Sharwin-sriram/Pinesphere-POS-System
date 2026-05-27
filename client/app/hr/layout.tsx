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
 <aside className="w-64 bg-white flex flex-col z-10 border-r border-gray-100 hidden md:flex">
 <div className="p-6 border-b border-gray-50 flex items-center gap-3">
 <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
 PS
 </div>
 <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Manager Dashboard</h1>
 </div>

 <nav className="flex-1 overflow-y-auto py-4">
 <ul className="space-y-1 px-3">
 {navigation.map((item) => {
 const isActive = pathname === item.href || (item.href !== '/hr' && pathname.startsWith(item.href));
 return (
 <li key={item.name}>
 <Link
 href={item.href}
 className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
 ? 'bg-blue-50 text-blue-700 font-semibold '
 : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-primary)] hover:text-gray-900'
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
 <div className="p-4 border-t border-gray-50 bg-[var(--color-bg-primary)]/50">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">
 AM
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-semibold text-gray-900 truncate">Admin Manager</p>
 <p className="text-xs text-gray-500 truncate">admin@example.com</p>
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
