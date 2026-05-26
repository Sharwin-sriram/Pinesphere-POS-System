// components/MobileAppBanner.tsx

"use client";

export default function MobileAppBanner() {
  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-[32px] p-10 text-white shadow-sm">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
        <div>
          <p className="uppercase tracking-[4px] font-semibold text-orange-100">
            Mobile Ordering
          </p>

          <h2 className="text-6xl font-black mt-4">
            Order from anywhere 📲
          </h2>

          <p className="mt-5 text-xl text-orange-100 leading-9 max-w-2xl">
            Fast mobile ordering experience
            with real-time delivery tracking.
          </p>
        </div>

        <div className="text-[180px]">
          📱
        </div>
      </div>
    </div>
  );
}