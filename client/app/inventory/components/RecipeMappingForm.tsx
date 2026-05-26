"use client";

export default function RecipeMappingForm() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-2xl font-bold mb-6">
        Recipe Mapping
      </h2>

      <form className="space-y-5">
        <div>
          <label className="text-sm font-medium">
            Menu Item
          </label>

          <input
            type="text"
            placeholder="Chicken Burger"
            className="w-full border rounded-xl px-4 py-3 mt-2"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="text-sm font-medium">
              Ingredient
            </label>

            <input
              type="text"
              placeholder="Chicken Patty"
              className="w-full border rounded-xl px-4 py-3 mt-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Quantity
            </label>

            <input
              type="number"
              placeholder="1"
              className="w-full border rounded-xl px-4 py-3 mt-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Unit
            </label>

            <select className="w-full border rounded-xl px-4 py-3 mt-2">
              <option>Kg</option>
              <option>Gram</option>
              <option>Pcs</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          className="border border-blue-600 text-blue-600 px-5 py-3 rounded-xl"
        >
          + Add Ingredient
        </button>

        <div className="flex justify-end">
          <button className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700">
            Save Recipe
          </button>
        </div>
      </form>
    </div>
  );
}