import React from 'react'
import Card from '../ui/Card'

const statusStyles: Record<string, string> = {
  open: 'bg-emerald-500/15 text-emerald-200',
  closed: 'bg-rose-500/15 text-rose-200',
  pending: 'bg-amber-500/15 text-amber-200',
}

export default function BranchCard({name, address, status}:{name:string,address:string,status:'open'|'closed'|'pending'}){
  return (
    <Card className="space-y-5 bg-slate-950/90">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-lg font-semibold text-white">{name}</div>
          <div className="mt-1 text-sm text-slate-400">{address}</div>
        </div>
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}>{status}</span>
      </div>
      <div className="flex flex-wrap gap-3">
        <button className="rounded-2xl bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10">Assign manager</button>
        <button className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-violet-300">View details</button>
      </div>
    </Card>
  )
}
