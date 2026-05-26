"use client";

import { useEffect, useState } from "react";

import { motion } from "framer-motion";

type Props = {
 id: string;
 table: string;
 items: number;
 status: string;
 time: string;
 priority: string;
 onView: () => void;

 onStatusChange: (
 orderId: string,
 newStatus: string
 ) => void;
};

export default function OrderCard({
 id,
 table,
 items,
 status,
 time,
 priority,
 onView,
 onStatusChange,
}: Props) {

 const initialMinutes =
 parseInt(time.split(" ")[0]);

 const [minutes, setMinutes] =
 useState(initialMinutes);

 useEffect(() => {

 const timer = setInterval(() => {

 setMinutes((prev) =>
 prev > 0 ? prev - 1 : 0
 );

 }, 60000);

 return () => clearInterval(timer);

 }, []);

 const statusStyles = {
 Preparing:
 "bg-yellow-100 text-yellow-600",

 Ready:
 "bg-green-100 text-green-600",

 Delayed:
 "bg-red-100 text-red-600",
 };

 const priorityStyles = {
 High:
 "bg-red-100 text-red-600",

 Medium:
 "bg-yellow-100 text-yellow-600",

 Low:
 "bg-green-100 text-green-600",
 };

 return (

 <motion.div

 initial={{
 opacity: 0,
 y: 20,
 }}

 animate={{
 opacity: 1,
 y: 0,
 }}

 transition={{
 duration: 0.4,
 }}

 whileHover={{
 scale: 1.02,
 }}

 className="bg-white p-5 rounded-2xl border border-gray-100 hover: transition duration-150"
 >

 {/* TOP */}
 <div className="flex justify-between items-center mb-4">

 <h2 className="font-semibold text-lg">
 {id}
 </h2>

 <span
 className={`
 text-sm px-3 py-1 rounded-full
 ${
 statusStyles[
 status as keyof typeof statusStyles
 ]
 }
 `}
 >
 {status}
 </span>

 </div>

 {/* BODY */}
 <div className="space-y-3">

 <p className="text-[var(--color-text-secondary)]">
 {table}
 </p>

 <p className="text-[var(--color-text-secondary)]">
 Items: {items}
 </p>

 {/* PRIORITY */}
 <div>

 <span
 className={`
 text-sm px-3 py-1 rounded-full
 ${
 priorityStyles[
 priority as keyof typeof priorityStyles
 ]
 }
 `}
 >
 {priority} Priority
 </span>

 </div>

 </div>

 {/* TIMER */}
 <div className="mt-5">

 <p
 className={`
 font-semibold text-lg
 ${
 minutes <= 5
 ? "text-red-500"
 : "text-orange-500"
 }
 `}
 >
 {minutes} mins left
 </p>

 </div>

 {/* BUTTONS */}
 <div className="mt-5 space-y-3">

 <button
 onClick={onView}
 className="w-full bg-[#0B1120] text-white py-3 rounded-xl hover:bg-black transition"
 >
 View Order
 </button>

 <div className="grid grid-cols-2 gap-3">

 <button
 onClick={() =>
 onStatusChange(id, "Preparing")
 }
 className="bg-yellow-100 text-yellow-700 py-2 rounded-xl hover:bg-yellow-200 transition"
 >
 Preparing
 </button>

 <button
 onClick={() =>
 onStatusChange(id, "Ready")
 }
 className="bg-green-100 text-green-700 py-2 rounded-xl hover:bg-green-200 transition"
 >
 Ready
 </button>

 </div>

 </div>

 </motion.div>

 );
}