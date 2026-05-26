// components/SelfOrderKiosk.tsx

"use client";

export default function SelfOrderKiosk() {
  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-[32px] p-10 text-white shadow-sm">
      <p className="text-orange-400 font-semibold uppercase tracking-[3px]">
        Self Ordering
      </p>

      <h2 className="text-5xl font-black mt-4">
        Smart Kiosk Ordering 🖥️
      </h2>

      <p className="text-slate-300 mt-5 text-lg leading-8 max-w-2xl">
        Customers can browse menus,
        customize food items, and
        place orders independently
        through interactive kiosks.
      </p>

      <button className="mt-8 bg-orange-500 hover:bg-orange-600 transition px-6 py-4 rounded-2xl font-bold">
        Launch Kiosk
      </button>
    </div>
  );
}