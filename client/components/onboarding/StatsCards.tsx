"use client"
import React from 'react'
import { motion } from 'framer-motion'
import Card from '../ui/Card'

const stats = [
 {label: 'Total restaurants', value: '1,248', accent: 'bg-violet-500/10 text-violet-200'},
 {label: 'Active subscriptions', value: '874', accent: 'bg-fuchsia-500/10 text-fuchsia-200'},
 {label: 'Trial accounts', value: '134', accent: 'bg-sky-500/10 text-sky-200'},
]

export default function StatsCards(){
 return (
 <div className="grid gap-4 lg:grid-cols-3">
 {stats.map((item, index) => (
 <motion.div
 key={item.label}
 initial={{opacity:0, y:20}}
 animate={{opacity:1, y:0}}
 transition={{delay: index * 0.08, duration: 0.35}}
 >
 <Card className="overflow-hidden bg-slate-950/90">
 <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${item.accent}`}>{item.label}</div>
 <div className="mt-5 text-4xl font-semibold tracking-tight text-white">{item.value}</div>
 <p className="mt-3 text-sm leading-6 text-slate-400">Insightful growth metrics for every restaurant onboarding stage.</p>
 </Card>
 </motion.div>
 ))}
 </div>
 )
}
