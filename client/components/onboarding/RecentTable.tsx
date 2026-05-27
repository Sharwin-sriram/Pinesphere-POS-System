"use client"
import React from 'react'
import { motion } from 'framer-motion'
import Card from '../ui/Card'

const rows = [
 {name:'Spice Villa', owner:'Asha Mehra', plan:'Premium', date:'May 20', status:'Active'},
 {name:'Ocean Bites', owner:'Rahul Singh', plan:'Standard', date:'May 18', status:'On Trial'},
 {name:'Green Bowl', owner:'Maya Rao', plan:'Basic', date:'May 15', status:'Pending'},
]

const statusClasses: Record<string, string> = {
 Active: 'bg-emerald-500/15 text-emerald-200',
 'On Trial': 'bg-sky-500/15 text-sky-200',
 Pending: 'bg-amber-500/15 text-amber-200',
}

export default function RecentTable(){
 return (
 <Card className="bg-slate-950/90">
 <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <h4 className="text-lg font-semibold text-white">Recent registrations</h4>
 <p className="mt-2 text-sm text-slate-400">Track the latest restaurants that completed onboarding.</p>
 </div>
 <div className="inline-flex rounded-full bg-white/5 px-4 py-2 text-sm text-slate-300">Latest 3 entries</div>
 </div>
 <div className="mt-6 overflow-x-auto rounded-[28px] border border-white/10">
 <table className="min-w-[720px] w-full text-left text-sm">
 <thead className="bg-slate-950/80 text-slate-400">
 <tr>
 <th className="px-4 py-4">Restaurant</th>
 <th className="px-4 py-4">Owner</th>
 <th className="px-4 py-4">Plan</th>
 <th className="px-4 py-4">Joined</th>
 <th className="px-4 py-4">Status</th>
 </tr>
 </thead>
 <tbody>
 {rows.map((row, index) => (
 <motion.tr
 key={row.name}
 initial={{opacity:0, y:12}}
 animate={{opacity:1, y:0}}
 transition={{delay: index * 0.05, duration: 0.25}}
 className="border-t border-white/5 hover:bg-white/5 transition"
 >
 <td className="px-4 py-4 text-white">{row.name}</td>
 <td className="px-4 py-4 text-slate-300">{row.owner}</td>
 <td className="px-4 py-4 text-slate-300">{row.plan}</td>
 <td className="px-4 py-4 text-slate-400">{row.date}</td>
 <td className="px-4 py-4">
 <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[row.status]}`}>{row.status}</span>
 </td>
 </motion.tr>
 ))}
 </tbody>
 </table>
 </div>
 </Card>
 )
}
