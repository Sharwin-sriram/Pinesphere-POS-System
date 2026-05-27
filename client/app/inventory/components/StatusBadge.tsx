type Props = {
 status: string;
};

export default function StatusBadge({ status }: Props) {
 const getStyles = () => {
 switch (status) {
 case "In Stock":
 case "Received":
 case "Completed":
 return "bg-green-100 text-green-700";

 case "Low Stock":
 case "Pending":
 return "bg-yellow-100 text-yellow-700";

 case "Out of Stock":
 case "Cancelled":
 return "bg-red-100 text-red-700";

 default:
 return "bg-[var(--color-bg-tertiary)] text-gray-700";
 }
 };

 return (
 <span
 className={`px-3 py-1 rounded-full text-xs font-semibold ${getStyles()}`}
 >
 {status}
 </span>
 );
}