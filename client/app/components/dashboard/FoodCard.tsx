"use client";

import { Star } from "lucide-react";
import React from "react";

import { useCart } from "./CartContext";

interface FoodCardProps {
 id: string;
 name: string;
 restaurant: string;
 rating: number;
 time: string;
 price: number;
 tags: string;
 imageUrl: string;
}

export default function FoodCard({ id, name, restaurant, rating, time, price, tags, imageUrl }: FoodCardProps) {
 const { addToCart } = useCart();

 const handleAdd = (e: React.MouseEvent) => {
 e.preventDefault();
 e.stopPropagation();
 addToCart({ id, name, price });
 };

 return (
 <div className="card-light overflow-hidden group cursor-pointer flex flex-col h-full !p-0">
 {/* Image Section */}
 <div className="relative h-48 w-full overflow-hidden bg-gray-200">
 <div 
 className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-250"
 style={{ backgroundImage: `url('${imageUrl}')` }}
 />
 {/* Floating Gradient overlay to ensure text readability if any overlay text exists */}
 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
 
 {/* Discount Badge */}
 <div className="absolute bottom-3 left-3 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-md ">
 PROMOTED
 </div>
 </div>

 {/* Content Section */}
 <div className="p-4 flex flex-col flex-grow">
 <div className="flex justify-between items-start mb-1">
 <h3 className="font-semibold text-lg text-[var(--color-text-primary)] line-clamp-1">{name}</h3>
 <div className="flex items-center gap-1 bg-green-600 text-white px-1.5 py-0.5 rounded text-xs font-semibold ">
 <span>{rating}</span>
 <Star className="h-4 w-4" strokeWidth={1.5} />
 </div>
 </div>
 
 <p className="text-gray-500 text-sm mb-2 font-medium">{restaurant}</p>
 
 <p className="text-gray-400 text-xs mb-4 line-clamp-1">{tags}</p>
 
 <div className="mt-auto flex items-center justify-between">
 <div className="flex flex-col">
 <span className="text-xs text-gray-500">{time}</span>
 <span className="font-semibold text-[var(--color-text-primary)]">₹{price}</span>
 </div>
 
 <button 
 onClick={handleAdd}
 className="btn-light !px-6 !py-2 !rounded-lg text-sm uppercase tracking-wide z-10"
 >
 Add
 </button>
 </div>
 </div>
 </div>
 );
}
