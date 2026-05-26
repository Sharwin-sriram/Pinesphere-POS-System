// components/RecommendedItems.tsx

"use client";

import MenuCard from "./MenuCard";
import { MenuItem } from "../types";

interface Props {
  items?: MenuItem[];
}

export default function RecommendedItems({
  items = [],
}: Props) {
  return (
    <section className="mt-14">
      <div className="mb-8">
        <p className="text-orange-500 font-semibold uppercase tracking-[3px]">
          Recommended
        </p>

        <h2 className="text-5xl font-black mt-3">
          Recommended For You ✨
        </h2>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-[32px] p-16 text-center text-gray-500 shadow-sm">
          Recommendations will appear here after backend integration.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {items.map((item) => (
            <MenuCard
              key={item.id}
              item={item}
            />
          ))}
        </div>
      )}
    </section>
  );
}