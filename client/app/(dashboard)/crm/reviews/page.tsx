import SectionHeader from '@/components/menu/SectionHeader'
import ReviewCard from '@/components/crm/cards/ReviewCard'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

const reviews: Array<{ title: string; author: string; rating: number; comment: string; sentiment: 'Positive' | 'Neutral' | 'Negative' }> = [
 { title: 'Amazing service!', author: 'Ava Romero', rating: 5, comment: 'Loved the VIP tasting menu and the special loyalty discount. The staff made it feel premium.', sentiment: 'Positive' },
 { title: 'Great repeat experience', author: 'Mason Lee', rating: 4.6, comment: 'The ambience felt upscale and the loyalty reward checkout was seamless.', sentiment: 'Positive' },
 { title: 'Solid loyalty perks', author: 'Sophia Chen', rating: 4.2, comment: 'Nice benefits, though I would like more customized offers for my favourite meals.', sentiment: 'Neutral' },
]

export default function CRMReviewsPage() {
 return (
 <div className="space-y-8">
 <SectionHeader
 title="Reviews & sentiment"
 subtitle="Capture customer feedback and satisfaction trends"
 actionLabel="Respond to review"
 actionHref="/crm/reviews"
 />

 <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
 <div className="space-y-6">
 {reviews.map((review) => (
 <ReviewCard key={review.title} {...review} />
 ))}
 </div>

 <Card className="space-y-5">
 <div className="flex items-center justify-between gap-4">
 <div>
 <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Rating summary</p>
 <h3 className="mt-2 text-2xl font-semibold text-white">Customer satisfaction</h3>
 </div>
 <Badge className="bg-emerald-500/15 text-emerald-200">Top</Badge>
 </div>
 <div className="rounded-3xl bg-slate-950/80 p-5 text-sm text-slate-300">
 <p className="text-6xl font-semibold text-white">4.82</p>
 <p className="mt-2">Average rating across loyalty members and recent campaign responders.</p>
 </div>
 <div className="rounded-3xl bg-white/5 p-5 text-sm text-slate-300">
 <p className="font-semibold text-white">Review sentiment</p>
 <div className="mt-3 grid gap-3">
 <div className="flex items-center justify-between rounded-3xl bg-slate-950/80 px-4 py-3">
 <span>Positive</span>
 <span>72%</span>
 </div>
 <div className="flex items-center justify-between rounded-3xl bg-slate-950/80 px-4 py-3">
 <span>Neutral</span>
 <span>20%</span>
 </div>
 <div className="flex items-center justify-between rounded-3xl bg-slate-950/80 px-4 py-3">
 <span>Negative</span>
 <span>8%</span>
 </div>
 </div>
 </div>
 </Card>
 </div>
 </div>
 )
}
