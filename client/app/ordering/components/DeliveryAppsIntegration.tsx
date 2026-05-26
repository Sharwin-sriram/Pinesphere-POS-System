// components/DeliveryAppsIntegration.tsx

"use client";

export default function DeliveryAppsIntegration() {
  return (
    <div className="bg-white rounded-[32px] p-10 shadow-sm">
      <p className="text-orange-500 font-semibold uppercase tracking-[3px]">
        Delivery Integrations
      </p>

      <h2 className="text-5xl font-black mt-4">
        Delivery Partners 🚴
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-10">
        {[
          "Swiggy",
          "Zomato",
          "Dunzo",
          "ONDC",
          "Uber Eats",
          "Shopify",
        ].map((partner) => (
          <div
            key={partner}
            className="bg-gray-100 rounded-3xl p-8 text-center font-black text-xl"
          >
            {partner}
          </div>
        ))}
      </div>
    </div>
  );
}