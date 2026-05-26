// components/RestaurantInfo.tsx

"use client";

export default function RestaurantInfo() {
  return (
    <div className="bg-white rounded-[32px] p-8 shadow-sm mt-8">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        <div>
          <p className="text-orange-500 font-semibold uppercase tracking-[3px]">
            Featured Restaurant
          </p>

          <h1 className="text-5xl font-black mt-4">
            PineSphere Kitchen 🍔
          </h1>

          <p className="text-gray-500 mt-5 text-lg leading-8 max-w-2xl">
            Premium dining experience with
            lightning-fast delivery and
            real-time order tracking.
          </p>
        </div>

        <div className="flex gap-5">
          <div className="bg-orange-100 px-6 py-5 rounded-3xl">
            <p className="text-orange-600 font-semibold">
              Delivery
            </p>

            <h3 className="text-3xl font-black mt-2">
              20 mins
            </h3>
          </div>

          <div className="bg-green-100 px-6 py-5 rounded-3xl">
            <p className="text-green-600 font-semibold">
              Rating
            </p>

            <h3 className="text-3xl font-black mt-2">
              ⭐ 4.8
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}