import React from 'react'
import SectionHeader from '@/components/menu/SectionHeader'
import Carousel from '@/components/menu/Carousel'
import StatCard from '@/components/menu/StatCard'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

const dashboardSlides = [
  { id: 'dashboard-1', label: 'Revenue', title: 'High-impact revenue visuals', subtitle: 'Auto-slide charts and inside data for a modern operations cockpit.', background: '/images/dashboard/revenue-command.svg' },
  { id: 'dashboard-2', label: 'Interior', title: 'Polished dining room imagery', subtitle: 'A premium lounge feel to support the restaurant brand identity.', background: '/images/dashboard/lounge-flow.svg' },
  { id: 'dashboard-3', label: 'Service', title: 'Success metrics in motion', subtitle: 'Present service wins with elegant motion and stable local artwork.', background: '/images/dashboard/service-metrics.svg' },
]

export default function MenuDashboardPage() {
  return (
    <div className="space-y-8">
      <SectionHeader
        title="Menu analytics dashboard"
        subtitle="Real-time menu performance"
        actionLabel="Refresh stats"
        actionHref="/menu"
      />

      <Carousel slides={dashboardSlides} />

      <div className="grid gap-6 lg:grid-cols-3">
        <StatCard accent="violet" label="Conversion rate" value="18.4%" detail="Customers ordering combos and add-ons more often." />
        <StatCard accent="cyan" label="Menu coverage" value="93%" detail="Items available across today's services and teams." />
        <StatCard accent="emerald" label="Weekly revenue" value="$8.9k" detail="Menu-driven sales from featured entrees and bundles." />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Sales momentum</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Trending dishes</h2>
            </div>
            <Badge className="bg-cyan-500/15 text-cyan-200">Live</Badge>
          </div>

          <div className="space-y-4 text-sm leading-7 text-slate-300">
            <div className="rounded-3xl bg-slate-950/80 p-4">
              <p className="font-semibold text-white">Spicy miso ramen</p>
              <p className="mt-2 text-slate-400">+24% order growth</p>
            </div>
            <div className="rounded-3xl bg-slate-950/80 p-4">
              <p className="font-semibold text-white">Herb roasted salmon</p>
              <p className="mt-2 text-slate-400">+17% order growth</p>
            </div>
            <div className="rounded-3xl bg-slate-950/80 p-4">
              <p className="font-semibold text-white">Coconut curry bowl</p>
              <p className="mt-2 text-slate-400">+11% order growth</p>
            </div>
          </div>
        </Card>

        <Card className="space-y-5">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Inventory health</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Stock alerts</h2>
          </div>
          <div className="space-y-3 text-sm text-slate-400">
            <p>New orders require restock for premium mushrooms and chipotle glaze.</p>
            <p>Suggested action: promote available seasonal salads to reduce waste.</p>
          </div>
          <div className="grid gap-3">
            <div className="flex items-center justify-between rounded-3xl bg-white/5 p-4 text-sm text-slate-200">
              <span>Low stock items</span>
              <span className="font-semibold text-white">5</span>
            </div>
            <div className="flex items-center justify-between rounded-3xl bg-white/5 p-4 text-sm text-slate-200">
              <span>Out of stock modifiers</span>
              <span className="font-semibold text-white">2</span>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Insights</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Category performance</h2>
            </div>
            <Badge className="bg-violet-500/15 text-violet-200">Updated 10 minutes ago</Badge>
          </div>
          <div className="overflow-x-auto rounded-3xl border border-white/10 bg-slate-950/80">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-slate-300">
              <thead>
                <tr>
                  <th className="border-b border-white/10 px-6 py-4 text-slate-500">Category</th>
                  <th className="border-b border-white/10 px-6 py-4 text-slate-500">Revenue</th>
                  <th className="border-b border-white/10 px-6 py-4 text-slate-500">Trend</th>
                  <th className="border-b border-white/10 px-6 py-4 text-slate-500">Availability</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { category: 'Mains', revenue: '$4.1k', trend: '+21%', status: 'Excellent' },
                  { category: 'Beverages', revenue: '$2.2k', trend: '+18%', status: 'Strong' },
                  { category: 'Desserts', revenue: '$1.3k', trend: '+9%', status: 'Stable' },
                  { category: 'Small plates', revenue: '$850', trend: '+12%', status: 'Validated' },
                ].map((row) => (
                  <tr key={row.category} className="border-b border-white/5">
                    <td className="px-6 py-4 text-white">{row.category}</td>
                    <td className="px-6 py-4">{row.revenue}</td>
                    <td className="px-6 py-4 text-emerald-300">{row.trend}</td>
                    <td className="px-6 py-4 text-slate-300">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  )
}
