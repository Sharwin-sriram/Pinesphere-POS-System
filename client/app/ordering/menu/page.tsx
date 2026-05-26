// ordering/menu/page.tsx

"use client";

import FloatingCart from "../components/FloatingCart";
import MenuCard from "../components/MenuCard";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";

import { MenuItem } from "../types";

export default function MenuPage() {
  const menuItems: MenuItem[] = [];

  return (
    <div className="min-h-screen bg-[#f6f6f6] pb-24">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6">
        <div className="pt-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
            <div>
              <p className="text-orange-500 font-semibold uppercase tracking-[3px]">
                Restaurant Menu
              </p>

              <h1 className="text-5xl font-black mt-3">
                Discover Delicious Food 🍕
              </h1>
            </div>

            <FloatingCart />
          </div>

          <SearchBar />

          {menuItems.length === 0 ? (
            <div className="bg-white rounded-[32px] p-16 text-center text-gray-500 shadow-sm mt-10">
              Menu items will appear here after backend integration.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mt-10">
              {menuItems.map((item) => (
                <MenuCard
                  key={item.id}
                  item={item}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}