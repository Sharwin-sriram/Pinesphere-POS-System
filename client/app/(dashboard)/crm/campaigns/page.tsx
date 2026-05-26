import SectionHeader from '@/components/menu/SectionHeader'
import CampaignCard from '@/components/crm/cards/CampaignCard'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

const campaigns: Array<{ title: string; type: string; status: 'Live' | 'Scheduled' | 'Paused'; reach: string; opens: string; clicks: string }> = [
 { title: 'Weekend VIP invitations', type: 'Email campaign', status: 'Live', reach: '12.4k', opens: '52%', clicks: '18%' },
 { title: 'SMS reward reminder', type: 'SMS campaign', status: 'Scheduled', reach: '8.9k', opens: '48%', clicks: '14%' },
 { title: 'WhatsApp specials', type: 'WhatsApp campaign', status: 'Paused', reach: '5.6k', opens: '61%', clicks: '22%' },
]

export default function CRMCampaignsPage() {
 return (
 <div className="space-y-8">
 <SectionHeader
 title="Campaign management"
 subtitle="Launch promotions and loyalty outreach"
 actionLabel="New campaign"
 actionHref="/crm/campaigns"
 />

 <div className="grid gap-6 lg:grid-cols-3">
 {campaigns.map((campaign) => (
 <CampaignCard key={campaign.title} {...campaign} />
 ))}
 </div>

 <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
 <Card className="space-y-5">
 <div className="flex items-center justify-between gap-4">
 <div>
 <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Performance</p>
 <h3 className="mt-2 text-2xl font-semibold text-white">Campaign reach & engagement</h3>
 </div>
 <Badge className="bg-cyan-500/15 text-cyan-200">Insights</Badge>
 </div>
 <div className="grid gap-4 md:grid-cols-3">
 <div className="rounded-3xl bg-white/5 p-5 text-sm text-slate-300">
 <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Open rate</p>
 <p className="mt-2 text-2xl font-semibold text-white">54%</p>
 </div>
 <div className="rounded-3xl bg-white/5 p-5 text-sm text-slate-300">
 <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Click rate</p>
 <p className="mt-2 text-2xl font-semibold text-white">19%</p>
 </div>
 <div className="rounded-3xl bg-white/5 p-5 text-sm text-slate-300">
 <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Conversions</p>
 <p className="mt-2 text-2xl font-semibold text-white">8.2%</p>
 </div>
 </div>
 </Card>

 <Card className="space-y-5">
 <div className="flex items-center justify-between gap-4">
 <div>
 <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Audience</p>
 <h3 className="mt-2 text-2xl font-semibold text-white">Target segments</h3>
 </div>
 <Badge className="bg-violet-500/10 text-violet-200">Optimized</Badge>
 </div>
 <div className="space-y-4 text-sm text-slate-300">
 <div className="rounded-3xl bg-white/5 p-4">Gold members with birthdays this month.</div>
 <div className="rounded-3xl bg-white/5 p-4">Guests who ordered dessert three times in the last 30 days.</div>
 <div className="rounded-3xl bg-white/5 p-4">Inactive VIPs with balance points pending.</div>
 </div>
 </Card>
 </div>
 </div>
 )
}
