type Props = {
 title: string
 subtitle: string
}

export default function LineChartPlaceholder({ title, subtitle }: Props) {
 return (
 <div className="rounded-[32px] border border-white/10 bg-slate-950/90 p-6 ">
 <div className="flex items-start justify-between gap-4">
 <div>
 <p className="text-sm uppercase tracking-[0.24em] text-violet-300">{title}</p>
 <h3 className="mt-3 text-xl font-semibold text-white">{subtitle}</h3>
 </div>
 <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-slate-300">Live</span>
 </div>
 <div className="mt-6 h-64 rounded-[28px] bg-gradient-to-b from-slate-900/90 via-slate-950/80 to-slate-900/95 p-4">
 <div className="relative h-full overflow-hidden rounded-[24px] bg-slate-950/80 p-4">
 <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/100 to-transparent" />
 <div className="absolute left-4 bottom-4 h-24 w-4 rounded-full bg-violet-400/40 blur-sm" />
 <div className="absolute left-20 bottom-10 h-32 w-4 rounded-full bg-cyan-400/35 blur-sm" />
 <div className="absolute left-52 bottom-14 h-40 w-4 rounded-full bg-emerald-400/30 blur-sm" />
 <div className="absolute left-80 bottom-8 h-28 w-4 rounded-full bg-pink-400/35 blur-sm" />
 </div>
 </div>
 </div>
 )
}
