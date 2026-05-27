"use client"
import { motion } from 'framer-motion'
import Card from '@/components/ui/Card'

type Props = {
 label: string
 value: string
 detail: string
 accent: 'violet' | 'cyan' | 'pink' | 'emerald'
}

const accentMap: Record<Props['accent'], string> = {
 violet: 'from-violet-500/20 to-violet-500/5 text-violet-200',
 cyan: 'from-cyan-500/20 to-cyan-500/5 text-cyan-200',
 pink: 'from-fuchsia-500/20 to-fuchsia-500/5 text-fuchsia-200',
 emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-200',
}

export default function StatCard({label, value, detail, accent}: Props) {
 return (
 <motion.div whileHover={{ y: -4 }} className="rounded-[28px]">
 <Card className={`border border-white/10 bg-slate-950/90 p-6 `}>
 <div className={`inline-flex rounded-full bg-gradient-to-r ${accentMap[accent]} px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]`}>{label}</div>
 <div className="mt-5 text-4xl font-semibold text-white">{value}</div>
 <div className="mt-3 text-sm leading-6 text-slate-400">{detail}</div>
 </Card>
 </motion.div>
 )
}
