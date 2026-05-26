// components/TipSelector.tsx

"use client";

export default function TipSelector() {
  return (
    <div className="bg-white rounded-[32px] p-8 shadow-sm">
      <h2 className="text-4xl font-black">
        Add a Tip 💖
      </h2>

      <div className="flex flex-wrap gap-4 mt-8">
        {[20, 50, 100, 150].map(
          (tip) => (
            <button
              key={tip}
              className="bg-gray-100 hover:bg-orange-500 hover:text-white transition px-6 py-4 rounded-2xl font-bold"
            >
              ₹{tip}
            </button>
          )
        )}
      </div>
    </div>
  );
}