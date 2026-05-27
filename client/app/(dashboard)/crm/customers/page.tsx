import SectionHeader from '@/components/menu/SectionHeader'
import FiltersPanel from '@/components/crm/forms/FiltersPanel'
import CustomersTable from '@/components/crm/tables/CustomersTable'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Star, Sparkles } from 'lucide-react'
import CRMRecommendationsSection from '@/components/crm/CRMRecommendationsSection'

const customerCards = [
  { name: 'Ava Romero', points: '4,280', tier: 'Gold', status: 'Active', favorite: 'Truffle risotto' },
  { name: 'Mason Lee', points: '3,120', tier: 'Silver', status: 'Returning', favorite: 'Miso ramen' },
  { name: 'Sophia Chen', points: '2,950', tier: 'Gold', status: 'Active', favorite: 'Citrus salad' },
]

export default function CRMCustomersPage() {
  return (
    <div className="space-y-8">
      <SectionHeader
        title="Customer management"
        subtitle="Explore loyalty profiles and membership tier data"
        actionLabel="Add customer"
        actionHref="/crm/customers"
      />

      <FiltersPanel />

      <CRMRecommendationsSection />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <CustomersTable />

        <div className="space-y-6">
          <Card className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Spending insights</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Customer value</h3>
              </div>
              <Badge className="bg-emerald-500/15 text-emerald-200">Fresh</Badge>
            </div>
            <div className="rounded-3xl bg-slate-900/80 p-5 text-sm text-slate-300">
              <p className="font-semibold text-white">Average order frequency</p>
              <p className="mt-3">2.8 visits / month</p>
            </div>
            <div className="rounded-3xl bg-slate-900/80 p-5 text-sm text-slate-300">
              <p className="font-semibold text-white">Favorite category</p>
              <p className="mt-3">Mains + Beverages</p>
            </div>
          </Card>

          <Card className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Profile highlights</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Top loyalty customers</h3>
              </div>
              <Sparkles className="h-6 w-6 text-violet-300" />
            </div>
            <div className="space-y-4">
              {customerCards.map((customer) => (
                <div key={customer.name} className="rounded-3xl bg-slate-950/80 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-white">{customer.name}</p>
                      <p className="text-sm text-slate-400">{customer.favorite}</p>
                    </div>
                    <Badge className="bg-violet-500/10 text-violet-200">{customer.tier}</Badge>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-slate-300">
                    <p>{customer.points} pts</p>
                    <p>{customer.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Recent orders</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Latest activity</h3>
              </div>
              <Button variant="ghost">View all</Button>
            </div>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="rounded-3xl bg-white/5 p-4">Ava Romero redeemed 800 points for dessert at 12:28 PM.</div>
              <div className="rounded-3xl bg-white/5 p-4">Mason Lee placed a ₹68 dinner order with VIP discount.</div>
              <div className="rounded-3xl bg-white/5 p-4">Sophia Chen upgraded to Gold tier after 3 visits this week.</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
