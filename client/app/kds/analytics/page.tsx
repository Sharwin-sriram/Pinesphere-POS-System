"use client";

import Navbar from "../components/Navbar";

export default function AnalyticsPage() {

  return (
    <div>

      {/* NAVBAR */}
      <Navbar />

      {/* HEADER */}
      <div className="mb-10">

        <h1 className="text-3xl font-bold">
          Kitchen Analytics
        </h1>

        <p className="text-gray-500 mt-1">
          Analytics dashboard for kitchen operations
        </p>

      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">

          <p className="text-gray-500">
            Total Orders
          </p>

          <h2 className="text-3xl font-bold mt-2">
            0
          </h2>

        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">

          <p className="text-gray-500">
            Completed Orders
          </p>

          <h2 className="text-3xl font-bold mt-2">
            0
          </h2>

        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">

          <p className="text-gray-500">
            Avg Prep Time
          </p>

          <h2 className="text-3xl font-bold mt-2">
            0m
          </h2>

        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">

          <p className="text-gray-500">
            Efficiency Rate
          </p>

          <h2 className="text-3xl font-bold mt-2">
            0%
          </h2>

        </div>

      </div>

      {/* EMPTY ANALYTICS */}
      <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100">

        <div className="h-[400px] border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center">

          <div className="text-center">

            <h2 className="text-2xl font-bold mb-3">
              No Analytics Data
            </h2>

            <p className="text-gray-500">
              Analytics from backend will appear here.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}