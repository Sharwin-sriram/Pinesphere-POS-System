"use client";

export default function SearchBar() {
 return (
 <input
 type="text"
 placeholder="Search inventory..."
 className="border border-gray-200 rounded-xl px-4 py-3 w-full lg:w-[320px] outline-none focus:ring-2 focus:ring-blue-500"
 />
 );
}