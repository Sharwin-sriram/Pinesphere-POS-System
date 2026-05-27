"use client"
import React, { useState, useTransition } from 'react'
import { Settings2 } from 'lucide-react'
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

type ModifierRecord = {
  id: string
  group: string
  options: string
  active: boolean
  note: string
}

type ModifierForm = {
  group: string
  options: string
  active: 'yes' | 'no'
  note: string
}

const modifierSlides = [
  { id: 'modifier-1', label: 'Ingredients', title: 'Ingredient visuals slider', subtitle: 'Showcase what goes into each menu add-on with modern motion.', background: '/images/menu/modifiers/ingredients-visual.jpg' },
  { id: 'modifier-2', label: 'Sauces', title: 'Sauce and add-on previews', subtitle: 'Highlight flavor profiles and complementary extras in a visual carousel.', background: '/images/menu/modifiers/ingredients-visual.jpg' },
]

const initialModifiers: ModifierRecord[] = [
  { id: 'mod-spicy', group: 'Spicy level', options: 'Mild, Medium, Hot', active: true, note: 'Critical for ramen, tacos, and chef specials.' },
  { id: 'mod-protein', group: 'Protein add-ons', options: 'Chicken, Shrimp, Tofu', active: true, note: 'Used across bowls, noodles, and seasonal builds.' },
  { id: 'mod-sauce', group: 'Extra sauces', options: 'Garlic, Chipotle, Herb', active: true, note: 'Strong cross-sell set for lunch and dinner bundles.' },
  { id: 'mod-milk', group: 'Milk alternatives', options: 'Oat, Almond, Soy', active: false, note: 'Currently hidden until the breakfast beverage relaunch.' },
]

const initialForm: ModifierForm = {
  group: '',
  options: '',
  active: 'yes',
  note: '',
}

function validateModifierForm(form: ModifierForm) {
  const nextErrors: Partial<Record<keyof ModifierForm, string>> = {}

  if (!form.group.trim()) nextErrors.group = 'Modifier group name is required.'
  if (!form.options.trim()) nextErrors.options = 'Enter at least one modifier option.'
  if (!form.note.trim()) nextErrors.note = 'Add a quick operations note for the team.'

  return nextErrors
}

export default function MenuModifiersPage() {
  const { success, error, confirmDelete } = useToast()
  const [modifiers, setModifiers] = useState(initialModifiers)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState<Partial<Record<keyof ModifierForm, string>>>({})
  const [isPending, startTransition] = useTransition()

  const resetModalState = () => {
    setForm(initialForm)
    setErrors({})
    setIsModalOpen(false)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors = validateModifierForm(form)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      error('Modifier details need attention', 'Complete the required fields before saving this add-on group.')
      return
    }

    startTransition(() => {
      setModifiers((current) => [
        {
          id: `modifier-${Date.now()}`,
          group: form.group.trim(),
          options: form.options.trim(),
          active: form.active === 'yes',
          note: form.note.trim(),
        },
        ...current,
      ])
      resetModalState()
      success('Modifier added', `${form.group.trim()} is now available in the add-on workspace.`)
    })
  }

  const activeCount = modifiers.filter((modifier) => modifier.active).length

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Modifier sets"
        subtitle="Customize item add-ons"
        actionLabel="Add modifier"
        onAction={() => setIsModalOpen(true)}
      />

      <Carousel slides={modifierSlides} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ImageTile
          title="Ingredient gallery"
          subtitle="Fresh produce, herbs, and pantry essentials for every modifier set."
          label="Ingredients"
          src="/images/menu/modifiers/modifier-1.jpg"
          alt="Ingredient display"
        />
        <ImageTile
          title="Sauce and topping previews"
          subtitle="Showcase rich sauces and unique add-on options with premium imagery."
          label="Sauces"
          src="/images/menu/modifiers/modifier-2.jpg"
          alt="Sauce and topping arrangement"
        />
      </div>

      {modifiers.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {modifiers.map((modifier) => (
            <Card key={modifier.id} className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Modifier group</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">{modifier.group}</h3>
                </div>
                <Badge className={modifier.active ? 'bg-emerald-500/15 text-emerald-200' : 'bg-rose-500/15 text-rose-200'}>
                  {modifier.active ? 'Active' : 'Disabled'}
                </Badge>
              </div>
              <p className="text-sm leading-7 text-slate-400">{modifier.options}</p>
              <div className="rounded-3xl bg-white/5 p-4 text-sm text-slate-300">{modifier.note}</div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setModifiers((current) => current.map((entry) => (entry.id === modifier.id ? { ...entry, active: !entry.active } : entry)))
                    success(
                      modifier.active ? `${modifier.group} disabled` : `${modifier.group} enabled`,
                      'Modifier visibility has been updated for the current frontend session.'
                    )
                  }}
                >
                  {modifier.active ? 'Disable' : 'Enable'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    confirmDelete({
                      title: `Delete ${modifier.group}?`,
                      description: 'This removes the modifier card from the current demo session.',
                      onConfirm: () => {
                        setModifiers((current) => current.filter((entry) => entry.id !== modifier.id))
                        success('Modifier removed', `${modifier.group} has been cleared from the list.`)
                      },
                    })
                  }
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Settings2}
          title="No modifiers available"
          description="Create a fresh add-on group to keep item customization rich and visually complete."
          actionLabel="Add modifier"
          onAction={() => setIsModalOpen(true)}
          previewSrc="/images/menu/modifiers/modifier-fallback.jpg"
          previewAlt="Modifier empty state artwork"
        />
      )}

      <Card>
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Modifier completeness</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Set coverage and consistency</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-950/80 p-4 text-sm text-slate-300">
              <p className="font-semibold text-white">Total modifier groups</p>
              <p className="mt-2 text-emerald-300">{modifiers.length} groups ready</p>
            </div>
            <div className="rounded-3xl bg-slate-950/80 p-4 text-sm text-slate-300">
              <p className="font-semibold text-white">Active groups</p>
              <p className="mt-2 text-slate-400">{activeCount} groups currently visible to operators</p>
            </div>
          </div>
        </div>
      </Card>

      <Modal
        open={isModalOpen}
        onClose={resetModalState}
        title="Add modifier"
        description="Create a reusable add-on set with clear labels, validation feedback, and a polished modal flow."
        footer={
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={resetModalState}>
              Cancel
            </Button>
            <Button form="modifier-form" type="submit" loading={isPending}>
              Save modifier
            </Button>
          </div>
        }
      >
        <form id="modifier-form" className="space-y-5" onSubmit={handleSubmit}>
          <Input
            label="Modifier group"
            placeholder="Topping upgrades"
            value={form.group}
            onChange={(event) => setForm((current) => ({ ...current, group: event.target.value }))}
            error={errors.group}
            success={form.group.trim() && !errors.group ? 'Looks good.' : undefined}
          />
          <Input
            label="Options"
            placeholder="Cheese, avocado, crispy onions"
            value={form.options}
            onChange={(event) => setForm((current) => ({ ...current, options: event.target.value }))}
            error={errors.options}
            description="Separate options with commas to keep the preview readable."
          />
          <Select
            label="Visible by default"
            value={form.active}
            onChange={(event) => setForm((current) => ({ ...current, active: event.target.value as 'yes' | 'no' }))}
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </Select>
          <Textarea
            label="Operations note"
            placeholder="Explain where this modifier group should appear across the item catalog."
            value={form.note}
            onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
            error={errors.note}
          />
        </form>
      </Modal>
    </div>
  )
}
