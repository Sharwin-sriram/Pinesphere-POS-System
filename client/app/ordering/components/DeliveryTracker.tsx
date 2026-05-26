"use client";

export default function DeliveryTracker() {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="bg-gray-200 rounded-3xl h-[450px] flex flex-col items-center justify-center">
        <div className="text-7xl mb-5">
          🗺️
        </div>

        <p className="text-2xl font-bold">
          Live Delivery Tracking
        </p>

        <p className="text-gray-500 mt-2">
          Rider location will appear here
        </p>
      </div>

      <div className="mt-6 bg-blue-50 rounded-2xl p-5 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg">
            Delivery Partner
          </h3>

          <p className="text-gray-500">
            Arun Kumar
          </p>
        </div>

        <button className="bg-blue-600 text-white px-5 py-3 rounded-2xl">
          Call Rider
        </button>
      </div>
    </div>
  );
}