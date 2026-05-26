"use client";

import React from "react";
import Link from "next/link";

const categories = [
  { id: 1, name: "Meals", image: "🍱" },
  { id: 2, name: "Snacks", image: "🍟" },
  { id: 3, name: "Drinks", image: "🥤" },
  { id: 4, name: "Cakes", image: "🍰" },
  { id: 5, name: "Desserts", image: "🍨" },
  { id: 6, name: "Biryani", image: "🍛" },
  { id: 7, name: "Pizza", image: "🍕" },
  { id: 8, name: "Burgers", image: "🍔" },
];

export default function CategoryList() {
  return (
    <div className="w-full my-8">
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-2xl font-bold text-gray-800">What's on your mind?</h2>
      </div>
      
      {/* Horizontal Scroll Container */}
      <div className="flex overflow-x-auto gap-6 pb-4 custom-scrollbar-light px-2 snap-x">
        {categories.map((cat) => (
          <Link 
            href={`/dashboard/category/${cat.name.toLowerCase()}`}
            key={cat.id} 
            className="flex flex-col items-center gap-3 min-w-[100px] cursor-pointer group snap-start"
          >
            <div className="w-20 h-20 rounded-full bg-white glass-card flex items-center justify-center text-4xl shadow-md group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
              {cat.image}
            </div>
            <span className="font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
