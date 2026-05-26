import React from 'react'
import RegisterForm from '../../../../components/onboarding/RegisterForm'

export default function Page(){
  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-slate-950/90 border border-white/10 p-6">
        <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Restaurant registration</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Capture all onboarding details with confidence</h1>
        <p className="mt-2 max-w-2xl text-slate-400">Complete the restaurant profile, owner credentials, legal identifiers and business settings in one smooth flow.</p>
      </div>
      <div className="max-w-3xl"><RegisterForm /></div>
    </div>
  )
}
