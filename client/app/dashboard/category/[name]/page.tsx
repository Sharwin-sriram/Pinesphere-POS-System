"use client";

import React, { use } from "react";
import FoodCard from "../../../components/dashboard/FoodCard";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

const dummyDishes = [
  {
    id: "c1",
    name: "Special Variant 1",
    restaurant: "Local Taste House",
    rating: 4.5,
    time: "20-30 min",
    price: 150,
    tags: "Best Seller, Fresh",
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: "c2",
    name: "Premium Option",
    restaurant: "Gourmet Kitchen",
    rating: 4.8,
    time: "30-40 min",
    price: 299,
    tags: "Premium, Signature",
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: "c3",
    name: "Classic Choice",
    restaurant: "The Daily Diner",
    rating: 4.2,
    time: "15-25 min",
    price: 120,
    tags: "Quick Bite, Classic",
    imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: "c4",
    name: "Chef's Special",
    restaurant: "Master Chef Restaurant",
    rating: 4.9,
    time: "40-50 min",
    price: 450,
    tags: "Highly Rated, Special",
    imageUrl: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=500&q=80"
  },
];

export default function CategoryPage({ params }: { params: Promise<{ name: string }> }) {
  const resolvedParams = use(params);
  const categoryName = resolvedParams.name.charAt(0).toUpperCase() + resolvedParams.name.slice(1);

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/dashboard" className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all">
          <FiArrowLeft size={20} className="text-gray-700" />
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">{categoryName}</h1>
      </div>
      
      <p className="text-gray-500 mb-4">Showing the best {categoryName} options near you.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-2">
        {dummyDishes.map((dish) => (
          <FoodCard 
            key={dish.id} 
            {...dish} 
            name={`${categoryName} - ${dish.name}`} 
          />
        ))}
      </div>
    </div>
  );
}
