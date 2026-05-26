type Props = {
 activities?: string[];
};

export default function RecentActivity({
 activities = [],
}: Props) {
 return (
 <div className="bg-white rounded-2xl p-6 ">
 <h2 className="text-xl font-semibold mb-5">
 Recent Activity
 </h2>

 {activities.length === 0 ? (
 <p className="text-gray-500">
 Activity logs from backend will appear here
 </p>
 ) : (
 <div className="space-y-4">
 {activities.map(
 (activity, index) => (
 <div
 key={index}
 className="border-b pb-3"
 >
 {activity}
 </div>
 )
 )}
 </div>
 )}
 </div>
 );
}