"use client"
import { useState } from 'react'
import SectionHeader from '@/components/menu/SectionHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import CRMModal from '@/components/crm/modals/CRMModal'

const feedbackItems = [
  { title: 'Ordered late and loved it', author: 'Eli Nguyen', rating: 5, sentiment: 'Positive', detail: '“The dinner experience felt premium and the loyalty points reward was a great surprise.”' },
  { title: 'Sweet rewards are great', author: 'Zoe Kim', rating: 4.4, sentiment: 'Positive', detail: '“I appreciate the dessert perk and the personalized loyalty offers.”' },
  { title: 'Need faster response', author: 'Noah Patel', rating: 3.8, sentiment: 'Neutral', detail: '“Review response times could be faster for loyalty members.”' },
]

export default function CRMFeedbackPage() {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Feedback center"
        subtitle="Track sentiment and response readiness"
        actionLabel="Review response"
        onAction={() => setOpen(true)}
      />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-6">
          {feedbackItems.map((item) => (
            <Card key={item.title} className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-violet-300">{item.author}</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">{item.title}</h3>
                </div>
                <Badge className="bg-emerald-500/15 text-emerald-200">{item.sentiment}</Badge>
              </div>
              <p className="text-slate-300">{item.detail}</p>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span>Rating:</span>
                <span className="rounded-full bg-white/5 px-3 py-1">{item.rating}</span>
              </div>
            </Card>
          ))}
        </div>

        <Card className="space-y-5">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Feedback trends</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Customer sentiment</h3>
          </div>
          <div className="space-y-4 text-sm text-slate-300">
            <div className="rounded-3xl bg-white/5 p-4">Positive feedback is growing by 11% for loyalty members.</div>
            <div className="rounded-3xl bg-white/5 p-4">Response rate to review requests is at 88%.</div>
            <div className="rounded-3xl bg-white/5 p-4">Satisfaction score for membership offers remains strong.</div>
          </div>
          <Button variant="ghost" onClick={() => setOpen(true)}>Open response modal</Button>
        </Card>
      </div>

      <CRMModal open={open} title="Review response" description="Craft a premium reply for the customer feedback." onClose={() => setOpen(false)}>
        <div className="space-y-4">
          <textarea
            className="w-full rounded-3xl border border-white/10 bg-slate-950/90 p-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/60"
            rows={6}
            defaultValue="Thank you for your feedback! We’re thrilled that you enjoyed the premium experience and loyalty rewards. We’ll continue improving response times and keep delivering VIP service."
          />
          <Button>Send response</Button>
        </div>
      </CRMModal>
    </div>
  )
}
