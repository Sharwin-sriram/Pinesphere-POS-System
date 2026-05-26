"use client";

import { ArrowLeft, Clock, Star } from "lucide-react";
import React from "react";
import Link from "next/link";


const dummyRestaurants = [
 {
 id: "r1",
 name: "KFC - Kentucky Fried Chicken",
 cuisine: "American, Fast Food, Burgers",
 rating: 4.1,
 deliveryTime: "30-40 min",
 offer: "Flat ₹50 OFF",
 imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80"
 },
 {
 id: "r2",
 name: "Domino's Pizza",
 cuisine: "Italian, Pizzas, Fast Food",
 rating: 4.3,
 deliveryTime: "25-30 min",
 offer: "₹100 OFF above ₹499",
 imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=80"
 },
 {
 id: "r3",
 name: "Local Biryani House",
 cuisine: "Mughlai, Biryani, North Indian",
 rating: 4.7,
 deliveryTime: "40-50 min",
 offer: "10% OFF up to ₹40",
 imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=500&q=80"
 },
 {
 id: "r4",
 name: "Theobroma",
 cuisine: "Desserts, Bakery, Cakes",
 rating: 4.8,
 deliveryTime: "15-25 min",
 offer: "Free Delivery",
 imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80"
 }
];

export default function RestaurantsPage() {
 return (
 <div className="flex flex-col gap-6 animate-fade-in-up">
 <div className="flex items-center gap-4 mb-2">
 <Link href="/dashboard" className="p-2 bg-white rounded-full hover: transition-all">
 <ArrowLeft className="h-4 w-4 text-gray-700" strokeWidth={1.5} />
 </Link>
 <h1 className="text-3xl font-semibold text-[var(--color-text-primary)]">Top Restaurants</h1>
 </div>
 
 <p className="text-gray-500 mb-4">Discover the best food and drinks near you</p>

 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-2">
 {dummyRestaurants.map((restaurant) => (
 <div key={restaurant.id} className="card-light overflow-hidden group cursor-pointer flex flex-col h-full !p-0">
 <div className="relative h-40 w-full overflow-hidden bg-gray-200">
 <div 
 className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-250"
 style={{ backgroundImage: `url('${restaurant.imageUrl}')` }}
 />
 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
 
 <div className="absolute bottom-3 left-3 flex flex-col">
 <span className="text-white text-lg font-semibold">{restaurant.offer}</span>
 </div>
 </div>

 <div className="p-4 flex flex-col flex-grow">
 <div className="flex justify-between items-start mb-1">
 <h3 className="font-semibold text-lg text-[var(--color-text-primary)] line-clamp-1">{restaurant.name}</h3>
 <div className="flex items-center gap-1 bg-green-600 text-white px-1.5 py-0.5 rounded text-xs font-semibold shrink-0">
 <span>{restaurant.rating}</span>
 <Star className="h-4 w-4" strokeWidth={1.5} />
 </div>
 </div>
 
 <p className="text-gray-500 text-sm mb-3 line-clamp-1">{restaurant.cuisine}</p>
 
 <div className="mt-auto flex items-center gap-2 text-[var(--color-text-secondary)] text-sm font-medium">
 <Clock className="h-4 w-4" strokeWidth={1.5} />
 <span>{restaurant.deliveryTime}</span>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 );
}
