import SectionHeader from '@/components/menu/SectionHeader'
import Card from '@/components/ui/Card'
import NotificationTabs from '@/components/crm/notifications/NotificationTabs'

export default function CRMNotificationsPage() {
 return (
 <div className="space-y-8">
 <SectionHeader
 title="Notifications"
 subtitle="Manage campaign alerts and loyalty updates"
 actionLabel="Create alert"
 actionHref="/crm/notifications"
 />

 <Card className="space-y-6">
 <div>
 <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Notification center</p>
 <h3 className="mt-2 text-2xl font-semibold text-white">Active engagement alerts</h3>
 </div>
 <NotificationTabs />
 </Card>
 </div>
 )
}
