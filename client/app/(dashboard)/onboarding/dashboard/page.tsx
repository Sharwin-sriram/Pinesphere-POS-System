"use client"
import React from 'react'
import { motion } from 'framer-motion'
import StatsCards from '../../../../components/onboarding/StatsCards'
import RecentTable from '../../../../components/onboarding/RecentTable'
import Card from '../../../../components/ui/Card'
import Button from '../../../../components/ui/Button'

export default function Page(){
 return (
 <div className="space-y-6">
 <motion.div
 initial={{opacity:0, y:16}}
 animate={{opacity:1, y:0}}
 transition={{duration:0.5}}
 className="grid gap-6 xl:grid-cols-[1.8fr_1fr]"
 >
 <Card className="bg-slate-950/90">
 <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
 <div>
 <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Onboarding dashboard</p>
 <h1 className="mt-3 text-3xl font-semibold text-white">Restaurant rollout insights</h1>
 <p className="mt-3 max-w-2xl text-sm text-slate-400">Monitor onboarding velocity, branch coverage, staff invites, and payment readiness in one elegant workspace.</p>
 </div>
 <div className="flex flex-wrap gap-3">
 <Button variant="primary">Create new restaurant</Button>
 <Button variant="outline">Export report</Button>
 </div>
 </div>
 <div className="mt-8 grid gap-4 sm:grid-cols-3">
 <div className="rounded-ds-3xl bg-white/5 p-5">
 <div className="text-sm uppercase tracking-[0.2em] text-slate-400">Revenue</div>
 <div className="mt-3 text-3xl font-semibold text-white">$24.8k</div>
 <div className="mt-2 text-sm text-slate-500">Monthly bookings</div>
 </div>
 <div className="rounded-ds-3xl bg-white/5 p-5">
 <div className="text-sm uppercase tracking-[0.2em] text-slate-400">New trials</div>
 <div className="mt-3 text-3xl font-semibold text-white">34</div>
 <div className="mt-2 text-sm text-slate-500">Last 7 days</div>
 </div>
 <div className="rounded-ds-3xl bg-white/5 p-5">
 <div className="text-sm uppercase tracking-[0.2em] text-slate-400">Active plans</div>
 <div className="mt-3 text-3xl font-semibold text-white">112</div>
 <div className="mt-2 text-sm text-slate-500">Live subscriptions</div>
 </div>
 </div>
 </Card>
 <Card className="bg-slate-950/90">
 <div className="flex items-center justify-between gap-4">
 <div>
 <p className="text-sm text-slate-400">Branch stats</p>
 <h2 className="text-xl font-semibold text-white">Healthy coverage</h2>
 </div>
 <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm text-emerald-200">92% live</span>
 </div>
 <div className="mt-6 grid gap-4 text-sm text-slate-300">
 <div className="rounded-3xl bg-white/5 p-4">46 branches connected</div>
 <div className="rounded-3xl bg-white/5 p-4">8 pending setup</div>
 <div className="rounded-3xl bg-white/5 p-4">12 managers assigned</div>
 </div>
 </Card>
 </motion.div>
 <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
 <div><RecentTable /></div>
 <div className="space-y-6">
 <Card className="bg-slate-950/90">
 <h4 className="text-lg font-semibold text-white">Recent activity</h4>
 <ul className="mt-5 space-y-4 text-sm text-slate-300">
 <li className="rounded-3xl bg-white/5 p-4">Spice Villa completed payment setup. <span className="text-violet-300">Ready to launch.</span></li>
 <li className="rounded-3xl bg-white/5 p-4">Ocean Bites upgraded to Standard.</li>
 <li className="rounded-3xl bg-white/5 p-4">Green Bowl received staff invite approval.</li>
 </ul>
 </Card>
 <Card className="bg-slate-950/90">
 <div className="flex items-center justify-between">
 <h4 className="text-lg font-semibold text-white">Quick actions</h4>
 <span className="rounded-full bg-white/5 px-3 py-1 text-sm text-slate-300">Pro tips</span>
 </div>
 <div className="mt-5 grid gap-3">
 <button className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-white/10">Invite new restaurant owner</button>
 <button className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-white/10">Review subscription usage</button>
 </div>
 </Card>
 </div>
 </div>
 </div>
 )
}
