// components/PaymentMethods.tsx

"use client";

export default function PaymentMethods() {
  return (
    <div className="bg-white rounded-[32px] p-8 shadow-sm">
      <h2 className="text-4xl font-black">
        Payment Method
      </h2>

      <div className="space-y-5 mt-8">
        <button className="w-full border border-gray-200 hover:border-orange-500 transition rounded-3xl p-6 text-left">
          <h3 className="text-2xl font-bold">
            UPI
          </h3>

          <p className="text-gray-500 mt-2">
            Pay using any UPI app
          </p>
        </button>

        <button className="w-full border border-gray-200 hover:border-orange-500 transition rounded-3xl p-6 text-left">
          <h3 className="text-2xl font-bold">
            Credit / Debit Card
          </h3>

          <p className="text-gray-500 mt-2">
            Secure card payments
          </p>
        </button>

        <button className="w-full border border-gray-200 hover:border-orange-500 transition rounded-3xl p-6 text-left">
          <h3 className="text-2xl font-bold">
            Cash On Delivery
          </h3>

          <p className="text-gray-500 mt-2">
            Pay after delivery
          </p>
        </button>
      </div>
    </div>
  );
}