type Column = {
 key: string;
 label: string;
};

type Props = {
 columns: Column[];
 data: any[];
};

export default function InventoryTable({
 columns,
 data,
}: Props) {
 return (
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="border-b text-left text-gray-500 text-sm">
 {columns.map((column) => (
 <th key={column.key} className="pb-3">
 {column.label}
 </th>
 ))}
 </tr>
 </thead>

 <tbody>
 {data.map((row, index) => (
 <tr
 key={index}
 className="border-b hover:bg-[var(--color-bg-primary)] transition"
 >
 {columns.map((column) => (
 <td key={column.key} className="py-4">
 {row[column.key]}
 </td>
 ))}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 );
}