"use client"
import React, { useDeferredValue, useEffect, useState, useTransition } from 'react'
import { FolderTree, ImagePlus } from 'lucide-react'
import SectionHeader from '@/components/menu/SectionHeader'
import Carousel from '@/components/menu/Carousel'
import CategoryCard from '@/components/menu/CategoryCard'
import FilterBar from '@/components/menu/FilterBar'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/ToastProvider'

type CategoryColor = 'violet' | 'yellow' | 'emerald' | 'cyan'
type CategoryStatus = 'Active' | 'Inactive'
type CategorySegment = 'Core' | 'Seasonal' | 'Beverage' | 'Dessert'

type CategoryRecord = {
  id: string
  name: string
  items: number
  status: CategoryStatus
  color: CategoryColor
  segment: CategorySegment
  imageSrc: string
  imageAlt: string
  description: string
  updatedAt: string
}

type CategoryForm = {
  name: string
  items: string
  status: CategoryStatus
  color: CategoryColor
  segment: CategorySegment
  imageSrc: string
  description: string
}

const categorySlides = [
  { id: 'category-1', label: 'Food', title: 'Category food image gallery', subtitle: 'Preview menus with premium category visuals designed for quick edits.', background: '/images/categories/mains.svg' },
  { id: 'category-2', label: 'Starters', title: 'Starters and sharables', subtitle: 'Highlight opening bites with rich mood-focused imagery.', background: '/images/categories/starters.svg' },
  { id: 'category-3', label: 'Drinks', title: 'Drink menu previews', subtitle: 'Show beverage selections with modern color-rich banners.', background: '/images/categories/drinks.svg' },
  { id: 'category-4', label: 'Desserts', title: 'Dessert showcase', subtitle: 'Bring sweet menu sections to life with elegant visual cues.', background: '/images/categories/desserts.svg' },
]

const categoryImageOptions = [
  { label: 'Starters visual', value: '/images/categories/starters.svg' },
  { label: 'Premium mains', value: '/images/categories/mains.svg' },
  { label: 'Sides collection', value: '/images/categories/sides.svg' },
  { label: 'Dessert showcase', value: '/images/categories/desserts.svg' },
  { label: 'Craft beverages', value: '/images/categories/drinks.svg' },
  { label: 'Seasonal specials', value: '/images/categories/seasonal.svg' },
]

const initialCategories: CategoryRecord[] = [
  {
    id: 'cat-starters',
    name: 'Starters',
    items: 14,
    status: 'Active',
    color: 'yellow',
    segment: 'Core',
    imageSrc: '/images/categories/starters.svg',
    imageAlt: 'Gourmet starter platter',
    description: 'Fast-moving openers and shareables for peak traffic windows.',
    updatedAt: '2 days ago',
  },
  {
    id: 'cat-mains',
    name: 'Mains',
    items: 32,
    status: 'Active',
    color: 'violet',
    segment: 'Core',
    imageSrc: '/images/categories/mains.svg',
    imageAlt: 'Premium main course dish',
    description: 'High-value signature entrees engineered for margin and consistency.',
    updatedAt: '5 hours ago',
  },
  {
    id: 'cat-sides',
    name: 'Sides',
    items: 16,
    status: 'Active',
    color: 'emerald',
    segment: 'Core',
    imageSrc: '/images/categories/sides.svg',
    imageAlt: 'Chef-prepared side dishes',
    description: 'Upsell-friendly accompaniments that pair with lunch and dinner mains.',
    updatedAt: 'Yesterday',
  },
  {
    id: 'cat-desserts',
    name: 'Desserts',
    items: 11,
    status: 'Inactive',
    color: 'cyan',
    segment: 'Dessert',
    imageSrc: '/images/categories/desserts.svg',
    imageAlt: 'Hotel-style plated dessert',
    description: 'Premium plated sweets prepared for evening service relaunches.',
    updatedAt: '4 days ago',
  },
  {
    id: 'cat-drinks',
    name: 'Drinks',
    items: 20,
    status: 'Active',
    color: 'cyan',
    segment: 'Beverage',
    imageSrc: '/images/categories/drinks.svg',
    imageAlt: 'Craft beverage selection',
    description: 'Cocktails, coffee, and premium cold drinks tuned for cross-sell lift.',
    updatedAt: '1 hour ago',
  },
  {
    id: 'cat-seasonal',
    name: 'Seasonal',
    items: 7,
    status: 'Active',
    color: 'violet',
    segment: 'Seasonal',
    imageSrc: '/images/categories/seasonal.svg',
    imageAlt: 'Seasonal chef special assortment',
    description: 'Limited-time chef drops designed for investor demos and campaign launches.',
    updatedAt: 'Just now',
  },
]

