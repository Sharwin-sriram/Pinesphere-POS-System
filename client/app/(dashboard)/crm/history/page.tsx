import SectionHeader from '@/components/menu/SectionHeader'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

const timeline = [
 { event: 'New loyalty tier launched', time: 'Today • 09:30 AM', status: 'Success' },
 { event: 'Reward campaign scheduled', time: 'Yesterday • 04:15 PM', status: 'Live' },
 { event: 'Customer tier upgrade', time: '2 days ago • 11:00 AM', status: 'Update' },
 { event: 'Review response completed', time: '3 days ago • 05:20 PM', status: 'Info' },
]

export default function CRMHistoryPage() {
 return (
 <div className="space-y-8">
 <SectionHeader
 title="CRM history"
 subtitle="Audit log and customer activity timeline"
 actionLabel="Export history"
 actionHref="/crm/history"
 />

 <Card className="space-y-6">
 <div className="flex items-center justify-between gap-4">
 <div>
 <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Timeline</p>
 <h3 className="mt-2 text-2xl font-semibold text-white">Recent CRM events</h3>
 </div>
 <Badge className="bg-cyan-500/15 text-cyan-200">Audit</Badge>
 </div>
 <div className="space-y-4">
 {timeline.map((item) => (
 <div key={item.event} className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-slate-950/80 p-5 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <p className="text-lg font-semibold text-white">{item.event}</p>
 <p className="mt-1 text-sm text-slate-400">{item.time}</p>
 </div>
 <Badge className="bg-white/10 text-white">{item.status}</Badge>
 </div>
 ))}
 </div>
 </Card>

 <div className="grid gap-6 lg:grid-cols-2">
 <Card className="space-y-4">
 <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Member actions</p>
 <div className="grid gap-3">
 <div className="rounded-3xl bg-white/5 p-4 text-slate-300">Added 120 new loyalty members this week.</div>
 <div className="rounded-3xl bg-white/5 p-4 text-slate-300">Notified upcoming birthday rewards to 32 members.</div>
 </div>
 </Card>
 <Card className="space-y-4">
 <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Campaign log</p>
 <div className="grid gap-3">
 <div className="rounded-3xl bg-white/5 p-4 text-slate-300">Loyalty email campaign opened by 62% of the segment.</div>
 <div className="rounded-3xl bg-white/5 p-4 text-slate-300">SMS reminder sent to 8,900 customers successfully.</div>
 </div>
 </Card>
 </div>
 </div>
 )
}
