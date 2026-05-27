"use client";

import { useEffect, useState } from "react";

interface Branch {
 _id: string;
 name: string;
 location: string;
 managerName: string;
 status: string;
}

export default function DashboardPage() {

 const [branches, setBranches] = useState<Branch[]>([]);

 const [loading, setLoading] = useState(false);


 // FETCH DATA
 const fetchDashboardData = async () => {

 try {

 setLoading(true);

 const res = await fetch(
 "http://localhost:5000/api/branches"
 );

 const data = await res.json();

 setBranches(data);

 } catch (error) {

 console.log(error);

 } finally {

 setLoading(false);
 }
 };


 useEffect(() => {
 fetchDashboardData();
 }, []);


 // COUNTS
 const totalBranches = branches.length;

 const activeBranches =
 branches.filter(
 (branch) => branch.status === "ACTIVE"
 ).length;

 const inactiveBranches =
 branches.filter(
 (branch) => branch.status === "INACTIVE"
 ).length;


 // PERCENTAGES
 const activePercentage =
 totalBranches > 0
 ? (activeBranches / totalBranches) * 100
 : 0;

 const inactivePercentage =
 totalBranches > 0
 ? (inactiveBranches / totalBranches) * 100
 : 0;


 return (
 <div className="min-h-screen bg-[var(--color-bg-tertiary)] p-8">

 <div className="max-w-7xl mx-auto">

 {/* HEADER */}

 <div className="mb-10 flex justify-between items-start">
 <div>
 <h1 className="text-5xl font-semibold mb-3">
 Branch Dashboard
 </h1>

 <p className="text-[var(--color-text-secondary)] text-lg">
 Monitor franchise branches and analytics
 </p>
 </div>
 
 <a 
 href="/restaurant-admin/franschise/add-branch"
 className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all flex items-center gap-2"
 >
 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
 <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
 </svg>
 Add Branch
 </a>

 </div>


 {/* LOADING */}

 {
 loading && (

 <p className="text-center text-lg">
 Loading dashboard...
 </p>
 )
 }


 {/* STATS CARDS */}

 <div className="grid md:grid-cols-3 gap-6 mb-10">

 {/* TOTAL */}

 <div className="bg-white p-8 rounded-2xl ">

 <h2 className="text-gray-500 text-lg mb-3">
 Total Branches
 </h2>

 <p className="text-5xl font-semibold">
 {totalBranches}
 </p>

 </div>


 {/* ACTIVE */}

 <div className="bg-green-500 text-white p-8 rounded-2xl ">

 <h2 className="text-lg mb-3">
 Active Branches
 </h2>

 <p className="text-5xl font-semibold">
 {activeBranches}
 </p>

 </div>


 {/* INACTIVE */}

 <div className="bg-red-500 text-white p-8 rounded-2xl ">

 <h2 className="text-lg mb-3">
 Inactive Branches
 </h2>

 <p className="text-5xl font-semibold">
 {inactiveBranches}
 </p>

 </div>

 </div>


 {/* ANALYTICS */}

 <div className="grid lg:grid-cols-2 gap-6 mb-10">

 {/* ACTIVE ANALYTICS */}

 <div className="bg-white p-6 rounded-2xl ">

 <h2 className="text-2xl font-semibold mb-6">
 Active Branch Analytics
 </h2>


 <div className="mb-4 flex justify-between">

 <span className="font-medium">
 Active Percentage
 </span>

 <span className="font-semibold">
 {activePercentage.toFixed(1)}%
 </span>

 </div>


 <div className="w-full bg-gray-200 rounded-full h-5">

 <div
 className="bg-green-500 h-5 rounded-full"
 style={{
 width: `${activePercentage}%`,
 }}
 />

 </div>

 </div>


 {/* INACTIVE ANALYTICS */}

 <div className="bg-white p-6 rounded-2xl ">

 <h2 className="text-2xl font-semibold mb-6">
 Inactive Branch Analytics
 </h2>


 <div className="mb-4 flex justify-between">

 <span className="font-medium">
 Inactive Percentage
 </span>

 <span className="font-semibold">
 {inactivePercentage.toFixed(1)}%
 </span>

 </div>


 <div className="w-full bg-gray-200 rounded-full h-5">

 <div
 className="bg-red-500 h-5 rounded-full"
 style={{
 width: `${inactivePercentage}%`,
 }}
 />

 </div>

 </div>

 </div>


 {/* RECENT BRANCHES */}

 <div className="bg-white rounded-2xl p-6">

 <h2 className="text-3xl font-semibold mb-8">
 Recent Branches
 </h2>


 {
 branches.length === 0 ? (

 <p className="text-gray-500">
 No branches available
 </p>

 ) : (

 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

 {
 branches.slice(0, 6).map((branch) => (

 <div
 key={branch._id}
 className="border rounded-2xl p-5 hover: transition"
 >

 <div className="flex justify-between items-start mb-4">

 <h3 className="text-2xl font-semibold">
 {branch.name}
 </h3>

 <span
 className={`px-3 py-1 rounded-full text-white text-sm ${
 branch.status === "ACTIVE"
 ? "bg-green-500"
 : "bg-red-500"
 }`}
 >
 {branch.status}
 </span>

 </div>


 <div className="space-y-3 text-gray-700">

 <p>
 <span className="font-semibold">
 Location:
 </span>{" "}
 {branch.location}
 </p>

 <p>
 <span className="font-semibold">
 Manager:
 </span>{" "}
 {branch.managerName}
 </p>

 </div>

 </div>
 ))
 }

 </div>
 )
 }

 </div>

 </div>

 </div>
 );
}