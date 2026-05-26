"use client";

import React from "react";
import FoodCard from "./FoodCard";

// Using valid Unsplash image IDs as placeholders
const recommendedData = [
  {
    id: "1",
    name: "Classic Cheeseburger",
    restaurant: "Burger King",
    rating: 4.5,
    time: "25-30 min",
    price: 199,
    tags: "American, Fast Food, Burgers",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: "2",
    name: "Margherita Pizza",
    restaurant: "Domino's Pizza",
    rating: 4.2,
    time: "30-40 min",
    price: 249,
    tags: "Italian, Pizzas, Fast Food",
    imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: "3",
    name: "Chicken Biryani",
    restaurant: "Behrouz Biryani",
    rating: 4.8,
    time: "35-45 min",
    price: 349,
    tags: "Mughlai, Biryani, North Indian",
    imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=500&q=80"
  },
  {
    id: "4",
    name: "Chocolate Truffle Cake",
    restaurant: "Theobroma",
    rating: 4.7,
    time: "20-25 min",
    price: 550,
    tags: "Desserts, Bakery, Cakes",
    imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80"
  }
];

export default function RecommendedFoods() {
  return (
    <div className="w-full my-8">
      <div className="mb-6 px-2">
        <h2 className="text-2xl font-bold text-gray-800">Top restaurants & dishes for you</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-2">
        {recommendedData.map((food) => (
          <FoodCard key={food.id} {...food} />
        ))}
      </div>
    </div>
  );
}
