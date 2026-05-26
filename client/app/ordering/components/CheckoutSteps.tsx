// components/CheckoutSteps.tsx

"use client";

export default function CheckoutSteps() {
  return (
    <div className="flex items-center justify-between bg-white rounded-[32px] p-8 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-orange-500 text-white flex items-center justify-center font-black text-xl">
          1
        </div>

        <p className="font-bold text-lg">
          Cart
        </p>
      </div>

      <div className="h-1 flex-1 bg-gray-200 mx-4 rounded-full" />

      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-orange-500 text-white flex items-center justify-center font-black text-xl">
          2
        </div>

        <p className="font-bold text-lg">
          Checkout
        </p>
      </div>

      <div className="h-1 flex-1 bg-gray-200 mx-4 rounded-full" />

      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-gray-300 text-white flex items-center justify-center font-black text-xl">
          3
        </div>

        <p className="font-bold text-lg">
          Delivery
        </p>
      </div>
    </div>
  );
}