"use client"
import React, {useState} from 'react'
import Stepper from './Stepper'
import Input from '../ui/Input'
import Button from '../ui/Button'
import Card from '../ui/Card'

export default function RegisterForm(){
  const steps = ['Business','Owner','Legal','Hours']
  const [active,setActive] = useState(0)
  return (
    <div className="space-y-6">
      <Card className="bg-slate-950/90">
        <div className="mb-6">
          <div className="text-sm uppercase tracking-[0.24em] text-violet-300">Onboarding flow</div>
          <h2 className="mt-3 text-3xl font-semibold text-white">Register your first restaurant</h2>
          <p className="mt-2 text-slate-400">Complete the onboarding steps to create a managed restaurant profile.</p>
        </div>
        <div className="mb-6"><Stepper steps={steps} active={active} /></div>
        <div className="space-y-6">
          {active===0 && (
            <div className="grid gap-4 md:grid-cols-2"><Input label="Restaurant name" placeholder="Spice Villa" /><Input label="Cuisine type" placeholder="Indian" /></div>
          )}
          {active===1 && (
            <div className="grid gap-4 md:grid-cols-2"><Input label="Owner name" placeholder="Asha Mehra" /><Input label="Email" type="email" placeholder="owner@example.com" /></div>
          )}
          {active===2 && (
            <div className="grid gap-4 md:grid-cols-2"><Input label="Phone" placeholder="+91 98765 43210" /><Input label="GST number" placeholder="27AABCU9603R1ZV" /></div>
          )}
          {active===3 && (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="FSSAI number" placeholder="112233445566" />
                <Input label="PAN number" placeholder="AABCU1234D" />
              </div>
              <Input label="Address" placeholder="123 Main Street, Mumbai" />
            </div>
          )}
        </div>
      </Card>
      <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm text-slate-400">Step {active + 1} of {steps.length}</div>
          <div className="mt-2 text-white">Keep the onboarding details accurate to speed activation.</div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="ghost" onClick={()=>alert('Draft saved')} className="min-w-[140px]">Save draft</Button>
          {active > 0 && <Button variant="outline" onClick={()=>setActive(a=>a-1)} className="min-w-[140px]">Back</Button>}
          {active < steps.length - 1 ? <Button onClick={()=>setActive(a=>a+1)} className="min-w-[140px]">Next step</Button> : <Button onClick={()=>alert('Form submitted')} className="min-w-[140px]">Submit</Button>}
        </div>
      </div>
    </div>
  )
}
