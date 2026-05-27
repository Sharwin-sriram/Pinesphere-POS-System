"use client";

const timeline = [
  "Order Received",
  "Preparing",
  "Picked Up",
  "Out for Delivery",
  "Delivered",
];

export default function DeliveryTimeline() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <h2 className="text-xl font-bold mb-5">
        Delivery Timeline
      </h2>

      <div className="space-y-5">
        {timeline.map((item, index) => (
          <div
            key={item}
            className="flex items-center gap-4"
          >
            <div className="w-4 h-4 rounded-full bg-blue-500" />

            <div>
              <p className="font-medium">
                {item}
              </p>

              <p className="text-sm text-gray-500">
                Step {index + 1}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}