import React from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'

export default function PricingCard({title,price,features,highlight}:{title:string,price:string,features:string[],highlight?:boolean}){
 return (
 <Card className={`w-full ${highlight ? 'border border-violet-400/20 bg-slate-950/85 ' : 'bg-slate-950/80'}`}>
 <div className="flex items-start justify-between gap-4">
 <div>
 <div className="text-lg font-semibold text-white">{title}</div>
 <div className="mt-2 text-4xl font-semibold text-white">{price}</div>
 </div>
 <Button variant={highlight ? 'primary' : 'outline'}>{highlight ? 'Current plan' : 'Choose'}</Button>
 </div>
 <div className="mt-6 space-y-4 text-sm text-slate-300">
 {features.map(f=> (
 <div key={f} className="flex items-center gap-3 rounded-3xl bg-white/5 px-4 py-3">
 <span className="inline-flex h-2.5 w-2.5 rounded-full bg-violet-400" />
 <span>{f}</span>
 </div>
 ))}
 </div>
 </Card>
 )
}
