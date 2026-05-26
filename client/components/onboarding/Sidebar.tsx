"use client"
import Link from 'next/link'
import {
 Home,
 ClipboardList,
 MapPin,
 CreditCard,
 Users,
 FileText,
 Wallet,
} from 'lucide-react'

const navItems = [
 {label: 'Dashboard', href: '/onboarding/dashboard', icon: Home},
 {label: 'Register', href: '/onboarding/register', icon: ClipboardList},
 {label: 'Branches', href: '/onboarding/branches', icon: MapPin},
 {label: 'Subscriptions', href: '/onboarding/subscriptions', icon: CreditCard},
 {label: 'Staff', href: '/onboarding/staff', icon: Users},
 {label: 'Documents', href: '/onboarding/documents', icon: FileText},
 {label: 'Payment', href: '/onboarding/payment-setup', icon: Wallet},
]

export default function Sidebar() {
 return (
 <aside className="hidden xl:block w-72 shrink-0 px-5 py-6 bg-slate-950/90 border-r border-white/10 ">
 <div className="flex flex-col justify-between h-full gap-8">
 <div>
 <div className="mb-8">
 <div className="text-3xl font-semibold tracking-tight text-white">PineSphere</div>
 <p className="mt-2 text-sm text-slate-400">Restaurant onboarding experience</p>
 </div>
 <nav className="space-y-2">
 {navItems.map((item) => {
 const Icon = item.icon
 return (
 <Link
 key={item.href}
 href={item.href}
 className="group flex items-center gap-3 rounded-3xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
 >
 <Icon className="h-4 w-4 text-violet-300 transition group-hover:text-white" />
 <span>{item.label}</span>
 </Link>
 )
 })}
 </nav>
 </div>
 <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
 <div className="font-semibold text-white">Onboarding progress</div>
 <p className="mt-2 text-sm text-slate-400">Move through each stage to launch restaurants faster.</p>
 </div>
 </div>
 </aside>
 )
}
