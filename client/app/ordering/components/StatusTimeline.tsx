"use client";

const orderStatuses = [
  "CONFIRMED",
  "PREPARING",
  "READY",
  "SERVED",
];

export default function StatusTimeline() {
  const activeStatus = "PREPARING";

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <h2 className="text-2xl font-bold mb-8">
        Order Status
      </h2>

      <div className="space-y-8">
        {orderStatuses.map((status, index) => {
          const isActive =
            orderStatuses.indexOf(activeStatus) >= index;

          return (
            <div
              key={status}
              className="flex items-start gap-4"
            >
              <div className="flex flex-col items-center">
                <div
                  className={`w-5 h-5 rounded-full ${
                    isActive
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                />

                {index !== orderStatuses.length - 1 && (
                  <div className="w-[2px] h-14 bg-gray-300 mt-2" />
                )}
              </div>

              <div>
                <h3 className="font-bold text-lg">
                  {status}
                </h3>

                <p className="text-gray-500 text-sm mt-1">
                  {isActive
                    ? "Completed"
                    : "Pending"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}