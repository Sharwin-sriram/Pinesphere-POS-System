import React from 'react'
import Skeleton from '@/components/ui/Skeleton'

export default function MenuPageLoading() {
 return (
 <div className="space-y-8">
 <div className="rounded-[28px] border border-white/10 bg-slate-950/90 p-6 ">
 <Skeleton className="h-4 w-40" />
 <Skeleton className="mt-4 h-10 w-72 max-w-full" />
 <Skeleton className="mt-6 h-11 w-36" />
 </div>

 <div className="rounded-[32px] border border-white/10 bg-slate-950/90 p-5 ">
 <Skeleton className="h-[320px] rounded-[28px]" />
 </div>

 <div className="grid gap-6 lg:grid-cols-3">
 <Skeleton className="h-40 rounded-[28px]" />
 <Skeleton className="h-40 rounded-[28px]" />
 <Skeleton className="h-40 rounded-[28px]" />
 </div>

 <div className="grid gap-6 xl:grid-cols-3">
 <Skeleton className="h-80 rounded-[32px]" />
 <Skeleton className="h-80 rounded-[32px]" />
 <Skeleton className="h-80 rounded-[32px]" />
 </div>

 <div className="rounded-[32px] border border-white/10 bg-slate-950/90 p-6 ">
 <Skeleton className="h-5 w-48" />
 <div className="mt-6 space-y-3">
 <Skeleton className="h-14 rounded-2xl" />
 <Skeleton className="h-14 rounded-2xl" />
 <Skeleton className="h-14 rounded-2xl" />
 <Skeleton className="h-14 rounded-2xl" />
 </div>
 </div>
 </div>
 )
}
