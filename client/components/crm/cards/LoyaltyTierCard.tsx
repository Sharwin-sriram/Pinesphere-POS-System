import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

type Props = {
  name: string
  level: string
  points: string
  description: string
  accent: 'bronze' | 'silver' | 'gold' | 'platinum'
}

const accentMap: Record<Props['accent'], string> = {
  bronze: 'bg-amber-500/10 text-amber-200 ring-amber-400/20',
  silver: 'bg-slate-200/10 text-slate-200 ring-slate-400/20',
  gold: 'bg-amber-400/10 text-amber-100 ring-amber-300/20',
  platinum: 'bg-violet-500/10 text-violet-100 ring-violet-300/20',
}

export default function LoyaltyTierCard({ name, level, points, description, accent }: Props) {
  return (
    <Card className="relative overflow-hidden p-6">
      <div className={`absolute inset-x-0 top-0 h-24 rounded-b-[32px] ${accentMap[accent]} blur-2xl`} />
      <div className="relative">
        <Badge className="bg-white/10 text-white">{level}</Badge>
        <h3 className="mt-4 text-2xl font-semibold text-white">{name}</h3>
        <p className="mt-2 text-sm text-slate-400">{description}</p>
        <p className="mt-5 text-3xl font-semibold text-white">{points}</p>
      </div>
    </Card>
  )
}
