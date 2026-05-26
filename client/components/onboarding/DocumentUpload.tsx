"use client"
import React, {useState} from 'react'
import { UploadCloud } from 'lucide-react'
import Card from '../ui/Card'

export default function DocumentUpload(){
 const [files,setFiles] = useState<Record<string,string>>({})
 const onPick = (k:string,e:React.ChangeEvent<HTMLInputElement>)=>{
 const f = e.target.files?.[0]
 if(f) setFiles(prev=> ({...prev,[k]: f.name}))
 }
 return (
 <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
 {['GST','FSSAI','PAN'].map(key=> (
 <Card key={key} className="space-y-4 bg-slate-950/90">
 <div className="flex items-center gap-3">
 <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300"><UploadCloud className="h-5 w-5" /></div>
 <div>
 <div className="text-base font-semibold text-white">{key} document</div>
 <div className="text-sm text-slate-400">Secure upload and verification</div>
 </div>
 </div>
 <div className="rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-300">{files[key] || 'No file uploaded yet'}</div>
 <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
 <input type="file" className="hidden" onChange={(e)=>onPick(key,e)} />
 Choose file
 </label>
 <div className="text-sm text-slate-400">Verification status: <span className="font-semibold text-amber-300">Pending review</span></div>
 </Card>
 ))}
 </div>
 )
}
