// components/PopularCategories.tsx

"use client";

interface Category {
  id: number;
  name: string;
}

interface Props {
  categories?: Category[];
}

export default function PopularCategories({
  categories = [],
}: Props) {
  return (
    <section className="mt-14">
      <div className="mb-8">
        <p className="text-orange-500 font-semibold uppercase tracking-[3px]">
          Popular Categories
        </p>

        <h2 className="text-5xl font-black mt-3">
          Top Categories 🔥
        </h2>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white rounded-[32px] p-16 text-center text-gray-500 shadow-sm">
          Categories will appear here after backend integration.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-[32px] p-8 shadow-sm hover:shadow-lg transition text-center"
            >
              <div className="text-6xl">
                🍟
              </div>

              <h3 className="text-2xl font-bold mt-5">
                {category.name}
              </h3>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}