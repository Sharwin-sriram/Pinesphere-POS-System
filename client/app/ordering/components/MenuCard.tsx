// components/MenuCard.tsx

"use client";

import { MenuItem } from "../types";

interface Props {
  item: MenuItem;
}

export default function MenuCard({
  item,
}: Props) {
  return (
    <div className="bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition duration-300 border border-gray-100">
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-56 object-cover"
        />
      ) : (
        <div className="h-56 bg-gray-100 flex items-center justify-center text-6xl">
          🍕
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start justify-between gap-5">
          <div>
            <h2 className="text-2xl font-bold">
              {item.name}
            </h2>

            <p className="text-gray-500 mt-3 leading-7">
              {item.description}
            </p>
          </div>

          <div>
            {item.isVeg ? "🟢" : "🔴"}
          </div>
        </div>

        <div className="flex items-center justify-between mt-8">
          <div>
            <h3 className="text-3xl font-black text-orange-500">
              ₹{item.basePrice}
            </h3>

            <p className="text-gray-400 mt-2 text-sm">
              {item.preparationTime || 0} mins
            </p>
          </div>

          <button className="bg-orange-500 hover:bg-orange-600 transition text-white px-6 py-4 rounded-2xl font-bold">
            ADD
          </button>
        </div>
      </div>
    </div>
  );
}