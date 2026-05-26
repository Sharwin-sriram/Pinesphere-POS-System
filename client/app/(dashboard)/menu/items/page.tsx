"use client"
import React, { useDeferredValue, useEffect, useState, useTransition } from 'react'
import { PackageSearch } from 'lucide-react'
import SectionHeader from '@/components/menu/SectionHeader'
import Carousel from '@/components/menu/Carousel'
import ItemCard from '@/components/menu/ItemCard'
import FilterBar from '@/components/menu/FilterBar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/ToastProvider'

type ItemAvailability = 'Available' | 'Out of stock'
type SpicyLevel = 'Mild' | 'Medium' | 'Hot'
type ItemCategory = 'Mains' | 'Starters' | 'Beverages'

type ItemRecord = {
  id: string
  name: string
  price: string
  category: ItemCategory
  availability: ItemAvailability
  rating: number
  spicy: SpicyLevel
  imageSrc: string
  imageAlt: string
  description: string
}

type ItemForm = {
  name: string
  price: string
  category: ItemCategory
  availability: ItemAvailability
  spicy: SpicyLevel
  imageSrc: string
  description: string
}

const itemSlides = [
  { id: 'item-1', label: 'Featured', title: 'Featured dishes carousel', subtitle: 'Make your best-selling plates pop with premium highlight slides.', background: '/images/menu/item-1.svg' },
  { id: 'item-2', label: 'Popular', title: 'Popular menu item previews', subtitle: 'Drive attention to high-demand dishes with smooth slide motion.', background: '/images/menu/item-2.svg' },
  { id: 'item-3', label: 'Highlights', title: 'Item highlight banners', subtitle: 'Pair rich visuals with quick-read item details for a premium catalog.', background: '/images/menu/item-3.svg' },
]

const itemImageOptions = [
  { label: 'Spicy teriyaki plate', value: '/images/items/teriyaki.svg' },
  { label: 'Shrimp taco hero', value: '/images/items/tacos.svg' },
  { label: 'Smoothie spotlight', value: '/images/items/smoothie.svg' },
  { label: 'Premium fallback', value: '/images/items/fallback.svg' },
]

const initialItems: ItemRecord[] = [
  {
    id: 'item-teriyaki',
    name: 'Spicy teriyaki chicken',
    price: '$18.00',
    category: 'Mains',
    availability: 'Available',
    rating: 4.8,
    spicy: 'Hot',
    imageSrc: '/images/items/teriyaki.svg',
    imageAlt: 'Spicy teriyaki chicken plate',
    description: 'High-margin featured plate with premium garnish and combo-friendly positioning.',
  },
  {
    id: 'item-tacos',
    name: 'Crispy shrimp tacos',
    price: '$14.00',
    category: 'Starters',
    availability: 'Available',
    rating: 4.6,
    spicy: 'Medium',
    imageSrc: '/images/items/tacos.svg',
    imageAlt: 'Crispy shrimp tacos',
    description: 'Fast-moving starter tuned for lunch add-ons and shared table ordering.',
  },
  {
    id: 'item-smoothie',
    name: 'Mango coconut smoothie',
    price: '$9.00',
    category: 'Beverages',
    availability: 'Out of stock',
    rating: 4.2,
    spicy: 'Mild',
    imageSrc: '/images/items/smoothie.svg',
    imageAlt: 'Mango coconut smoothie',
    description: 'Cold beverage hero used for premium upsell messaging and summer campaigns.',
  },
  {
    id: 'item-risotto',
    name: 'Truffle mushroom risotto',
    price: '$22.00',
    category: 'Mains',
    availability: 'Available',
    rating: 4.9,
    spicy: 'Mild',
    imageSrc: '/images/items/fallback.svg',
    imageAlt: 'Truffle mushroom risotto visual',
    description: 'Investor-demo signature main with elevated plating and margin-first positioning.',
  },
]

const initialForm: ItemForm = {
  name: '',
  price: '',
  category: 'Mains',
  availability: 'Available',
  spicy: 'Medium',
  imageSrc: itemImageOptions[0].value,
  description: '',
}

