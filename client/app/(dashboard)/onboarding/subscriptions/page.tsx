import React from 'react'
import PricingCard from '../../../../components/onboarding/PricingCard'

export default function Page(){
 const plans = [
 {title:'Basic', price:'$19/mo', features:['1 register','Basic support']},
 {title:'Standard', price:'$49/mo', features:['3 registers','Priority support']},
 {title:'Premium', price:'$99/mo', features:['Unlimited','Dedicated success']},
 ]
 return (
 <div className="space-y-6">
 <div className="rounded-[32px] bg-slate-950/90 border border-white/10 p-6">
 <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Subscription plans</p>
 <h1 className="mt-3 text-3xl font-semibold text-white">Choose the plan that fits your restaurant operations</h1>
 <p className="mt-2 max-w-2xl text-slate-400">Compare tiered packages for registers, support and growth features with a transparent enterprise lens.</p>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {plans.map((p,i)=> <PricingCard key={p.title} title={p.title} price={p.price} features={p.features} highlight={i===1} />)}
 </div>
 </div>
 )
}
