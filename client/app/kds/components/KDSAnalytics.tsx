"use client";

export default function KDSAnalytics() {

  return (
    <div className="bg-white p-6 rounded-2xl mt-10 shadow-sm border border-gray-100">

      <div className="flex items-center justify-between mb-6">

        <div>

          <h2 className="text-2xl font-bold">
            Kitchen Analytics
          </h2>

          <p className="text-gray-500 mt-1">
            Analytics will appear once backend integration is completed.
          </p>

        </div>

      </div>

      <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl">

        <p className="text-gray-400 text-lg">
          No Analytics Data Available
        </p>

      </div>

    </div>
  );
}