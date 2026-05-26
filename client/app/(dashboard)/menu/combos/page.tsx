"use client"
import React, { useDeferredValue, useEffect, useState, useTransition } from 'react'
import { Boxes } from 'lucide-react'
import SectionHeader from '@/components/menu/SectionHeader'
import Carousel from '@/components/menu/Carousel'
import FilterBar from '@/components/menu/FilterBar'
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

type ComboType = 'Family' | 'Lunch' | 'Dessert' | 'Promo'
type ComboStatus = 'Popular' | 'Best seller' | 'Seasonal' | 'Draft'

type ComboRecord = {
 id: string
 title: string
 description: string
 price: string
 status: ComboStatus
 type: ComboType
 servings: string
 imageSrc: string
 active: boolean
}

type ComboForm = {
 title: string
 description: string
 price: string
 status: ComboStatus
 type: ComboType
 servings: string
 imageSrc: string
}

const comboSlides = [
 { id: 'combo-1', label: 'Meal', title: 'Combo meal slideshow', subtitle: 'Bring full meal bundles to life with immersive, animated slides.', background: '/images/menu/combo-1.svg' },
 { id: 'combo-2', label: 'Family', title: 'Family pack previews', subtitle: 'Showcase group-ready offers with premium visual cards.', background: '/images/menu/combo-2.svg' },
 { id: 'combo-3', label: 'Promo', title: 'Promotional banner stories', subtitle: 'Support upsell and limited-time offers with polished motion.', background: '/images/menu/combo-3.svg' },
]

const comboImageOptions = [
 { label: 'Family feast visual', value: '/images/combos/family-pack.svg' },
 { label: 'Promotional special', value: '/images/combos/promo.svg' },
 { label: 'Combo fallback', value: '/images/combos/fallback.svg' },
]

const initialCombos: ComboRecord[] = [
 {
 id: 'combo-family',
 title: 'Family feast',
 description: '2 mains, 2 sides, 4 drinks with premium plating cues for dine-in storytelling.',
 price: '$68.00',
 status: 'Popular',
 type: 'Family',
 servings: 'Serves 4',
 imageSrc: '/images/combos/family-pack.svg',
 active: true,
 },
 {
 id: 'combo-lunch',
 title: 'Lunch duo',
 description: '1 main, 1 starter, 1 drink designed for fast lunch conversion and strong margin control.',
 price: '$28.00',
 status: 'Best seller',
 type: 'Lunch',
 servings: 'Serves 1',
 imageSrc: '/images/combos/fallback.svg',
 active: true,
 },
 {
 id: 'combo-dessert',
 title: 'Sweet finish',
 description: '2 desserts and coffee bundled for late-night upsell campaigns and guest retention.',
 price: '$18.00',
 status: 'Seasonal',
 type: 'Dessert',
 servings: 'Serves 2',
 imageSrc: '/images/combos/promo.svg',
 active: false,
 },
]

const initialForm: ComboForm = {
 title: '',
 description: '',
 price: '',
 status: 'Popular',
 type: 'Family',
 servings: '',
 imageSrc: comboImageOptions[0].value,
}

function validateComboForm(form: ComboForm) {
 const nextErrors: Partial<Record<keyof ComboForm, string>> = {}

 if (!form.title.trim()) nextErrors.title = 'Combo title is required.'
 if (!form.description.trim()) nextErrors.description = 'Describe the combo for the frontend preview.'
 if (!form.price.trim()) {
 nextErrors.price = 'Price is required.'
 } else if (Number(form.price) <= 0) {
 nextErrors.price = 'Price must be greater than zero.'
 }
 if (!form.servings.trim()) nextErrors.servings = 'Serving guidance helps the card feel complete.'
 if (!form.imageSrc) nextErrors.imageSrc = 'Choose a local combo visual.'

 return nextErrors
}

function formatPrice(price: string) {
 return `$${Number(price).toFixed(2)}`
}

