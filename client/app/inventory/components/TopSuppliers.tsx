type Props = {
 suppliers?: {
 id: number;
 name: string;
 total_orders?: number;
 }[];
};

export default function TopSuppliers({
 suppliers = [],
}: Props) {
 return (
 <div className="bg-white rounded-2xl p-6 ">
 <h2 className="text-xl font-semibold mb-5">
 Top Suppliers
 </h2>

 {suppliers.length === 0 ? (
 <p className="text-gray-500">
 Supplier analytics will appear here
 </p>
 ) : (
 <div className="space-y-4">
 {suppliers.map((supplier) => (
 <div
 key={supplier.id}
 className="flex justify-between items-center border-b pb-4"
 >
 <p className="font-medium">
 {supplier.name}
 </p>

 <p className="text-sm text-gray-500">
 {supplier.total_orders || 0} Orders
 </p>
 </div>
 ))}
 </div>
 )}
 </div>
 );
}