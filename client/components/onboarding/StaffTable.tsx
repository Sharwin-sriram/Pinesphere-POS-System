"use client"
import React, {useState} from 'react'
import { UserPlus } from 'lucide-react'
import Card from '../ui/Card'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'

const mock = [
 {name:'Asha Mehra',role:'Restaurant Manager',email:'asha@example.com',active:true},
 {name:'Ravi Singh',role:'Kitchen Lead',email:'ravi@example.com',active:true},
 {name:'Nina Patel',role:'Support Specialist',email:'nina@example.com',active:false},
]

export default function StaffTable(){
 const [open,setOpen] = useState(false)
 return (
 <>
 <Card className="bg-slate-950/90">
 <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <h4 className="text-lg font-semibold text-white">Staff management</h4>
 <p className="mt-1 text-sm text-slate-400">Invite and assign roles to restaurant team members.</p>
 </div>
 <Button onClick={()=>setOpen(true)} className="inline-flex items-center gap-2"><UserPlus className="h-4 w-4" /> Invite employee</Button>
 </div>
 <div className="mt-6 overflow-x-auto rounded-3xl border border-white/10">
 <table className="min-w-[720px] w-full text-left text-sm text-slate-300">
 <thead className="bg-slate-950/80 text-slate-400">
 <tr><th className="px-4 py-4">Name</th><th className="px-4 py-4">Role</th><th className="px-4 py-4">Email</th><th className="px-4 py-4">Status</th></tr>
 </thead>
 <tbody>
 {mock.map((member, index) => (
 <tr key={member.email} className={`border-t border-white/5 ${index % 2 === 0 ? 'bg-slate-950/70' : 'bg-slate-900/80'}`}>
 <td className="px-4 py-4 text-white">{member.name}</td>
 <td className="px-4 py-4 text-slate-300">{member.role}</td>
 <td className="px-4 py-4 text-slate-400">{member.email}</td>
 <td className="px-4 py-4"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${member.active ? 'bg-emerald-500/15 text-emerald-200' : 'bg-[var(--color-bg-primary)]0/15 text-slate-300'}`}>{member.active ? 'Active' : 'Pending invite'}</span></td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </Card>
 <Modal open={open} onClose={()=>setOpen(false)} title="Invite employee">
 <div className="space-y-4">
 <Input label="Full name" placeholder="Jane Doe" />
 <Input label="Email" type="email" placeholder="jane@example.com" />
 <Input label="Role" placeholder="Shift manager" />
 <div className="flex justify-end gap-3">
 <Button variant="ghost" onClick={()=>setOpen(false)}>Cancel</Button>
 <Button onClick={()=>setOpen(false)}>Send invite</Button>
 </div>
 </div>
 </Modal>
 </>
 )
}
