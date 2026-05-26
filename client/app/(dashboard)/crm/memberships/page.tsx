import SectionHeader from '@/components/menu/SectionHeader'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

const plans = [
 { name: 'Basic', price: '$19/mo', features: ['1x Loyalty bonus', 'Email updates', 'Standard support'], badge: 'Recommended' },
 { name: 'Silver', price: '$39/mo', features: ['2x Loyalty bonus', 'Priority offers', 'Phone support'], badge: 'Popular' },
 { name: 'Gold', price: '$69/mo', features: ['3x Loyalty bonus', 'VIP menu access', 'Fast-track service'], badge: 'Best value' },
 { name: 'VIP', price: '$129/mo', features: ['5x Loyalty bonus', 'Personal concierge', 'Exclusive events'], badge: 'Premium' },
]

export default function CRMMembershipsPage() {
 return (
 <div className="space-y-8">
 <SectionHeader
 title="Membership plans"
 subtitle="Premium loyalty subscriptions and upgrades"
 actionLabel="Edit plans"
 actionHref="/crm/memberships"
 />

 <div className="grid gap-6 xl:grid-cols-4">
 {plans.map((plan) => (
 <Card key={plan.name} className="space-y-5 border-white/10 bg-slate-950/90 p-6">
 <div className="flex items-start justify-between gap-4">
 <div>
 <p className="text-sm uppercase tracking-[0.24em] text-slate-400">{plan.name}</p>
 <h3 className="mt-2 text-3xl font-semibold text-white">{plan.price}</h3>
 </div>
 <Badge className="bg-violet-500/10 text-violet-200">{plan.badge}</Badge>
 </div>
 <ul className="space-y-3 text-sm text-slate-300">
 {plan.features.map((feature) => (
 <li key={feature} className="rounded-3xl bg-white/5 p-3">{feature}</li>
 ))}
 </ul>
 <Button variant="ghost">Select {plan.name}</Button>
 </Card>
 ))}
 </div>

 <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
 <Card className="space-y-5">
 <div>
 <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Renewal status</p>
 <h3 className="mt-2 text-2xl font-semibold text-white">Membership retention</h3>
 </div>
 <div className="grid gap-4 sm:grid-cols-3">
 {[
 { label: 'Active members', value: '1,240' },
 { label: 'Renewal rate', value: '86%' },
 { label: 'Upgrade requests', value: '230' },
 ].map((item) => (
 <div key={item.label} className="rounded-3xl bg-white/5 p-5 text-sm text-slate-300">
 <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
 <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
 </div>
 ))}
 </div>
 </Card>

 <Card className="space-y-5">
 <div>
 <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Member value</p>
 <h3 className="mt-2 text-2xl font-semibold text-white">Subscription renewal</h3>
 </div>
 <p className="text-slate-300">Loyalty members on premium plans generate a higher repeat order value and stronger engagement with seasonal campaigns.</p>
 <Button variant="ghost">Review memberships</Button>
 </Card>
 </div>
 </div>
 )
}
