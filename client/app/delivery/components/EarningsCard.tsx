"use client";

export default function EarningsCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <h2 className="text-xl font-bold mb-5">
        Delivery Earnings
      </h2>

      <div className="space-y-4">
        <div>
          <p className="text-gray-500 text-sm">
            Today's Earnings
          </p>

          <h1 className="text-4xl font-bold mt-2">
            ₹18,420
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-100 rounded-xl p-4">
            <p className="text-sm text-gray-500">
              Riders Paid
            </p>

            <h3 className="text-2xl font-bold">
              ₹12,200
            </h3>
          </div>

          <div className="bg-gray-100 rounded-xl p-4">
            <p className="text-sm text-gray-500">
              Pending
            </p>

            <h3 className="text-2xl font-bold">
              ₹6,220
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}