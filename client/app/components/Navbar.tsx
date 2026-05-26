"use client";

import Link from "next/link";

export default function Navbar() {

  return (
    <nav className="bg-black text-white px-8 py-4 shadow-lg">

      <div className="max-w-7xl mx-auto flex justify-between items-center">

        {/* LOGO */}

        <h1 className="text-2xl font-bold">
          Franchise System
        </h1>


        {/* NAVIGATION */}

        <div className="flex gap-6 text-lg">

          <Link
            href="/"
            className="hover:text-gray-300 transition"
          >
            Branches
          </Link>

          <Link
            href="/dashboard"
            className="hover:text-gray-300 transition"
          >
            Dashboard
          </Link>

          <Link
            href="/reports"
            className="hover:text-gray-300 transition"
          >
            Reports
          </Link>

        </div>

      </div>

    </nav>
  );
}