const initialForm: CategoryForm = {
  name: '',
  items: '',
  status: 'Active',
  color: 'violet',
  segment: 'Core',
  imageSrc: categoryImageOptions[0].value,
  description: '',
}

function validateCategoryForm(form: CategoryForm) {
  const nextErrors: Partial<Record<keyof CategoryForm, string>> = {}

  if (!form.name.trim()) nextErrors.name = 'Category name is required.'
  if (!form.items.trim()) {
    nextErrors.items = 'Estimated item count is required.'
  } else if (Number(form.items) <= 0) {
    nextErrors.items = 'Item count must be greater than zero.'
  }
  if (!form.imageSrc) nextErrors.imageSrc = 'Choose a local visual for this category.'
  if (!form.description.trim()) nextErrors.description = 'Add a short operational description for the team.'

  return nextErrors
}

export default function MenuCategoriesPage() {
  const { success, error, confirmDelete } = useToast()
  const [categories, setCategories] = useState(initialCategories)
  const [search, setSearch] = useState('')
  const [segmentFilter, setSegmentFilter] = useState<'all' | CategorySegment>('all')
  const [sort, setSort] = useState('recent')
  const [activeOnly, setActiveOnly] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState<Partial<Record<keyof CategoryForm, string>>>({})
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

  const filteredCategories = categories
    .filter((category) => {
      const matchesSearch =
        category.name.toLowerCase().includes(deferredSearch.toLowerCase()) ||
        category.description.toLowerCase().includes(deferredSearch.toLowerCase()) ||
        category.segment.toLowerCase().includes(deferredSearch.toLowerCase())
      const matchesSegment = segmentFilter === 'all' ? true : category.segment === segmentFilter
      const matchesActive = activeOnly ? category.status === 'Active' : true
      return matchesSearch && matchesSegment && matchesActive
    })
    .sort((left, right) => {
      if (sort === 'alphabetical') return left.name.localeCompare(right.name)
      if (sort === 'items-high') return right.items - left.items
      if (sort === 'status') return left.status.localeCompare(right.status)
      return right.updatedAt.localeCompare(left.updatedAt)
    })

  const activeCount = categories.filter((category) => category.status === 'Active').length
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

  const handleCategorySubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors = validateCategoryForm(form)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      error('Category details need attention', 'Complete the required fields before creating this menu section.')
      return
    }

    startTransition(() => {
      setCategories((current) => [
        {
          id: `cat-${Date.now()}`,
          name: form.name.trim(),
          items: Number(form.items),
          status: form.status,
          color: form.color,
          segment: form.segment,
          imageSrc: form.imageSrc,
          imageAlt: `${form.name.trim()} category visual`,
          description: form.description.trim(),
          updatedAt: 'Just now',
        },
        ...current,
      ])
      resetModalState()
      success('Category created', `${form.name.trim()} is now visible in the category directory.`)
    })
  }

  const clearFilters = () => {
    setSearch('')
    setSegmentFilter('all')
    setActiveOnly(false)
    setSort('recent')
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Category management"
        subtitle="Organize your menu structure"
        actionLabel="Add category"
        onAction={() => setIsModalOpen(true)}
      />

      <Carousel slides={categorySlides} />

      <FilterBar
        eyebrow="Search & filter"
        title="Shape how the menu is grouped"
        description="Filter live sections, sort by volume, and create new categories without leaving the current management flow."
        resultLabel={`${filteredCategories.length} category views`}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search categories, segments, or operational notes"
        sortValue={sort}
        onSortChange={setSort}
        sortOptions={[
          { label: 'Recently updated', value: 'recent' },
          { label: 'Alphabetical', value: 'alphabetical' },
          { label: 'Highest item count', value: 'items-high' },
          { label: 'Status', value: 'status' },
        ]}
        chips={[
          { label: 'All', value: 'all', count: categories.length },
          { label: 'Core', value: 'Core' },
          { label: 'Seasonal', value: 'Seasonal' },
          { label: 'Beverage', value: 'Beverage' },
          { label: 'Dessert', value: 'Dessert' },
        ]}
        activeChip={segmentFilter}
        onChipChange={(value) => setSegmentFilter(value as 'all' | CategorySegment)}
        toggleLabel="Active only"
        toggleChecked={activeOnly}
        onToggleChange={setActiveOnly}
      />

      {filteredCategories.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredCategories.map((category) => (
            <CategoryCard
              key={category.id}
              title={category.name}
              items={category.items}
              status={category.status}
              color={category.color}
              imageSrc={category.imageSrc}
              imageAlt={category.imageAlt}
              footer={
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => success(`${category.name} highlighted`, 'The category has been pinned for upcoming merchandising review.')}
                  >
                    Highlight
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      confirmDelete({
                        title: `Remove ${category.name}?`,
                        description: 'This demo action removes the category card from the current frontend session.',
                        onConfirm: () => {
                          setCategories((current) => current.filter((entry) => entry.id !== category.id))
                          success('Category removed', `${category.name} has been cleared from the view.`)
                        },
                      })
                    }
                  >
                    Remove
                  </Button>
                </div>
              }
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FolderTree}
          title="No category views match these filters"
          description="Try widening the search, show inactive groups again, or create a new category with a local visual already attached."
          actionLabel="Clear filters"
          onAction={clearFilters}
          previewSrc="/images/categories/fallback.svg"
          previewAlt="Category empty state artwork"
        />
      )}

      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Category table</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Directory of menu sections</h2>
            </div>
            <Badge className="bg-emerald-500/15 text-emerald-200">{activeCount} active groups</Badge>
          </div>

          {filteredCategories.length > 0 ? (
            <div className="overflow-x-auto rounded-3xl border border-white/10 bg-slate-950/80">
              <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-slate-300">
                <thead>
                  <tr>
                    <th className="border-b border-white/10 px-6 py-4 text-slate-500">Category</th>
                    <th className="border-b border-white/10 px-6 py-4 text-slate-500">Segment</th>
                    <th className="border-b border-white/10 px-6 py-4 text-slate-500">Items</th>
                    <th className="border-b border-white/10 px-6 py-4 text-slate-500">Status</th>
                    <th className="border-b border-white/10 px-6 py-4 text-slate-500">Last updated</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((category) => (
                    <tr key={category.id} className="border-b border-white/5">
                      <td className="px-6 py-4 text-white">{category.name}</td>
                      <td className="px-6 py-4 text-slate-300">{category.segment}</td>
                      <td className="px-6 py-4">{category.items}</td>
                      <td className="px-6 py-4">
                        <Badge className={category.status === 'Active' ? 'bg-emerald-500/15 text-emerald-200' : 'bg-rose-500/15 text-rose-200'}>
                          {category.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{category.updatedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={ImagePlus}
              title="No visible categories in the directory"
              description="Once a category matches the current filters, it will appear here with its status, item volume, and update timestamp."
              actionLabel="Reset filters"
              onAction={clearFilters}
              previewSrc="/images/categories/seasonal.svg"
              previewAlt="Category directory illustration"
            />
          )}
        </div>
      </Card>

      <Modal
        open={isModalOpen}
        onClose={resetModalState}
        title="Add category"
        description="Create a new menu section with a local premium visual, clear operations notes, and validation states that keep the UI investor-ready."
        footer={
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={resetModalState}>
              Cancel
            </Button>
            <Button form="add-category-form" type="submit" loading={isPending}>
              Create category
            </Button>
          </div>
        }
      >
        <form id="add-category-form" className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]" onSubmit={handleCategorySubmit}>
          <div className="space-y-5">
            <Input
              label="Category name"
              placeholder="Chef specials"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              error={errors.name}
              success={form.name.trim() && !errors.name ? 'Looks good.' : undefined}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Estimated items"
                type="number"
                min="1"
                placeholder="12"
                value={form.items}
                onChange={(event) => setForm((current) => ({ ...current, items: event.target.value }))}
                error={errors.items}
              />
              <Select
                label="Status"
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as CategoryStatus }))}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Segment"
                value={form.segment}
                onChange={(event) => setForm((current) => ({ ...current, segment: event.target.value as CategorySegment }))}
              >
                <option value="Core">Core</option>
                <option value="Seasonal">Seasonal</option>
                <option value="Beverage">Beverage</option>
                <option value="Dessert">Dessert</option>
              </Select>
              <Select
                label="Accent color"
                value={form.color}
                onChange={(event) => setForm((current) => ({ ...current, color: event.target.value as CategoryColor }))}
              >
                <option value="violet">Violet</option>
                <option value="yellow">Amber</option>
                <option value="emerald">Emerald</option>
                <option value="cyan">Cyan</option>
              </Select>
            </div>

            <Select
              label="Local image asset"
              value={form.imageSrc}
              onChange={(event) => setForm((current) => ({ ...current, imageSrc: event.target.value }))}
              error={errors.imageSrc}
              description="Use local static artwork only so the category never renders a broken image."
            >
              {categoryImageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>

            <Textarea
              label="Description"
              placeholder="Explain how this section should be merchandised across service windows."
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
                  <img src={previewImage} alt="Category preview" className="h-56 w-full object-cover" />
                ) : (
                  <div className="flex h-56 items-center justify-center text-sm text-slate-500">Choose an image to preview</div>
                )}
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">Optional upload preview is local to this session. Saved cards continue using the selected local static asset for maximum stability.</p>
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
