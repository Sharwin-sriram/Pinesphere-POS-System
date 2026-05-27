"use client";

export default function RouteOptimizationPanel() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <h2 className="text-xl font-bold mb-5">
        Route Optimization
      </h2>

      <div className="space-y-4">
        <div className="border rounded-xl p-4">
          <p className="font-semibold">
            Suggested Route
          </p>

          <p className="text-gray-500 text-sm mt-1">
            RS Puram → Gandhipuram → Peelamedu
          </p>
        </div>

        <div className="border rounded-xl p-4">
          <p className="font-semibold">
            Estimated Distance
          </p>

          <p className="text-gray-500 text-sm mt-1">
            12.4 KM
          </p>
        </div>

        <div className="border rounded-xl p-4">
          <p className="font-semibold">
            Estimated Time
          </p>

          <p className="text-gray-500 text-sm mt-1">
            34 Minutes
          </p>
        </div>
      </div>
    </div>
  );
}