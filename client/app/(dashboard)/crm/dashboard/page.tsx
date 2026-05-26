import SectionHeader from '@/components/menu/SectionHeader'
import StatisticCard from '@/components/crm/cards/StatisticCard'
import LineChartPlaceholder from '@/components/crm/charts/LineChartPlaceholder'
import BarChartPlaceholder from '@/components/crm/charts/BarChartPlaceholder'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

const topCustomers = [
  { name: 'Ava Romero', tier: 'Gold', orders: 18, points: '4,280' },
  { name: 'Mason Lee', tier: 'Silver', orders: 12, points: '3,120' },
  { name: 'Sophia Chen', tier: 'Gold', orders: 15, points: '2,950' },
]

export default function CRMAnalyticsDashboard() {
  return (
    <div className="space-y-8">
      <SectionHeader
        title="CRM analytics dashboard"
        subtitle="Customer relationship and loyalty intelligence"
        actionLabel="Launch campaign"
        actionHref="/crm/campaigns"
      />

      <div className="grid gap-6 lg:grid-cols-4">
        <StatisticCard label="Total customers" value="4,820" detail="High-value patrons tracked across loyalty journeys." accent="violet" />
        <StatisticCard label="Active members" value="2,310" detail="Members currently engaged with loyalty rewards." accent="cyan" />
        <StatisticCard label="Points issued" value="138.9k" detail="Loyalty points distributed this month." accent="emerald" />
        <StatisticCard label="Returning customers" value="72%" detail="Repeat visit rate from loyalty segments." accent="rose" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="grid gap-6">
          <LineChartPlaceholder title="Customer growth" subtitle="New accounts and returning members growth" />
          <BarChartPlaceholder title="Retention analytics" subtitle="Loyalty engagement across tiers" />
        </div>

        <div className="grid gap-6">
          <Card className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Membership pulse</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Loyalty performance</h3>
              </div>
              <Badge className="bg-white/10 text-white">Live</Badge>
            </div>
            <div className="grid gap-4">
              {[
                { label: 'Revenue from loyalty', value: '$42.7k' },
                { label: 'Referral statistics', value: '18.4%' },
                { label: 'Satisfaction score', value: '4.82 / 5.0' },
              ].map((item) => (
                <div key={item.label} className="rounded-3xl bg-white/5 p-4">
                  <p className="text-sm text-slate-400">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Birthday reminders</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Upcoming VIP birthdays</h3>
              </div>
              <Badge className="bg-emerald-500/15 text-emerald-200">3 this week</Badge>
            </div>
            <div className="space-y-3">
              {['Ava Romero • Gold', 'Noah Diaz • Platinum', 'Emma Brooks • Silver'].map((person) => (
                <div key={person} className="rounded-3xl bg-slate-950/80 p-4 text-sm text-slate-300">{person}</div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Campaign preview</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Upcoming loyalty push</h3>
              </div>
              <Badge className="bg-violet-500/10 text-violet-200">Scheduled</Badge>
            </div>
            <p className="text-sm leading-7 text-slate-400">Send exclusive reward reminders to active members with a 15% bonus offer on next dine-in orders.</p>
          </Card>
        </div>
      </div>

      <Card className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Top customers</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Premium loyalty leaders</h3>
          </div>
          <Badge className="bg-cyan-500/15 text-cyan-200">Leaderboard</Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {topCustomers.map((customer) => (
            <div key={customer.name} className="rounded-3xl border border-white/10 bg-slate-950/80 p-5">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">{customer.name}</p>
              <p className="mt-3 text-3xl font-semibold text-white">{customer.points}</p>
              <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
                <span>{customer.tier}</span>
                <span>{customer.orders} orders</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
