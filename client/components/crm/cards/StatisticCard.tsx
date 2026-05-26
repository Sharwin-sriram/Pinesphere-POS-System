import Card from '@/components/ui/Card'

type Props = {
 label: string
 value: string
 detail: string
 accent: 'violet' | 'cyan' | 'emerald' | 'rose'
}

const accentMap: Record<Props['accent'], string> = {
 violet: 'from-violet-500 via-fuchsia-500 to-pink-500',
 cyan: 'from-cyan-400 via-sky-500 to-violet-500',
 emerald: 'from-emerald-400 via-emerald-500 to-cyan-500',
 rose: 'from-rose-400 via-fuchsia-500 to-violet-500',
}

export default function StatisticCard({ label, value, detail, accent }: Props) {
 return (
 <Card className="relative overflow-hidden border-white/10 p-5">
 <div className="absolute -left-16 top-0 h-40 w-40 rounded-full bg-gradient-to-br from-white/5 to-transparent blur-3xl" />
 <div className={`absolute -right-20 top-12 h-48 w-48 rounded-full bg-gradient-to-br ${accentMap[accent]} opacity-20 blur-3xl`} />
 <p className="text-sm uppercase tracking-[0.24em] text-slate-400">{label}</p>
 <p className="mt-4 text-4xl font-semibold text-white sm:text-5xl">{value}</p>
 <p className="mt-3 text-sm leading-6 text-slate-400">{detail}</p>
 </Card>
 )
}
