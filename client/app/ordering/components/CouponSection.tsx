// components/CouponSection.tsx

"use client";

export default function CouponSection() {
  return (
    <div className="bg-white rounded-[32px] p-8 shadow-sm">
      <h2 className="text-4xl font-black">
        Apply Coupon 🎟️
      </h2>

      <div className="flex flex-col lg:flex-row gap-5 mt-8">
        <input
          type="text"
          placeholder="Enter coupon code"
          className="flex-1 border border-gray-200 rounded-2xl px-5 py-4 outline-none"
        />

        <button className="bg-orange-500 hover:bg-orange-600 transition text-white px-8 py-4 rounded-2xl font-bold">
          Apply
        </button>
      </div>
    </div>
  );
}