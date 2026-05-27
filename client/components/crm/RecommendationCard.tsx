"use client"
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

type Props = {
  id: string
  name: string
  category: string
  reason?: string
  popularity?: number
  spiceLevel?: string
  frequency?: number
  image?: string
}

export default function RecommendationCard({ name, category, reason, popularity = 72, spiceLevel, frequency = 3, image }: Props) {
  return (
    <Card className="w-56 transform-gpu hover:-translate-y-1 transition-shadow duration-300 rounded-2xl bg-slate-900/70 shadow-2xl">
      <div className="relative h-40 w-full overflow-hidden rounded-t-2xl bg-slate-800/40">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-500">Image</div>
        )}
        <div className="absolute -bottom-3 left-4 rounded-full bg-violet-500/30 px-3 py-1 text-sm text-white backdrop-blur">
          {spiceLevel ? <span>{spiceLevel.toUpperCase()}</span> : <span>POPULAR</span>}
        </div>
      </div>
      <div className="p-4 text-sm text-slate-300">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-lg font-semibold text-white">{name}</div>
            <div className="mt-1 text-xs text-slate-400">{category}</div>
          </div>
          <Badge className="bg-violet-600/10 text-violet-200">{Math.round(popularity)}%</Badge>
        </div>
        <p className="mt-3 text-xs text-slate-400">{reason}</p>
        <div className="mt-4 flex items-center justify-between text-xs text-slate-300">
          <div>Preorders: <span className="text-white font-medium">{frequency}x</span></div>
          <div className="text-slate-400">⭐ {Math.round(popularity / 10)}</div>
        </div>
      </div>
    </Card>
  )
}