export default function MenuCombosPage() {
 const { success, error, confirmDelete } = useToast()
 const [combos, setCombos] = useState(initialCombos)
 const [search, setSearch] = useState('')
 const [typeFilter, setTypeFilter] = useState<'all' | ComboType>('all')
 const [sort, setSort] = useState('status')
 const [liveOnly, setLiveOnly] = useState(false)
 const [isModalOpen, setIsModalOpen] = useState(false)
 const [form, setForm] = useState(initialForm)
 const [errors, setErrors] = useState<Partial<Record<keyof ComboForm, string>>>({})
 const [uploadPreview, setUploadPreview] = useState<string | null>(null)
 const [isPending, startTransition] = useTransition()
 const deferredSearch = useDeferredValue(search)

 useEffect(() => {
 return () => {
 if (uploadPreview?.startsWith('blob:')) {
 URL.revokeObjectURL(uploadPreview)
 }
 }
 }, [uploadPreview])

 const filteredCombos = combos
 .filter((combo) => {
 const matchesSearch =
 combo.title.toLowerCase().includes(deferredSearch.toLowerCase()) ||
 combo.description.toLowerCase().includes(deferredSearch.toLowerCase()) ||
 combo.type.toLowerCase().includes(deferredSearch.toLowerCase())
 const matchesType = typeFilter === 'all' ? true : combo.type === typeFilter
 const matchesLive = liveOnly ? combo.active : true
 return matchesSearch && matchesType && matchesLive
 })
 .sort((left, right) => {
 if (sort === 'price-high') return Number(right.price.replace('$', '')) - Number(left.price.replace('$', ''))
 if (sort === 'alphabetical') return left.title.localeCompare(right.title)
 if (sort === 'status') return left.status.localeCompare(right.status)
 return Number(right.active) - Number(left.active)
 })

 const heroCombos = filteredCombos.slice(0, 2)
 const previewImage = uploadPreview || form.imageSrc

 const resetModalState = () => {
 if (uploadPreview?.startsWith('blob:')) {
 URL.revokeObjectURL(uploadPreview)
 }
 setUploadPreview(null)
 setForm(initialForm)
 setErrors({})
 setIsModalOpen(false)
 }

 const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
 event.preventDefault()

 const nextErrors = validateComboForm(form)
 setErrors(nextErrors)

 if (Object.keys(nextErrors).length > 0) {
 error('Combo details need attention', 'Add the missing fields so this bundle stays polished across cards, tiles, and filters.')
 return
 }

 startTransition(() => {
 setCombos((current) => [
 {
 id: `combo-${Date.now()}`,
 title: form.title.trim(),
 description: form.description.trim(),
 price: formatPrice(form.price),
 status: form.status,
 type: form.type,
 servings: form.servings.trim(),
 imageSrc: form.imageSrc,
 active: true,
 },
 ...current,
 ])
 resetModalState()
 success('Combo created', `${form.title.trim()} is now available in the bundle workspace.`)
 })
 }

 const clearFilters = () => {
 setSearch('')
 setTypeFilter('all')
 setLiveOnly(false)
 setSort('status')
 }

 return (
 <div className="space-y-8">
 <SectionHeader
 title="Combo bundles"
 subtitle="Curated menu packages"
 actionLabel="Create combo"
 onAction={() => setIsModalOpen(true)}
 />

 <Carousel slides={comboSlides} />

 <FilterBar
 eyebrow="Search & filter"
 title="Curate the bundle lineup"
 description="Search combo names, filter by bundle type, and keep active promotions front and center without leaving the existing flow."
 resultLabel={`${filteredCombos.length} bundle cards`}
 searchValue={search}
 onSearchChange={setSearch}
 searchPlaceholder="Search combo names, bundle types, or promo notes"
 sortValue={sort}
 onSortChange={setSort}
 sortOptions={[
 { label: 'Status', value: 'status' },
 { label: 'Highest price', value: 'price-high' },
 { label: 'Alphabetical', value: 'alphabetical' },
 { label: 'Live first', value: 'live' },
 ]}
 chips={[
 { label: 'All', value: 'all', count: combos.length },
 { label: 'Family', value: 'Family' },
 { label: 'Lunch', value: 'Lunch' },
 { label: 'Dessert', value: 'Dessert' },
 { label: 'Promo', value: 'Promo' },
 ]}
 activeChip={typeFilter}
 onChipChange={(value) => setTypeFilter(value as 'all' | ComboType)}
 toggleLabel="Live bundles only"
 toggleChecked={liveOnly}
 onToggleChange={setLiveOnly}
 />

 {heroCombos.length > 0 ? (
 <div className="grid gap-6 lg:grid-cols-2">
 {heroCombos.map((combo) => (
 <ImageTile
 key={combo.id}
 title={combo.title}
 subtitle={combo.description}
 label={combo.type}
 src={combo.imageSrc}
 alt={`${combo.title} combo visual`}
 />
 ))}
 </div>
 ) : null}

 {filteredCombos.length > 0 ? (
 <div className="grid gap-6 xl:grid-cols-3">
 {filteredCombos.map((combo) => (
 <Card key={combo.id} className="space-y-4">
 <div className="flex items-center justify-between gap-4">
 <div>
 <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Bundle</p>
 <h3 className="mt-2 text-xl font-semibold text-white">{combo.title}</h3>
 </div>
 <Badge className="bg-cyan-500/15 text-cyan-200">{combo.status}</Badge>
 </div>
 <p className="text-sm leading-7 text-slate-400">{combo.description}</p>
 <div className="grid gap-3 rounded-3xl bg-white/5 p-4 text-sm">
 <div className="flex items-center justify-between text-slate-300">
 <span>Type</span>
 <span className="font-semibold text-white">{combo.type}</span>
 </div>
 <div className="flex items-center justify-between text-slate-300">
 <span>Servings</span>
 <span className="font-semibold text-white">{combo.servings}</span>
 </div>
 <div className="flex items-center justify-between text-slate-300">
 <span>Status</span>
 <span className={combo.active ? 'font-semibold text-emerald-300' : 'font-semibold text-amber-300'}>{combo.active ? 'Live' : 'Draft'}</span>
 </div>
 </div>
 <div className="rounded-3xl bg-slate-950/80 p-4 text-sm font-semibold text-white">{combo.price}</div>
 <div className="flex flex-wrap gap-2">
 <Button
 size="sm"
 variant="ghost"
 onClick={() => {
 setCombos((current) => current.map((entry) => (entry.id === combo.id ? { ...entry, active: !entry.active } : entry)))
 success(combo.active ? `${combo.title} moved to draft` : `${combo.title} is live`, 'Bundle visibility has been updated for the current session.')
 }}
 >
 {combo.active ? 'Move to draft' : 'Go live'}
 </Button>
 <Button
 size="sm"
 variant="outline"
 onClick={() =>
 confirmDelete({
 title: `Delete ${combo.title}?`,
 description: 'This removes the combo from the current frontend view and reveals the polished empty state when needed.',
 onConfirm: () => {
 setCombos((current) => current.filter((entry) => entry.id !== combo.id))
 success('Combo removed', `${combo.title} has been cleared from the bundle grid.`)
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
 icon={Boxes}
 title="No combos match this bundle view"
 description="Try showing all bundle types again, widen the search, or create a new combo with a guaranteed local visual."
 actionLabel="Reset filters"
 onAction={clearFilters}
 previewSrc="/images/combos/fallback.svg"
 previewAlt="Combo empty state artwork"
 />
 )}

 <Card>
 <div className="grid gap-4 sm:grid-cols-2">
 <div className="rounded-3xl bg-slate-950/80 p-5 text-sm text-slate-300">
 <p className="font-semibold text-white">Combo penetration</p>
 <p className="mt-2 text-slate-400">56% of orders included a combo this week.</p>
 </div>
 <div className="rounded-3xl bg-slate-950/80 p-5 text-sm text-slate-300">
 <p className="font-semibold text-white">Cross-sell impact</p>
 <p className="mt-2 text-slate-400">Combos increased average ticket size by 18%.</p>
 </div>
 </div>
 </Card>

 <Modal
 open={isModalOpen}
 onClose={resetModalState}
 title="Create combo"
 description="Build a premium bundle card with stable local artwork, validation feedback, and a polished preview before it enters the grid."
 footer={
 <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
 <Button variant="ghost" onClick={resetModalState}>
 Cancel
 </Button>
 <Button form="create-combo-form" type="submit" loading={isPending}>
 Create combo
 </Button>
 </div>
 }
 >
 <form id="create-combo-form" className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]" onSubmit={handleSubmit}>
 <div className="space-y-5">
 <Input
 label="Combo title"
 placeholder="Weekend tasting box"
 value={form.title}
 onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
 error={errors.title}
 success={form.title.trim() && !errors.title ? 'Looks good.' : undefined}
 />

 <div className="grid gap-4 sm:grid-cols-2">
 <Input
 label="Price"
 type="number"
 min="1"
 step="0.01"
 placeholder="34"
 value={form.price}
 onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
 error={errors.price}
 />
 <Input
 label="Servings"
 placeholder="Serves 3"
 value={form.servings}
 onChange={(event) => setForm((current) => ({ ...current, servings: event.target.value }))}
 error={errors.servings}
 />
 </div>

 <div className="grid gap-4 sm:grid-cols-2">
 <Select
 label="Bundle type"
 value={form.type}
 onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as ComboType }))}
 >
 <option value="Family">Family</option>
 <option value="Lunch">Lunch</option>
 <option value="Dessert">Dessert</option>
 <option value="Promo">Promo</option>
 </Select>
 <Select
 label="Status"
 value={form.status}
 onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as ComboStatus }))}
 >
 <option value="Popular">Popular</option>
 <option value="Best seller">Best seller</option>
 <option value="Seasonal">Seasonal</option>
 <option value="Draft">Draft</option>
 </Select>
 </div>

 <Select
 label="Local image asset"
 value={form.imageSrc}
 onChange={(event) => setForm((current) => ({ ...current, imageSrc: event.target.value }))}
 error={errors.imageSrc}
 description="Combo visuals stay local, which keeps hero tiles and slideshow cards from ever going blank."
 >
 {comboImageOptions.map((option) => (
 <option key={option.value} value={option.value}>
 {option.label}
 </option>
 ))}
 </Select>

 <Textarea
 label="Description"
 placeholder="Describe what the guest gets and how the offer should feel in the bundle carousel."
 value={form.description}
 onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
 error={errors.description}
 />
 </div>

 <div className="space-y-5">
 <div className="rounded-[28px] border border-white/10 bg-slate-950/80 p-4">
 <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Visual preview</p>
 <div className="mt-4 overflow-hidden rounded-[24px] border border-white/10 bg-slate-900/80">
 {previewImage ? (
 // eslint-disable-next-line @next/next/no-img-element
 <img src={previewImage} alt="Combo preview" className="h-56 w-full object-cover" />
 ) : (
 <div className="flex h-56 items-center justify-center text-sm text-slate-500">Choose an image to preview</div>
 )}
 </div>
 <p className="mt-3 text-xs leading-5 text-slate-500">Upload preview is optional and session-local. Saved combo cards continue using the selected local static asset for full stability.</p>
 </div>

 <label className="block text-sm text-slate-300">
 <span className="mb-2 block font-medium text-slate-200">Upload preview</span>
 <input
 type="file"
 accept="image/*"
 className="w-full rounded-2xl border border-dashed border-white/15 bg-slate-950/80 px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-full file:border-0 file:bg-violet-500/15 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-violet-100"
 onChange={(event) => {
 const file = event.target.files?.[0]
 if (uploadPreview?.startsWith('blob:')) {
 URL.revokeObjectURL(uploadPreview)
 }
 setUploadPreview(file ? URL.createObjectURL(file) : null)
 }}
 />
 </label>
 </div>
 </form>
 </Modal>
 </div>
 )
}
