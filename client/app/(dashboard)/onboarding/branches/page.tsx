import React from 'react'
import BranchManager from '../../../../components/onboarding/BranchManager'

export default function Page(){
 return (
 <div className="space-y-6">
 <div className="rounded-[32px] bg-slate-950/90 border border-white/10 p-6">
 <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Branch network</p>
 <h1 className="mt-3 text-3xl font-semibold text-white">Manage restaurant sites and local leadership</h1>
 <p className="mt-2 max-w-2xl text-slate-400">Keep branch operations organized with location cards, activation status, and manager assignments.</p>
 </div>
 <BranchManager />
 </div>
 )
}
