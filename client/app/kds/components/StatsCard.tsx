"use client";

type Props = {
 title: string;
 value: string;
};

export default function StatsCard({
 title,
 value,
}: Props) {
 return (
 <div className="bg-white p-5 rounded-2xl border border-gray-100">

 <p className="text-gray-500">
 {title}
 </p>

 <h1 className="text-3xl font-semibold mt-2">
 {value}
 </h1>

 </div>
 );
}