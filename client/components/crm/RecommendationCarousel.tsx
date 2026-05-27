"use client"
import { useState } from 'react'
import RecommendationCard from './RecommendationCard'
import Card from '@/components/ui/Card'

type Item = {
  id: string
  name: string
  category: string
  reason?: string
  popularity?: number
  spiceLevel?: string
  frequency?: number
  image?: string
}

export default function RecommendationCarousel({ items }: { items: Item[] }) {
  const [filter, setFilter] = useState('Most Relevant')
  const filters = ['Most Relevant', 'Trending', 'Similar Taste', 'Frequently Reordered', 'Weekend Picks']

  const filtered = items.slice(0)

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          {filters.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3 py-1 text-xs ${filter === f ? 'bg-violet-600 text-white' : 'bg-white/5 text-slate-300'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="-mx-2 flex gap-4 overflow-x-auto py-2 px-2">
        {filtered.map((it) => (
          <div key={it.id} className="shrink-0">
            <RecommendationCard {...it} />
          </div>
        ))}
      </div>
    </div>
  )
}
