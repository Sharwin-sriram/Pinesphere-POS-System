"use client";

import { FaBell } from "react-icons/fa";

export default function Navbar() {
  return (
    <div className="flex items-center justify-between mb-8">

      <div>
        <h1 className="text-2xl font-bold">
          Kitchen Dashboard
        </h1>

        <p className="text-gray-500 mt-1">
          Monitor live kitchen activities
        </p>
      </div>

      <div className="flex items-center gap-5">

        <button className="relative">
          <FaBell size={20} />

          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-full bg-blue-500"></div>

          <div>
            <h3 className="font-semibold">
              Samyuktha
            </h3>

            <p className="text-sm text-gray-500">
              Kitchen Admin
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}