import React from 'react'
import ImageWithFallback from '@/components/ui/ImageWithFallback'
import Card from '@/components/ui/Card'

type Props = {
 title: string
 items: number
 status: 'Active' | 'Inactive'
 color: 'violet' | 'yellow' | 'emerald' | 'cyan'
 imageSrc: string
 imageAlt: string
 footer?: React.ReactNode
}

const colorMap: Record<Props['color'], string> = {
 violet: 'bg-violet-500/15 text-violet-200',
 yellow: 'bg-amber-500/15 text-amber-200',
 emerald: 'bg-emerald-500/15 text-emerald-200',
 cyan: 'bg-cyan-500/15 text-cyan-200',
}

export default function CategoryCard({title, items, status, color, imageSrc, imageAlt, footer}: Props) {
 return (
 <Card className="group overflow-hidden bg-slate-950/90 transition-transform duration-200 hover:-translate-y-1 hover:bg-slate-900/95">
 <div className="relative h-44 overflow-hidden rounded-[28px] bg-slate-900/70">
 <ImageWithFallback
 src={imageSrc}
 alt={imageAlt}
 fill
 sizes="(max-width: 640px) 100vw, 33vw"
 className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
 />
 <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/12 to-transparent" />
 </div>
 <div className="flex items-center justify-between gap-4">
 <div>
 <p className="text-lg font-semibold text-white">{title}</p>
 <p className="mt-2 text-sm text-slate-400">{items} menu items</p>
 </div>
 <div className={`rounded-3xl px-3 py-1 text-sm font-semibold ${colorMap[color]}`}>{status}</div>
 </div>
 <div className="mt-5 rounded-[28px] bg-gradient-to-br from-white/5 via-white/10 to-transparent p-5 text-sm text-slate-300">
 Discover top dishes and curated pairings in this section.
 </div>
 {footer ? <div className="mt-5">{footer}</div> : null}
 </Card>
 )
}
