"use client"
import { Search, Filter } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function FiltersPanel() {
  return (
    <div className="rounded-[32px] border border-white/10 bg-slate-950/90 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.85)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Customer search</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Find a profile fast</h2>
        </div>
        <Button variant="ghost" leftIcon={<Filter className="h-4 w-4" />}>
          Filter options
        </Button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Input
          placeholder="Search by name, email, phone or favorite dish"
          className="bg-slate-950/90 text-white placeholder:text-slate-500"
        />
        <Input
          placeholder="Filter by membership / status"
          className="bg-slate-950/90 text-white placeholder:text-slate-500"
        />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {['Gold', 'Silver', 'Bronze', 'VIP', 'Active', 'Returning'].map((label) => (
          <span key={label} className="rounded-full bg-white/5 px-3 py-1 text-sm text-slate-300">{label}</span>
        ))}
      </div>
    </div>
  )
}
