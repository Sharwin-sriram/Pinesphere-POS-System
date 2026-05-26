import React from 'react'
import ImageWithFallback from '@/components/ui/ImageWithFallback'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

type Props = {
  name: string
  price: string
  category: string
  availability: 'Available' | 'Out of stock'
  rating: number
  spicy: 'Mild' | 'Medium' | 'Hot'
  imageSrc: string
  imageAlt: string
  footer?: React.ReactNode
}

const spicyMap: Record<Props['spicy'], string> = {
  Mild: 'bg-emerald-500/15 text-emerald-200',
  Medium: 'bg-amber-500/15 text-amber-200',
  Hot: 'bg-rose-500/15 text-rose-200',
}

export default function ItemCard({name, price, category, availability, rating, spicy, imageSrc, imageAlt, footer}: Props) {
  return (
    <Card className="group overflow-hidden bg-slate-950/90 transition-transform duration-200 hover:-translate-y-1 hover:bg-slate-900/95">
      <div className="relative h-52 overflow-hidden rounded-[28px] bg-slate-900/70">
        <ImageWithFallback
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/12 to-transparent" />
      </div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-white">{name}</p>
          <p className="mt-2 text-sm text-slate-400">{category}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold text-white">{price}</p>
          <Badge className={`mt-2 ${availability === 'Available' ? 'bg-emerald-500/15 text-emerald-200' : 'bg-rose-500/15 text-rose-200'}`}>{availability}</Badge>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Badge className={spicyMap[spicy]}>{spicy}</Badge>
        <Badge className="bg-white/5 text-slate-200">{`${rating} \u2605`}</Badge>
      </div>
      {footer ? <div className="mt-5">{footer}</div> : null}
    </Card>
  )
}
