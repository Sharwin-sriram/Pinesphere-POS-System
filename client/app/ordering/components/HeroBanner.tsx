// components/HeroBanner.tsx

"use client";

export default function HeroBanner() {
  return (
    <section className="bg-gradient-to-r from-orange-500 to-red-500 rounded-[40px] overflow-hidden p-10 text-white mt-8">
      <div className="grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <p className="uppercase tracking-[4px] font-semibold text-orange-100">
            Smart Food Ordering
          </p>

          <h1 className="text-6xl font-black leading-tight mt-5">
            Delicious food,
            delivered fast 🍟
          </h1>

          <p className="mt-6 text-xl text-orange-100 leading-9 max-w-xl">
            Modern restaurant ordering experience with scalable backend integration and real-time order tracking.
          </p>

          <div className="flex gap-4 mt-10">
            <button className="bg-white text-orange-600 px-6 py-4 rounded-2xl font-bold">
              Order Now
            </button>

            <button className="border border-white/40 px-6 py-4 rounded-2xl font-bold">
              Explore Menu
            </button>
          </div>
        </div>

        <div className="hidden lg:flex justify-center">
          <div className="w-[420px] h-[420px] rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center text-[180px]">
            🍕
          </div>
        </div>
      </div>
    </section>
  );
}