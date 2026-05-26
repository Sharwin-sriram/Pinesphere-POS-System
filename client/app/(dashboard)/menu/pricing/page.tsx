"use client"
import React, { useState, useTransition } from 'react'
import { Calculator } from 'lucide-react'
import SectionHeader from '@/components/menu/SectionHeader'
import Carousel from '@/components/menu/Carousel'
import ImageTile from '@/components/menu/ImageTile'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/ToastProvider'

type PricingRule = {
  id: string
  name: string
  scope: 'Item' | 'Category'
  target: string
  adjustment: string
  schedule: string
  status: 'Active' | 'Draft'
}

type PricingForm = {
  name: string
  scope: 'Item' | 'Category'
  target: string
  adjustment: string
  schedule: string
  status: 'Active' | 'Draft'
  note: string
}

const pricingSlides = [
  { id: 'pricing-1', label: 'Revenue', title: 'Revenue analytics visuals', subtitle: 'Beautifully present pricing performance with polished motion.', background: '/images/menu/pricing-1.svg' },
  { id: 'pricing-2', label: 'Growth', title: 'Business growth banners', subtitle: 'Highlight expansion and pricing wins in a premium slideshow.', background: '/images/menu/pricing-2.svg' },
]

const initialForm: PricingForm = {
  name: '',
  scope: 'Item',
  target: '',
  adjustment: '',
  schedule: '',
  status: 'Active',
  note: '',
}

function validatePricingForm(form: PricingForm) {
  const nextErrors: Partial<Record<keyof PricingForm, string>> = {}

  if (!form.name.trim()) nextErrors.name = 'Rule name is required.'
  if (!form.target.trim()) nextErrors.target = 'Choose the item or category this rule should affect.'
  if (!form.adjustment.trim()) nextErrors.adjustment = 'Describe the price movement.'
  if (!form.schedule.trim()) nextErrors.schedule = 'Add a schedule or service window.'
  if (!form.note.trim()) nextErrors.note = 'Add a short note so the rule reads clearly in the modal.'

  return nextErrors
}

