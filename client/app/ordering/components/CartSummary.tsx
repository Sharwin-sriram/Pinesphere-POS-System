// components/CartSummary.tsx

"use client";

interface Props {
  subtotal?: number;
  tax?: number;
  total?: number;
}

export default function CartSummary({
  subtotal = 0,
  tax = 0,
  total = 0,
}: Props) {
  return (
    <div className="bg-white rounded-[32px] p-8 shadow-sm">
      <h2 className="text-3xl font-black">
        Bill Summary
      </h2>

      <div className="space-y-5 mt-8">
        <div className="flex items-center justify-between">
          <p className="text-gray-500">
            Subtotal
          </p>

          <h3 className="font-bold">
            ₹{subtotal}
          </h3>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-gray-500">
            Tax
          </p>

          <h3 className="font-bold">
            ₹{tax}
          </h3>
        </div>

        <div className="border-t pt-5 flex items-center justify-between">
          <h2 className="text-2xl font-black">
            Total
          </h2>

          <h2 className="text-3xl font-black text-orange-500">
            ₹{total}
          </h2>
        </div>
      </div>

      <button className="w-full mt-8 bg-orange-500 hover:bg-orange-600 transition text-white py-4 rounded-2xl font-bold text-lg">
        Proceed to Checkout
      </button>
    </div>
  );
}