import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { Star } from 'lucide-react'

type Props = {
  title: string
  author: string
  rating: number
  comment: string
  sentiment: 'Positive' | 'Neutral' | 'Negative'
}

const sentimentStyle: Record<Props['sentiment'], string> = {
  Positive: 'bg-emerald-500/10 text-emerald-200',
  Neutral: 'bg-slate-500/10 text-slate-200',
  Negative: 'bg-rose-500/10 text-rose-200',
}

export default function ReviewCard({ title, author, rating, comment, sentiment }: Props) {
  return (
    <Card className="relative overflow-hidden p-6">
      <div className="absolute -right-12 top-8 h-36 w-36 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-2">
          <Badge className={sentimentStyle[sentiment]}>{sentiment}</Badge>
          <div className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 text-sm text-white">
            <Star className="h-4 w-4 text-yellow-300" /> {rating.toFixed(1)}
          </div>
        </div>
        <h3 className="mt-4 text-xl font-semibold text-white">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-300">{comment}</p>
        <div className="mt-5 border-t border-white/10 pt-4 text-sm text-slate-400">Review by {author}</div>
      </div>
    </Card>
  )
}
