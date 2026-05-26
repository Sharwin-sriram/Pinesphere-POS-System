// components/CustomerDetailsCard.tsx

"use client";

export default function CustomerDetailsCard() {
  return (
    <div className="bg-white rounded-[32px] p-8 shadow-sm">
      <h2 className="text-4xl font-black">
        Customer Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <input
          type="text"
          placeholder="Full Name"
          className="border border-gray-200 rounded-2xl px-5 py-4 outline-none"
        />

        <input
          type="text"
          placeholder="Phone Number"
          className="border border-gray-200 rounded-2xl px-5 py-4 outline-none"
        />

        <input
          type="email"
          placeholder="Email Address"
          className="border border-gray-200 rounded-2xl px-5 py-4 outline-none md:col-span-2"
        />

        <textarea
          placeholder="Delivery Address"
          className="border border-gray-200 rounded-2xl px-5 py-4 outline-none md:col-span-2 h-36 resize-none"
        />
      </div>
    </div>
  );
}