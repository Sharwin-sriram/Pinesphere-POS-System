import React from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { QrCode } from 'lucide-react'

export default function PaymentSetupCard(){
 return (
 <Card className="bg-slate-950/90">
 <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-center">
 <div>
 <div className="flex items-center gap-3 text-white">
 <QrCode className="h-5 w-5 text-violet-300" />
 <span className="text-sm font-semibold uppercase tracking-[0.24em] text-violet-300">Payment setup</span>
 </div>
 <h3 className="mt-4 text-2xl font-semibold text-white">Razorpay & UPI ready</h3>
 <p className="mt-3 text-sm text-slate-400">Secure payment gateway setup for instant restaurant checkout and QR acceptance.</p>
 <div className="mt-6 flex flex-wrap gap-3">
 <Button>Connect Razorpay</Button>
 <Button variant="ghost">Configure UPI</Button>
 </div>
 </div>
 <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 text-center text-white">
 <div className="mb-4 text-sm uppercase tracking-[0.24em] text-violet-300">Connected</div>
 <div className="mx-auto flex h-40 w-full items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500/15 to-transparent text-4xl font-semibold text-violet-200">QR</div>
 <div className="mt-5 text-sm text-slate-300">Last synced 2 days ago. Payments flowing with secure token refresh.</div>
 </div>
 </div>
 </Card>
 )
}
