"use client"
import { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Bell, MessageCircle, Mail, Smartphone } from 'lucide-react'

const tabConfig = [
 { id: 'sms', label: 'SMS', icon: Bell },
 { id: 'email', label: 'Email', icon: Mail },
 { id: 'whatsapp', label: 'WhatsApp', icon: Smartphone },
 { id: 'push', label: 'Push', icon: MessageCircle },
]

const templates = {
 sms: { title: 'Reservation Reminder', preview: '“Your dinner reservation is confirmed for 7PM. Reply YES to confirm your seat.”' },
 email: { title: 'Loyalty Bonus Offer', preview: '“Unlock 20% off on your next visit when you redeem 200 points before Friday.”' },
 whatsapp: { title: 'Weekend Specials', preview: '“Say hello to our new sharing menu - available this weekend for loyalty members.”' },
 push: { title: 'New Rewards Added', preview: '“Your loyalty tier just earned a fresh reward. Tap to claim now.”' },
}

export default function NotificationTabs() {
 const [active, setActive] = useState<'sms' | 'email' | 'whatsapp' | 'push'>('sms')

 return (
 <Card className="space-y-6">
 <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Notification channels</p>
 <h2 className="mt-2 text-2xl font-semibold text-white">Templates and scheduling</h2>
 </div>
 <Button variant="ghost">Create new template</Button>
 </div>
 <div className="grid gap-4 sm:grid-cols-4">
 {tabConfig.map((tab) => {
 const Icon = tab.icon
 return (
 <button
 key={tab.id}
 onClick={() => setActive(tab.id as any)}
 className={`rounded-3xl border px-4 py-4 text-left transition ${active === tab.id ? 'border-violet-400/40 bg-violet-500/10 text-white' : 'border-white/10 bg-slate-950/80 text-slate-300 hover:border-violet-400/20 hover:bg-white/5'}`}
 >
 <div className="flex items-center gap-3 text-sm font-semibold">
 <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-200">
 <Icon className="h-5 w-5" />
 </span>
 {tab.label}
 </div>
 </button>
 )
 })}
 </div>
 <div className="rounded-[32px] border border-white/10 bg-slate-950/90 p-6">
 <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Active template</p>
 <h3 className="mt-3 text-xl font-semibold text-white">{templates[active].title}</h3>
 <p className="mt-4 text-sm leading-7 text-slate-300">{templates[active].preview}</p>
 <div className="mt-6 grid gap-4 sm:grid-cols-3">
 <div className="rounded-3xl bg-white/5 p-4 text-sm text-slate-300">
 <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Scheduled</p>
 <p className="mt-2 text-lg font-semibold text-white">Today, 4:30 PM</p>
 </div>
 <div className="rounded-3xl bg-white/5 p-4 text-sm text-slate-300">
 <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Audience</p>
 <p className="mt-2 text-lg font-semibold text-white">Gold members</p>
 </div>
 <div className="rounded-3xl bg-white/5 p-4 text-sm text-slate-300">
 <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Open rate</p>
 <p className="mt-2 text-lg font-semibold text-white">54%</p>
 </div>
 </div>
 </div>
 </Card>
 )
}
