"use client";

const deliverySteps = [
  {
    title: "Order Confirmed",
    completed: true,
  },

  {
    title: "Food Preparing",
    completed: true,
  },

  {
    title: "Picked Up",
    completed: true,
  },

  {
    title: "Out for Delivery",
    completed: false,
  },

  {
    title: "Delivered",
    completed: false,
  },
];

export default function DeliveryTimeline() {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <h2 className="text-3xl font-bold mb-8">
        Delivery Timeline 🚚
      </h2>

      <div className="space-y-8">
        {deliverySteps.map((step, index) => (
          <div
            key={step.title}
            className="flex items-start gap-5"
          >
            <div className="flex flex-col items-center">
              <div
                className={`w-6 h-6 rounded-full ${
                  step.completed
                    ? "bg-green-500"
                    : "bg-gray-300"
                }`}
              />

              {index !==
                deliverySteps.length - 1 && (
                <div className="w-[2px] h-16 bg-gray-300 mt-2" />
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold">
                {step.title}
              </h3>

              <p className="text-gray-500 mt-1">
                {step.completed
                  ? "Completed"
                  : "Pending"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}