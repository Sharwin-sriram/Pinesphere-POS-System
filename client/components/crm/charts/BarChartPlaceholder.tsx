type Props = {
 title: string
 subtitle: string
}

export default function BarChartPlaceholder({ title, subtitle }: Props) {
 return (
 <div className="rounded-[32px] border border-white/10 bg-slate-950/90 p-6 ">
 <div className="flex items-center justify-between gap-4">
 <div>
 <p className="text-sm uppercase tracking-[0.24em] text-violet-300">{title}</p>
 <h3 className="mt-3 text-xl font-semibold text-white">{subtitle}</h3>
 </div>
 <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-slate-300">Insights</span>
 </div>
 <div className="mt-6 grid gap-3">
 {['98%', '76%', '54%', '41%'].map((width, index) => (
 <div key={index} className="space-y-2">
 <div className="flex items-center justify-between text-xs text-slate-500">
 <span>{['VIP', 'Gold', 'Silver', 'Bronze'][index]}</span>
 <span>{width}</span>
 </div>
 <div className="h-3 rounded-full bg-white/5">
 <div className={`h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500`} style={{ width }} />
 </div>
 </div>
 ))}
 </div>
 </div>
 )
}
