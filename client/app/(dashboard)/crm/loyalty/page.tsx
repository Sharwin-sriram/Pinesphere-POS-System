import SectionHeader from '@/components/menu/SectionHeader'
import LoyaltyTierCard from '@/components/crm/cards/LoyaltyTierCard'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

export default function CRMLoyaltyPage() {
 return (
 <div className="space-y-8">
 <SectionHeader
 title="Loyalty rewards"
 subtitle="Build premium tiers and reward experiences"
 actionLabel="Manage rewards"
 actionHref="/crm/loyalty"
 />

 <div className="grid gap-6 lg:grid-cols-4">
 <LoyaltyTierCard name="Bronze" level="Bronze" points="0 - 999" description="Starter access with basic reward credits." accent="bronze" />
 <LoyaltyTierCard name="Silver" level="Silver" points="1,000 - 2,499" description="Priority offers and early access." accent="silver" />
 <LoyaltyTierCard name="Gold" level="Gold" points="2,500 - 4,999" description="Exclusive menus and VIP experiences." accent="gold" />
 <LoyaltyTierCard name="Platinum" level="Platinum" points="5,000+" description="Top-tier access with premium benefits." accent="platinum" />
 </div>

 <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
 <Card className="space-y-5">
 <div className="flex items-center justify-between gap-4">
 <div>
 <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Points overview</p>
 <h3 className="mt-2 text-2xl font-semibold text-white">Reward redemption flow</h3>
 </div>
 <Badge className="bg-emerald-500/15 text-emerald-200">Healthy</Badge>
 </div>
 <div className="grid gap-4 sm:grid-cols-2">
 {[
 { label: 'Active rewards', value: '14' },
 { label: 'Expiring points', value: '1,220' },
 ].map((item) => (
 <div key={item.label} className="rounded-3xl bg-white/5 p-5 text-sm text-slate-300">
 <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
 <p className="mt-3 text-2xl font-semibold text-white">{item.value}</p>
 </div>
 ))}
 </div>
 <div className="rounded-3xl bg-slate-950/80 p-5 text-sm text-slate-300">
 Loyalty tier engagement has increased by 12% this quarter with more premium members redeeming experience rewards.
 </div>
 </Card>

 <Card className="space-y-5">
 <div className="flex items-center justify-between gap-4">
 <div>
 <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Reward activity</p>
 <h3 className="mt-2 text-2xl font-semibold text-white">Latest redemptions</h3>
 </div>
 <Button variant="ghost">Review offers</Button>
 </div>
 <div className="space-y-3 text-sm text-slate-300">
 <div className="rounded-3xl bg-white/5 p-4">Gold member redeemed wine pairing reward.</div>
 <div className="rounded-3xl bg-white/5 p-4">Silver member used points for a complimentary appetizer.</div>
 <div className="rounded-3xl bg-white/5 p-4">Platinum member claimed exclusive chef tasting menu access.</div>
 </div>
 </Card>
 </div>
 </div>
 )
}
