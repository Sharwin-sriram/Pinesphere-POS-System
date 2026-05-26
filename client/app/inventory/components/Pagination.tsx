"use client";

type Props = {
 currentPage?: number;
 totalPages?: number;
 totalItems?: number;
 itemsPerPage?: number;
 onPageChange?: (
 page: number
 ) => void;
};

export default function Pagination({
 currentPage = 1,
 totalPages = 1,
 totalItems = 0,
 itemsPerPage = 10,
 onPageChange,
}: Props) {
 const startItem =
 totalItems === 0
 ? 0
 : (currentPage - 1) *
 itemsPerPage +
 1;

 const endItem = Math.min(
 currentPage * itemsPerPage,
 totalItems
 );

 return (
 <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
 <p className="text-sm text-gray-500">
 Showing {startItem} to{" "}
 {endItem} of {totalItems} results
 </p>

 <div className="flex gap-2">
 <button
 disabled={currentPage === 1}
 onClick={() =>
 onPageChange?.(
 currentPage - 1
 )
 }
 className="px-4 py-2 border rounded-lg hover:bg-[var(--color-bg-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed"
 >
 Prev
 </button>

 {Array.from({
 length: totalPages,
 }).map((_, index) => {
 const page = index + 1;

 return (
 <button
 key={page}
 onClick={() =>
 onPageChange?.(page)
 }
 className={`px-4 py-2 rounded-lg ${
 currentPage === page
 ? "bg-blue-600 text-white"
 : "border hover:bg-[var(--color-bg-tertiary)]"
 }`}
 >
 {page}
 </button>
 );
 })}

 <button
 disabled={
 currentPage === totalPages
 }
 onClick={() =>
 onPageChange?.(
 currentPage + 1
 )
 }
 className="px-4 py-2 border rounded-lg hover:bg-[var(--color-bg-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed"
 >
 Next
 </button>
 </div>
 </div>
 );
}