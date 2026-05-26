// components/ContactlessBanner.tsx

"use client";

export default function ContactlessBanner() {
  return (
    <div className="bg-green-100 border border-green-200 rounded-[32px] p-8 mt-10">
      <div className="flex items-center gap-5">
        <div className="text-6xl">
          🛡️
        </div>

        <div>
          <h2 className="text-3xl font-black text-green-700">
            Contactless Ordering Enabled
          </h2>

          <p className="text-green-600 mt-3 text-lg">
            Safe and secure ordering
            with QR and digital payments.
          </p>
        </div>
      </div>
    </div>
  );
}