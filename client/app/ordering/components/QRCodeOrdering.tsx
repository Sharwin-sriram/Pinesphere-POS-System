// components/QRCodeOrdering.tsx

"use client";

export default function QRCodeOrdering() {
  return (
    <div className="bg-white rounded-[32px] p-10 shadow-sm">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
        <div>
          <p className="text-orange-500 font-semibold uppercase tracking-[3px]">
            QR Ordering
          </p>

          <h2 className="text-5xl font-black mt-4">
            Scan & Order 📱
          </h2>

          <p className="text-gray-500 mt-5 text-lg leading-8 max-w-xl">
            Customers can scan QR codes
            placed on tables for seamless
            contactless ordering.
          </p>
        </div>

        <div className="w-64 h-64 bg-gray-100 rounded-[32px] flex items-center justify-center text-8xl">
          🔳
        </div>
      </div>
    </div>
  );
}