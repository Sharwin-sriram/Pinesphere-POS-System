"use client";

type Props = {
 categories?: string[];
 statuses?: string[];
};

export default function FilterBar({
 categories = [],
 statuses = [],
}: Props) {
 return (
 <div className="flex flex-col sm:flex-row gap-3">
 <select className="border border-gray-200 bg-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500">
 <option value="">
 All Categories
 </option>

 {categories.map(
 (category, index) => (
 <option
 key={index}
 value={category}
 >
 {category}
 </option>
 )
 )}
 </select>

 <select className="border border-gray-200 bg-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500">
 <option value="">
 All Status
 </option>

 {statuses.map(
 (status, index) => (
 <option
 key={index}
 value={status}
 >
 {status}
 </option>
 )
 )}
 </select>
 </div>
 );
}