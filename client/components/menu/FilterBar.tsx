"use client"
import React from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

type ChipOption = {
 label: string
 value: string
 count?: number
}

type SortOption = {
 label: string
 value: string
}

type Props = {
 eyebrow: string
 title: string
 description: string
 resultLabel: string
 searchValue: string
 onSearchChange: (value: string) => void
 searchPlaceholder: string
 sortValue: string
 onSortChange: (value: string) => void
 sortOptions: SortOption[]
 chips?: ChipOption[]
 activeChip?: string
 onChipChange?: (value: string) => void
 toggleLabel?: string
 toggleChecked?: boolean
 onToggleChange?: (value: boolean) => void
}

export default function FilterBar({
 eyebrow,
 title,
 description,
 resultLabel,
 searchValue,
 onSearchChange,
 searchPlaceholder,
 sortValue,
 onSortChange,
 sortOptions,
 chips = [],
 activeChip,
 onChipChange,
 toggleLabel,
 toggleChecked = false,
 onToggleChange,
}: Props) {
 return (
 <Card className="space-y-5">
 <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
 <div>
 <p className="text-sm uppercase tracking-[0.24em] text-violet-300">{eyebrow}</p>
 <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
 <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">{description}</p>
 </div>
 <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
 <SlidersHorizontal className="h-4 w-4 text-violet-300" />
 {resultLabel}
 </div>
 </div>

 <div className="grid gap-4 lg:grid-cols-[1.4fr_220px]">
 <div className="relative">
 <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-500" />
 <Input
 placeholder={searchPlaceholder}
 value={searchValue}
 onChange={(event) => onSearchChange(event.target.value)}
 inputClassName="pl-11"
 />
 </div>

 <Select value={sortValue} onChange={(event) => onSortChange(event.target.value)}>
 {sortOptions.map((option) => (
 <option key={option.value} value={option.value}>
 {option.label}
 </option>
 ))}
 </Select>
 </div>

 {chips.length > 0 || toggleLabel ? (
 <div className="flex flex-wrap items-center gap-3">
 {chips.map((chip) => {
 const active = chip.value === activeChip
 return (
 <button
 key={chip.value}
 type="button"
 onClick={() => onChipChange?.(chip.value)}
 className={`rounded-full border px-4 py-2 text-sm transition ${
 active
 ? 'border-violet-300/30 bg-violet-500/15 text-violet-100 '
 : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
 }`}
 >
 {chip.label}
 {typeof chip.count === 'number' ? <span className="ml-2 text-xs text-slate-400">{chip.count}</span> : null}
 </button>
 )
 })}

 {toggleLabel && onToggleChange ? (
 <button
 type="button"
 onClick={() => onToggleChange(!toggleChecked)}
 className={`rounded-full border px-4 py-2 text-sm transition ${
 toggleChecked
 ? 'border-cyan-300/30 bg-cyan-500/15 text-cyan-100'
 : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
 }`}
 >
 {toggleLabel}
 </button>
 ) : null}
 </div>
 ) : null}
 </Card>
 )
}
