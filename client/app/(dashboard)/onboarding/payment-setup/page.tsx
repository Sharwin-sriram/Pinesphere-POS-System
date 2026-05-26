import React from 'react'
import PaymentSetupCard from '../../../../components/onboarding/PaymentSetupCard'

export default function Page(){
  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-slate-950/90 border border-white/10 p-6">
        <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Payment setup</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Connect your payment gateway and activate checkout</h1>
        <p className="mt-2 max-w-2xl text-slate-400">Complete QR, Razorpay, and UPI configuration with a polished setup experience for restaurants.</p>
      </div>
      <div className="max-w-3xl"><PaymentSetupCard /></div>
    </div>
  )
}
