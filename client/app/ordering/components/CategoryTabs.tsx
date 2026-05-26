// components/CategoryTabs.tsx

"use client";

interface Category {
  id: number;
  name: string;
}

interface Props {
  categories?: Category[];
}

export default function CategoryTabs({
  categories = [],
}: Props) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 mt-8">
      {categories.length === 0 ? (
        <div className="bg-white rounded-2xl px-6 py-4 shadow-sm text-gray-500">
          No categories available
        </div>
      ) : (
        categories.map((category) => (
          <button
            key={category.id}
            className="bg-white hover:bg-orange-500 hover:text-white transition rounded-2xl px-6 py-4 shadow-sm font-semibold whitespace-nowrap"
          >
            {category.name}
          </button>
        ))
      )}
    </div>
  );
}