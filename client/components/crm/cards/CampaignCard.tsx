import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

type Props = {
 title: string
 type: string
 status: 'Live' | 'Scheduled' | 'Paused'
 reach: string
 opens: string
 clicks: string
}

const statusStyle: Record<Props['status'], string> = {
 Live: 'bg-emerald-500/10 text-emerald-200',
 Scheduled: 'bg-violet-500/10 text-violet-200',
 Paused: 'bg-rose-500/10 text-rose-200',
}

export default function CampaignCard({ title, type, status, reach, opens, clicks }: Props) {
 return (
 <Card className="group overflow-hidden p-6 transition-all duration-200 hover:-translate-y-1">
 <div className="flex items-center justify-between gap-4">
 <div>
 <p className="text-sm uppercase tracking-[0.24em] text-slate-400">{type}</p>
 <h3 className="mt-3 text-xl font-semibold text-white">{title}</h3>
 </div>
 <Badge className={statusStyle[status]}>{status}</Badge>
 </div>
 <div className="mt-6 grid gap-3 sm:grid-cols-3">
 <div className="rounded-3xl bg-white/5 p-4 text-sm text-slate-300">
 <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Estimated reach</p>
 <p className="mt-2 text-lg font-semibold text-white">{reach}</p>
 </div>
 <div className="rounded-3xl bg-white/5 p-4 text-sm text-slate-300">
 <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Open rate</p>
 <p className="mt-2 text-lg font-semibold text-white">{opens}</p>
 </div>
 <div className="rounded-3xl bg-white/5 p-4 text-sm text-slate-300">
 <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Click rate</p>
 <p className="mt-2 text-lg font-semibold text-white">{clicks}</p>
 </div>
 </div>
 </Card>
 )
}
