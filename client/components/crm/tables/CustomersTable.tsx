import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import { Star, Clock2, CircleDot } from 'lucide-react'

type Customer = {
 name: string
 phone: string
 email: string
 points: string
 orders: number
 tier: string
 status: string
 favorite: string
}

const customers: Customer[] = [
 { name: 'Ava Romero', phone: '+1 (415) 555-0198', email: 'ava@dinecloud.com', points: '4,280', orders: 18, tier: 'Gold', status: 'Active', favorite: 'Truffle risotto' },
 { name: 'Mason Lee', phone: '+1 (415) 555-0172', email: 'mason@dinecloud.com', points: '3,120', orders: 12, tier: 'Silver', status: 'Returning', favorite: 'Miso ramen' },
 { name: 'Sophia Chen', phone: '+1 (415) 555-0141', email: 'sophia@dinecloud.com', points: '2,950', orders: 15, tier: 'Gold', status: 'Active', favorite: 'Citrus salad' },
 { name: 'Leo Patel', phone: '+1 (415) 555-0185', email: 'leo@dinecloud.com', points: '1,450', orders: 8, tier: 'Bronze', status: 'New', favorite: 'Charred steak' },
]

export default function CustomersTable() {
 return (
 <Card className="overflow-hidden">
 <div className="overflow-x-auto">
 <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-slate-300">
 <thead>
 <tr>
 <th className="border-b border-white/10 px-6 py-4">Customer</th>
 <th className="border-b border-white/10 px-6 py-4">Contact</th>
 <th className="border-b border-white/10 px-6 py-4">Loyalty points</th>
 <th className="border-b border-white/10 px-6 py-4">Orders</th>
 <th className="border-b border-white/10 px-6 py-4">Tier</th>
 <th className="border-b border-white/10 px-6 py-4">Status</th>
 </tr>
 </thead>
 <tbody>
 {customers.map((customer) => (
 <tr key={customer.email} className="border-b border-white/5 hover:bg-slate-950/80 transition-colors">
 <td className="px-6 py-4">
 <div className="flex items-center gap-3">
 <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-200 ring-1 ring-white/10">{customer.name.split(' ').map((part) => part[0]).join('')}</div>
 <div>
 <p className="font-semibold text-white">{customer.name}</p>
 <p className="text-xs text-slate-500">Favorite: {customer.favorite}</p>
 </div>
 </div>
 </td>
 <td className="px-6 py-4">
 <p>{customer.phone}</p>
 <p className="text-xs text-slate-500">{customer.email}</p>
 </td>
 <td className="px-6 py-4 text-white">{customer.points}</td>
 <td className="px-6 py-4">{customer.orders}</td>
 <td className="px-6 py-4">
 <Badge className="bg-slate-900/60 text-slate-200 ring-1 ring-white/10">{customer.tier}</Badge>
 </td>
 <td className="px-6 py-4">
 <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">
 <CircleDot className="h-3.5 w-3.5 text-emerald-300" />
 {customer.status}
 </span>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </Card>
 )
}
