"use client"
import { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import RecommendationCarousel from './RecommendationCarousel'
import CustomerTasteProfile from './CustomerTasteProfile'
import { mockCustomers, mockItems, mockCombos } from './mockCustomerInsights'
import { generateRecommendations } from './utils/recommendationEngine'

export default function CRMRecommendationsSection() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    // pick first mock customer for demo
    const customer = mockCustomers[0]
    const rec = generateRecommendations(customer, mockItems as any, mockCombos as any)
    setData({ customer, rec })
  }, [])

  if (!data) return null

  const { rec, customer } = data

  const tasteBadges = [
    '🔥 Spicy Lover',
    '🥤 Beverage Enthusiast',
    '🍜 Asian Cuisine Fan',
    '🍰 Dessert Explorer',
  ]

  return (
    <section className="space-y-6">
      <Card className="overflow-hidden rounded-3xl bg-slate-900/60 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-violet-300">AI-powered preorder insights</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Smart Recommendations</h3>
            <p className="mt-2 text-sm text-slate-300">{rec.personalizedMessage}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-pink-600/60 px-4 py-2 text-sm font-medium text-white shadow-lg">{customer.name}</div>
            <Badge className="bg-violet-500/10 text-violet-200">Premium</Badge>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-6 text-sm text-slate-300">
          <div>Recommendations: <span className="text-white font-medium">{rec.recommendedItems.length}</span></div>
          <div>Combos: <span className="text-white font-medium">{rec.recommendedCombos.length}</span></div>
          <div>Top categories: <span className="text-white font-medium">{rec.recommendedCategories.join(', ')}</span></div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div>
          <RecommendationCarousel items={rec.recommendedItems.map((it: any) => ({
            id: it.id,
            name: it.name,
            category: it.category,
            reason: `Based on your preorder history and preferences`,
            popularity: 80,
            spiceLevel: it.spiceLevel,
            frequency: 2,
            image: it.image,
          }))} />
        </div>

        <div className="space-y-4">
          <Card className="rounded-2xl p-4 bg-slate-900/70">
            <h4 className="text-sm uppercase tracking-wider text-violet-300">Combo recommendations</h4>
            <div className="mt-3 space-y-3">
              {rec.recommendedCombos.map((c: any) => (
                <div key={c.id} className="rounded-xl bg-white/5 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">{c.name}</div>
                      <div className="text-xs text-slate-400">Includes {c.items.length} items</div>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-200">{Math.round(c.popularity || 75)}%</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <CustomerTasteProfile tastes={tasteBadges} />
        </div>
      </div>
    </section>
  )
}
