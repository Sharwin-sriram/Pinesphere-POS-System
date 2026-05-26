"use client"
import React, {useState} from 'react'
import { Plus } from 'lucide-react'
import BranchCard from './BranchCard'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'

export default function BranchManager(){
  const [open,setOpen] = useState(false)
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-white">Branch management</h3>
          <p className="mt-2 text-sm text-slate-400">Manage restaurant locations and assign local managers.</p>
        </div>
        <Button onClick={()=>setOpen(true)} className="inline-flex items-center gap-2"><Plus className="h-4 w-4" /> Add branch</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <BranchCard name="Downtown" address="123 Main St" status="open" />
        <BranchCard name="Uptown" address="45 High Rd" status="pending" />
      </div>
      <Modal open={open} onClose={()=>setOpen(false)} title="Add branch">
        <div className="space-y-4">
          <Input label="Branch name" placeholder="Central Kitchen" />
          <Input label="Address" placeholder="456 Market Street" />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={()=>setOpen(false)}>Cancel</Button>
            <Button onClick={()=>setOpen(false)}>Create branch</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
