import React from 'react'
import DocumentUpload from '../../../../components/onboarding/DocumentUpload'

export default function Page(){
  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-slate-950/90 border border-white/10 p-6">
        <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Legal documents</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Upload restaurant approvals and compliance files</h1>
        <p className="mt-2 max-w-2xl text-slate-400">Keep GST, FSSAI and PAN documents centralized with verification status and secure upload UI.</p>
      </div>
      <DocumentUpload />
    </div>
  )
}
