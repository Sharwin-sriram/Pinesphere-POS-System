import React from 'react'
import StaffTable from '../../../../components/onboarding/StaffTable'

export default function Page(){
  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-slate-950/90 border border-white/10 p-6">
        <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Team setup</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Invite employees and configure roles</h1>
        <p className="mt-2 max-w-2xl text-slate-400">Build a restaurant team with defined access and clear onboarding status for every member.</p>
      </div>
      <StaffTable />
    </div>
  )
}