export default function MenuPricingPage() {
  const { success, error, confirmDelete } = useToast()
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState<Partial<Record<keyof PricingForm, string>>>({})
  const [isPending, startTransition] = useTransition()

  const resetModalState = () => {
    setForm(initialForm)
    setErrors({})
    setIsModalOpen(false)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors = validatePricingForm(form)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      error('Pricing rule needs attention', 'Complete the missing fields before saving this pricing workflow.')
      return
    }

    startTransition(() => {
      setPricingRules((current) => [
        {
          id: `price-${Date.now()}`,
          name: form.name.trim(),
          scope: form.scope,
          target: form.target.trim(),
          adjustment: form.adjustment.trim(),
          schedule: form.schedule.trim(),
          status: form.status,
        },
        ...current,
      ])
      resetModalState()
      success('Pricing rule saved', `${form.name.trim()} is now visible in the pricing table.`)
    })
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Pricing strategy"
        subtitle="Optimize menu revenue"
        actionLabel="Edit pricing"
        onAction={() => setIsModalOpen(true)}
      />

      <Carousel slides={pricingSlides} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ImageTile
          title="Revenue view"
          subtitle="Illustrate pricing performance with premium restaurant and analytics imagery."
          label="Revenue"
          src="/images/menu/pricing-1.svg"
          alt="Restaurant analytics visual"
        />
        <ImageTile
          title="Growth momentum"
          subtitle="Present business growth and pricing strategy with cinematic dining imagery."
          label="Growth"
          src="/images/menu/pricing-2.svg"
          alt="Restaurant business growth imagery"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-5">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Pricing insights</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Smart menu margins</h2>
          </div>
          <div className="grid gap-4">
            {[
              { label: 'Premium pricing', value: '45%', detail: 'Successful high-margin specials without volume drop.' },
              { label: 'Value offers', value: '26%', detail: 'Balanced lower-priced combos for midweek demand.' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-3xl bg-slate-950/80 p-5">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
                <p className="mt-2 text-3xl font-semibold text-white">{stat.value}</p>
                <p className="mt-3 text-sm leading-6 text-slate-400">{stat.detail}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Pricing rules</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Recommended actions</h2>
          </div>
          <div className="space-y-3 text-sm text-slate-300">
            <div className="rounded-3xl bg-white/5 p-4">
              <p className="font-semibold text-white">Boost beverage bundles</p>
              <p className="mt-2 text-slate-400">Increase bundle value by $1 for higher margin without impacting conversion.</p>
            </div>
            <div className="rounded-3xl bg-white/5 p-4">
              <p className="font-semibold text-white">Seasonal markdowns</p>
              <p className="mt-2 text-slate-400">Apply 10% off desserts during slower afternoon shifts.</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        {pricingRules.length > 0 ? (
          <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Pricing rules</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Live pricing matrix</h2>
              </div>
              <Badge className="bg-cyan-500/15 text-cyan-200">{pricingRules.length} configured rules</Badge>
            </div>
            <div className="overflow-x-auto rounded-3xl border border-white/10 bg-slate-950/80">
              <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-slate-300">
                <thead>
                  <tr>
                    <th className="border-b border-white/10 px-6 py-4 text-slate-500">Rule</th>
                    <th className="border-b border-white/10 px-6 py-4 text-slate-500">Scope</th>
                    <th className="border-b border-white/10 px-6 py-4 text-slate-500">Target</th>
                    <th className="border-b border-white/10 px-6 py-4 text-slate-500">Adjustment</th>
                    <th className="border-b border-white/10 px-6 py-4 text-slate-500">Schedule</th>
                    <th className="border-b border-white/10 px-6 py-4 text-slate-500">Status</th>
                    <th className="border-b border-white/10 px-6 py-4 text-slate-500">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pricingRules.map((rule) => (
                    <tr key={rule.id} className="border-b border-white/5">
                      <td className="px-6 py-4 text-white">{rule.name}</td>
                      <td className="px-6 py-4">{rule.scope}</td>
                      <td className="px-6 py-4">{rule.target}</td>
                      <td className="px-6 py-4 text-emerald-300">{rule.adjustment}</td>
                      <td className="px-6 py-4 text-slate-400">{rule.schedule}</td>
                      <td className="px-6 py-4">
                        <Badge className={rule.status === 'Active' ? 'bg-emerald-500/15 text-emerald-200' : 'bg-amber-500/15 text-amber-200'}>
                          {rule.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          className="text-sm font-semibold text-rose-200 transition hover:text-rose-100"
                          onClick={() =>
                            confirmDelete({
                              title: `Delete ${rule.name}?`,
                              description: 'This removes the pricing rule from the current frontend view.',
                              onConfirm: () => {
                                setPricingRules((current) => current.filter((entry) => entry.id !== rule.id))
                                success('Pricing rule removed', `${rule.name} has been removed from the matrix.`)
                              },
                            })
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Calculator}
            title="No pricing rules configured"
            description="Create a rule for service windows, categories, or premium dishes so the pricing workspace never feels empty or unfinished."
            actionLabel="Create pricing rule"
            onAction={() => setIsModalOpen(true)}
            previewSrc="/images/menu/pricing-1.svg"
            previewAlt="Pricing empty state artwork"
          />
        )}
      </Card>

      <Modal
        open={isModalOpen}
        onClose={resetModalState}
        title="Edit pricing"
        description="Create a premium pricing rule with clear validation, status states, and a configuration flow that fits the existing dashboard language."
        footer={
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={resetModalState}>
              Cancel
            </Button>
            <Button form="pricing-rule-form" type="submit" loading={isPending}>
              Save pricing rule
            </Button>
          </div>
        }
      >
        <form id="pricing-rule-form" className="space-y-5" onSubmit={handleSubmit}>
          <Input
            label="Rule name"
            placeholder="Dinner premium uplift"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            error={errors.name}
            success={form.name.trim() && !errors.name ? 'Looks good.' : undefined}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Scope"
              value={form.scope}
              onChange={(event) => setForm((current) => ({ ...current, scope: event.target.value as 'Item' | 'Category' }))}
            >
              <option value="Item">Item</option>
              <option value="Category">Category</option>
            </Select>
            <Select
              label="Status"
              value={form.status}
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as 'Active' | 'Draft' }))}
            >
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
            </Select>
          </div>

          <Input
            label="Target"
            placeholder="Chef specials or Spicy teriyaki chicken"
            value={form.target}
            onChange={(event) => setForm((current) => ({ ...current, target: event.target.value }))}
            error={errors.target}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Adjustment"
              placeholder="+$1.50 or -10%"
              value={form.adjustment}
              onChange={(event) => setForm((current) => ({ ...current, adjustment: event.target.value }))}
              error={errors.adjustment}
            />
            <Input
              label="Schedule"
              placeholder="Dinner service, Fri-Sun"
              value={form.schedule}
              onChange={(event) => setForm((current) => ({ ...current, schedule: event.target.value }))}
              error={errors.schedule}
            />
          </div>

          <Textarea
            label="Rule note"
            placeholder="Add context for why this pricing move exists and when the team should review it."
            value={form.note}
            onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
            error={errors.note}
          />
        </form>
      </Modal>
    </div>
  )
}
