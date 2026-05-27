"use client"
import Badge from '@/components/ui/Badge'

export default function CustomerTasteProfile({ tastes }: { tastes: string[] }) {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-slate-900/60 p-4">
        <h4 className="text-sm uppercase tracking-wider text-violet-300">Customer taste profile</h4>
        <div className="mt-3 flex flex-wrap gap-2">
          {tastes.map((t) => (
            <Badge key={t} className="bg-white/5 text-slate-200">{t}</Badge>
          ))}
        </div>
      </div>
    </div>
  )
}
