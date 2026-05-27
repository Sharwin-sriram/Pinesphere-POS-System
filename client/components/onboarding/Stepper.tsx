"use client"
import React from 'react'

export default function Stepper({steps = [], active = 0}:{steps: string[], active?: number}){
 return (
 <div className="flex flex-wrap items-center gap-4">
 {steps.map((step, index) => {
 const completed = index <= active
 return (
 <div key={step} className="flex items-center gap-4">
 <div className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition ${completed ? 'border-violet-400 bg-violet-500 text-white shadow-violet-500/20' : 'border-white/10 bg-slate-950 text-slate-300'}`}>
 {index + 1}
 </div>
 <div>
 <div className={`text-sm font-semibold ${completed ? 'text-white' : 'text-slate-400'}`}>{step}</div>
 </div>
 </div>
 )
 })}
 </div>
 )
}