function validateItemForm(form: ItemForm) {
  const nextErrors: Partial<Record<keyof ItemForm, string>> = {}

  if (!form.name.trim()) nextErrors.name = 'Item name is required.'
  if (!form.price.trim()) {
    nextErrors.price = 'Price is required.'
  } else if (Number(form.price) <= 0) {
    nextErrors.price = 'Price must be greater than zero.'
  }
  if (!form.imageSrc) nextErrors.imageSrc = 'Choose a local item visual.'
  if (!form.description.trim()) nextErrors.description = 'Add a short menu description for the UI.'

  return nextErrors
}

function formatPrice(price: string) {
  return `$${Number(price).toFixed(2)}`
}

export default function MenuItemsPage() {
  const { success, error, confirmDelete } = useToast()
  const [items, setItems] = useState(initialItems)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | ItemCategory>('all')
  const [sort, setSort] = useState('featured')
  const [availableOnly, setAvailableOnly] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState<Partial<Record<keyof ItemForm, string>>>({})
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

  const filteredItems = items
    .filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(deferredSearch.toLowerCase()) ||
        item.description.toLowerCase().includes(deferredSearch.toLowerCase()) ||
        item.category.toLowerCase().includes(deferredSearch.toLowerCase())
      const matchesCategory = categoryFilter === 'all' ? true : item.category === categoryFilter
      const matchesAvailability = availableOnly ? item.availability === 'Available' : true
      return matchesSearch && matchesCategory && matchesAvailability
    })
    .sort((left, right) => {
      if (sort === 'alphabetical') return left.name.localeCompare(right.name)
      if (sort === 'price-high') return Number(right.price.replace('$', '')) - Number(left.price.replace('$', ''))
      if (sort === 'rating') return right.rating - left.rating
      return Number(right.rating) - Number(left.rating)
    })

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

    const nextErrors = validateItemForm(form)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      error('Item details need attention', 'Fill the required fields so the card, preview, and filters stay consistent.')
      return
    }

    startTransition(() => {
      setItems((current) => [
        {
          id: `item-${Date.now()}`,
          name: form.name.trim(),
          price: formatPrice(form.price),
          category: form.category,
          availability: form.availability,
          rating: 4.7,
          spicy: form.spicy,
          imageSrc: form.imageSrc,
          imageAlt: `${form.name.trim()} item visual`,
          description: form.description.trim(),
        },
        ...current,
      ])
      resetModalState()
      success('Item added', `${form.name.trim()} is ready in the live item catalog.`)
    })
  }

  const clearFilters = () => {
    setSearch('')
    setCategoryFilter('all')
    setAvailableOnly(false)
    setSort('featured')
  }

  const previewImage = uploadPreview || form.imageSrc

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Item catalog"
        subtitle="Review, search, and edit menu items"
        actionLabel="Add item"
        onAction={() => setIsModalOpen(true)}
      />

      <Carousel slides={itemSlides} />

      <FilterBar
        eyebrow="Search & filter"
        title="Find the exact item you need"
        description="Search by dish, category, or merchandising note, then sort the catalog without leaving the current premium flow."
        resultLabel={`${filteredItems.length} visible items`}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by item name, category, or menu note"
        sortValue={sort}
        onSortChange={setSort}
        sortOptions={[
          { label: 'Featured first', value: 'featured' },
          { label: 'Highest price', value: 'price-high' },
          { label: 'Highest rating', value: 'rating' },
          { label: 'Alphabetical', value: 'alphabetical' },
        ]}
        chips={[
          { label: 'All', value: 'all', count: items.length },
          { label: 'Mains', value: 'Mains' },
          { label: 'Starters', value: 'Starters' },
          { label: 'Beverages', value: 'Beverages' },
        ]}
        activeChip={categoryFilter}
        onChipChange={(value) => setCategoryFilter(value as 'all' | ItemCategory)}
        toggleLabel="Available only"
        toggleChecked={availableOnly}
        onToggleChange={setAvailableOnly}
      />

      {filteredItems.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              name={item.name}
              price={item.price}
              category={item.category}
              availability={item.availability}
              rating={item.rating}
              spicy={item.spicy}
              imageSrc={item.imageSrc}
              imageAlt={item.imageAlt}
              footer={
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => success(`${item.name} pinned`, 'The item has been highlighted for the next merchandising pass.')}
                  >
                    Pin item
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      confirmDelete({
                        title: `Remove ${item.name}?`,
                        description: 'This demo action removes the card from the current frontend session only.',
                        onConfirm: () => {
                          setItems((current) => current.filter((entry) => entry.id !== item.id))
                          success('Item removed', `${item.name} has been removed from the visible catalog.`)
                        },
                      })
                    }
                  >
                    Delete
                  </Button>
                </div>
              }
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={PackageSearch}
          title="No menu items match this view"
          description="Broaden the search, include unavailable dishes again, or add a fresh item with a stable local visual to keep the catalog full."
          actionLabel="Reset filters"
          onAction={clearFilters}
          previewSrc="/images/items/fallback.svg"
          previewAlt="Empty state menu item illustration"
        />
      )}

      <Card>
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Stock pulse</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Low inventory items</h2>
            </div>
            <p className="text-sm text-slate-400">Restock planning to avoid menu gaps.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { name: 'Wasabi mayo', detail: 'Only 8 portions left' },
              { name: 'Citrus glaze', detail: 'Prep once before dinner rush' },
              { name: 'Black garlic glaze', detail: 'Low batch threshold reached' },
            ].map((stock) => (
              <div key={stock.name} className="rounded-3xl bg-slate-950/80 p-5 text-sm text-slate-300">
                <p className="font-semibold text-white">{stock.name}</p>
                <p className="mt-2 text-slate-400">{stock.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Modal
        open={isModalOpen}
        onClose={resetModalState}
        title="Add item"
        description="Create a new menu item with a stable local visual, premium preview, and frontend validation that keeps the catalog polished."
        footer={
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={resetModalState}>
              Cancel
            </Button>
            <Button form="add-item-form" type="submit" loading={isPending}>
              Save item
            </Button>
          </div>
        }
      >
        <form id="add-item-form" className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <Input
              label="Item name"
              placeholder="Black garlic noodles"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              error={errors.name}
              success={form.name.trim() && !errors.name ? 'Looks good.' : undefined}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Price"
                type="number"
                min="1"
                step="0.01"
                placeholder="18"
                value={form.price}
                onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                error={errors.price}
              />
              <Select
                label="Category"
                value={form.category}
                onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as ItemCategory }))}
              >
                <option value="Mains">Mains</option>
                <option value="Starters">Starters</option>
                <option value="Beverages">Beverages</option>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Availability"
                value={form.availability}
                onChange={(event) => setForm((current) => ({ ...current, availability: event.target.value as ItemAvailability }))}
              >
                <option value="Available">Available</option>
                <option value="Out of stock">Out of stock</option>
              </Select>
              <Select
                label="Spice level"
                value={form.spicy}
                onChange={(event) => setForm((current) => ({ ...current, spicy: event.target.value as SpicyLevel }))}
              >
                <option value="Mild">Mild</option>
                <option value="Medium">Medium</option>
                <option value="Hot">Hot</option>
              </Select>
            </div>

            <Select
              label="Local image asset"
              value={form.imageSrc}
              onChange={(event) => setForm((current) => ({ ...current, imageSrc: event.target.value }))}
              error={errors.imageSrc}
              description="Saved cards use local artwork only, so thumbnails never fall back to unstable remote URLs."
            >
              {itemImageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>

            <Textarea
              label="Menu note"
              placeholder="Add a short description for merchandising, search, and operational context."
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
                  <img src={previewImage} alt="Item preview" className="h-56 w-full object-cover" />
                ) : (
                  <div className="flex h-56 items-center justify-center text-sm text-slate-500">Choose an image to preview</div>
                )}
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">Upload preview is local to the session. The final saved card still points to the selected local static asset for guaranteed rendering.</p>
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
