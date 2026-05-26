"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";

const links = [
 {
 name: "Dashboard",
 href: "/kds",
 },

 {
 name: "Orders",
 href: "/kds/orders",
 },

 {
 name: "KOT Management",
 href: "/kds/kot-management",
 },

 {
 name: "Analytics",
 href: "/kds/analytics",
 },
];

export default function KDSSidebar() {

 const pathname =
 usePathname();

 return (
 <div className="w-[260px] bg-[#0B1120] text-white min-h-screen p-6 flex flex-col">

 {/* LOGO */}
 <div className="mb-10">

 <h1 className="text-3xl font-semibold">
 PinePOS
 </h1>

 <p className="text-gray-400 text-sm mt-1">
 Kitchen Display System
 </p>

 </div>

 {/* LINKS */}
 <div className="flex flex-col gap-3">

 {links.map((link) => (

 <Link
 key={link.href}
 href={link.href}
 className={`
 px-4 py-3 rounded-xl transition font-medium
 ${
 pathname === link.href
 ? "bg-white text-black"
 : "hover:bg-[#1E293B]"
 }
 `}
 >
 {link.name}
 </Link>

 ))}

 </div>

 {/* FOOTER */}
 <div className="mt-auto pt-10">

 <div className="bg-[#1E293B] p-4 rounded-xl">

 <p className="text-sm text-gray-300">
 Kitchen Operations Active
 </p>

 <h2 className="font-semibold mt-1">
 All Systems Running
 </h2>

 </div>

 </div>

 </div>
 );
}