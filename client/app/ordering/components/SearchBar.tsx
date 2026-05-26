// components/SearchBar.tsx

"use client";

export default function SearchBar() {
  return (
    <div className="bg-white rounded-3xl shadow-sm p-5 mt-8 flex items-center gap-4 border border-gray-100">
      <div className="text-3xl">
        🔍
      </div>

      <input
        type="text"
        placeholder="Search for dishes, restaurants, cuisines..."
        className="w-full outline-none text-lg bg-transparent"
      />
    </div>
  );
}