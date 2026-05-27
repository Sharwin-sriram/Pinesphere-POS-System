import React from 'react'
import Link from 'next/link'
import SectionHeader from '@/components/menu/SectionHeader'
import Carousel from '@/components/menu/Carousel'
import StatCard from '@/components/menu/StatCard'
import CategoryCard from '@/components/menu/CategoryCard'
import Button from '@/components/ui/Button'

const overviewSlides = [
  { id: 'overview-1', label: 'Interiors', title: 'Restaurant interiors reimagined', subtitle: 'Showcase premium dining spaces with mood-driven imagery and intelligent menu flow.', background: '/images/menu/interiors/restaurant-interior.jpg' },
  { id: 'overview-2', label: 'Analytics', title: 'Analytics visuals built for teams', subtitle: 'Keep the menu aligned with revenue and kitchen performance in every shift.', background: '/images/menu/dashboard/menu-performance.jpg' },
  { id: 'overview-3', label: 'Mains', title: 'Onboarding success stories', subtitle: 'Promote staff adoption with polished onboarding visuals and smooth workflows.', background: '/images/menu/categories/mains.jpg' },
  { id: 'overview-4', label: 'Service', title: 'Food service momentum', subtitle: 'Highlight fast-paced service visuals that support a high-energy restaurant brand.', background: '/images/menu/categories/seasonal.jpg' },
]
export default function MenuOverviewPage() {
  return (
    <div className="space-y-8">
      <SectionHeader
        title="Menu management overview"
        subtitle="Restaurant menu operations"
        actionLabel="Add new item"
        actionHref="/menu/items"
      />

      <Carousel slides={overviewSlides} />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="grid gap-6 sm:grid-cols-2">
          <StatCard accent="violet" label="Live categories" value="18" detail="Organize your menu into chef-approved sections." />
          <StatCard accent="cyan" label="Active items" value="124" detail="Track availability and pricing across the day." />
          <StatCard accent="pink" label="Modifier sets" value="26" detail="Flexible add-ons for dietary and upsell options." />
          <StatCard accent="emerald" label="Combo bundles" value="9" detail="Boost average order value with curated combos." />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <CategoryCard
            title="Chef Specials"
            items={12}
            status="Active"
            color="violet"
            imageSrc="/images/menu/categories/mains.jpg"
            imageAlt="Chef special dish presentation"
          />
          <CategoryCard
            title="Beverages"
            items={8}
            status="Active"
            color="cyan"
            imageSrc="/images/menu/categories/drinks.jpg"
            imageAlt="Premium beverage lineup"
          />
          <CategoryCard
            title="Desserts"
            items={14}
            status="Inactive"
            color="yellow"
            imageSrc="/images/menu/categories/desserts.jpg"
            imageAlt="Dessert plate with berries"
          />
          <CategoryCard
            title="Seasonal"
            items={7}
            status="Active"
            color="emerald"
            imageSrc="/images/menu/categories/seasonal.jpg"
            imageAlt="Seasonal restaurant platter"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
        <div className="space-y-5 rounded-[32px] border border-white/10 bg-slate-950/90 p-6 shadow-[0_28px_80px_-40px_rgba(15,23,42,0.8)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Featured item</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Truffle mushroom risotto</h2>
            </div>
            <div className="rounded-3xl bg-white/5 px-4 py-3 text-sm text-slate-200">₹22.00</div>
          </div>
          <p className="text-slate-400">A premium item with seasonal mushrooms, shaved parmesan, and rich truffle jus. Perfect for special dinner menus.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-white/5 p-4 text-sm text-slate-300">
              <p className="font-semibold text-white">Category</p>
              <p className="mt-2 text-slate-400">Mains</p>
            </div>
            <div className="rounded-3xl bg-white/5 p-4 text-sm text-slate-300">
              <p className="font-semibold text-white">Modifier set</p>
              <p className="mt-2 text-slate-400">Add-ons, Spicy, Sides</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/menu/items" className="text-sm font-semibold text-violet-300 transition hover:text-violet-200">
              {'View all items ->'}
            </Link>
            <Link href="/menu/categories" className="text-sm font-semibold text-cyan-300 transition hover:text-cyan-200">
              {'Manage categories ->'}
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[32px] border border-white/10 bg-slate-950/90 p-6 shadow-[0_28px_80px_-40px_rgba(15,23,42,0.8)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Quick actions</p>
                <h2 className="mt-3 text-xl font-semibold text-white">Batch updates</h2>
              </div>
              <Button variant="ghost" className="text-sm text-white">Review workflow</Button>
            </div>
            <div className="mt-6 space-y-3 text-sm text-slate-400">
              <p>Keep your menu in sync with kitchen availability and real-time inventory.</p>
              <p>Enable combo recommendations and seasonal pricing directly from one interface.</p>
            </div>
          </div>
          <div className="rounded-[32px] border border-white/10 bg-slate-950/90 p-6 shadow-[0_28px_80px_-40px_rgba(15,23,42,0.8)]">
            <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Actionable insights</p>
            <div className="mt-5 space-y-4">
              <div className="rounded-3xl bg-white/5 p-4 text-sm text-slate-300">
                <p className="font-semibold text-white">Top selling category</p>
                <p className="mt-2 text-slate-400">Beverages</p>
              </div>
              <div className="rounded-3xl bg-white/5 p-4 text-sm text-slate-300">
                <p className="font-semibold text-white">Most edited item</p>
                <p className="mt-2 text-slate-400">Spicy teriyaki chicken</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
