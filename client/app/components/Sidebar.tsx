"use client";

import Link from "next/link";

export default function Sidebar() {

  return (
    <div className="w-72 min-h-screen bg-slate-900 text-white shadow-2xl">

      {/* LOGO SECTION */}

      <div className="p-8 border-b border-slate-700">

        <h1 className="text-3xl font-extrabold tracking-wide text-white">
          Franchise Admin
        </h1>

        <p className="text-slate-400 mt-2 text-sm">
          Multi Branch Management System
        </p>

      </div>


      {/* NAVIGATION */}

      <div className="p-6">


        <div className="flex flex-col gap-3">

          {/* DASHBOARD */}

          <Link
            href="/dashboard"
            className="bg-slate-800 hover:bg-blue-600 transition duration-300 px-5 py-4 rounded-xl text-lg font-medium shadow-md"
          >
            Dashboard
          </Link>


          {/* FRANCHISE MANAGEMENT */}

          <Link
            href="/"
            className="bg-slate-800 hover:bg-green-600 transition duration-300 px-5 py-4 rounded-xl text-lg font-medium shadow-md"
          >
            Franchise Management
          </Link>


          {/* REPORTS */}

          <Link
            href="/reports"
            className="bg-slate-800 hover:bg-purple-600 transition duration-300 px-5 py-4 rounded-xl text-lg font-medium shadow-md"
          >
            Reports & Analytics
          </Link>

        </div>


        </div>

      </div>
  );
}