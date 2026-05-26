"use client";

import { ArrowLeft, Check, ShoppingCart } from "lucide-react";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { usePOS, OrderItem } from "../../../components/shared/POSContext";
import toast from "react-hot-toast";

const dummyMenu = [
 { id: "D1", name: "Onion Pizza", price: 12.99, category: "Pizza", ingredients: ["Onion", "Cheese", "Tomato Sauce", "Olive Oil"] },
 { id: "D2", name: "Classic Cheeseburger", price: 9.99, category: "Burger", ingredients: ["Beef Patty", "Cheddar", "Lettuce", "Tomato", "Brioche Bun"] },
 { id: "D3", name: "Caesar Salad", price: 8.50, category: "Salad", ingredients: ["Romaine", "Croutons", "Parmesan", "Caesar Dressing"] },
 { id: "D4", name: "Grilled Salmon", price: 18.99, category: "Mains", ingredients: ["Salmon Fillet", "Lemon", "Asparagus", "Garlic Butter"] },
 { id: "D5", name: "Fresh Lemonade", price: 4.50, category: "Drinks", ingredients: ["Lemon", "Mint", "Sugar", "Ice"] },
 { id: "D6", name: "Chocolate Lava Cake", price: 6.99, category: "Dessert", ingredients: ["Chocolate", "Flour", "Butter", "Vanilla Ice Cream"] },
];

export default function TableMenuPage() {
 const params = useParams();
 const router = useRouter();
 const { placeOrder } = usePOS();
 const tableId = params.id as string;

 const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);

 const toggleItem = (dish: any) => {
 const isSelected = selectedItems.find(item => item.id === dish.id);
 if (isSelected) {
 setSelectedItems(selectedItems.filter(item => item.id !== dish.id));
 } else {
 setSelectedItems([...selectedItems, { id: dish.id, name: dish.name, price: dish.price }]);
 }
 };

 const handlePlaceOrder = () => {
 if (selectedItems.length === 0) {
 toast.error("Please select at least one dish.");
 return;
 }
 
 placeOrder(tableId, selectedItems);
 toast.success("Order placed successfully!");
 router.push("/waiter/orders");
 };

 const totalAmount = selectedItems.reduce((sum, item) => sum + item.price, 0);

 return (
 <div className="flex flex-col h-full relative animate-fade-in-up pb-20">
 
 {/* Header */}
 <div className="flex items-center gap-4 mb-6">
 <button onClick={() => router.back()} className="p-2 bg-white rounded-xl text-gray-500 hover:text-blue-600 transition-colors">
 <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
 </button>
 <div>
 <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">Menu for Table {tableId}</h2>
 <p className="text-sm text-gray-500">Select dishes to add to the order</p>
 </div>
 </div>

 {/* Menu List */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {dummyMenu.map((dish) => {
 const isSelected = selectedItems.some(item => item.id === dish.id);
 
 return (
 <div 
 key={dish.id} 
 className={`card-light !p-4 flex justify-between items-center transition-all ${
 isSelected ? 'border-blue-400 bg-blue-50/30' : 'hover:border-gray-300'
 }`}
 >
 <div className="flex-1 pr-4">
 <div className="flex justify-between items-start mb-1">
 <h3 className="font-semibold text-[var(--color-text-primary)]">{dish.name}</h3>
 <span className="font-semibold text-blue-600">${dish.price.toFixed(2)}</span>
 </div>
 <p className="text-xs text-gray-500 italic">
 Ingredients: {dish.ingredients.join(", ")}
 </p>
 </div>

 <button 
 onClick={() => toggleItem(dish)}
 className={`flex-shrink-0 w-24 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1 ${
 isSelected 
 ? 'bg-red-100 text-red-600 hover:bg-red-200' 
 : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
 }`}
 >
 {isSelected ? 'Deselect' : 'Select'}
 {isSelected && <Check />}
 </button>
 </div>
 );
 })}
 </div>

 {/* Sticky Bottom Bar for Checkout */}
 {selectedItems.length > 0 && (
 <div className="fixed bottom-0 left-0 right-0 md:left-28 bg-white/80 border-t border-gray-200 p-4 z-40 animate-fade-in-up">
 <div className="max-w-5xl mx-auto flex items-center justify-between">
 <div>
 <p className="text-sm text-gray-500 font-medium">Selected: {selectedItems.length} items</p>
 <p className="text-xl font-semibold text-[var(--color-text-primary)]">Total: ${totalAmount.toFixed(2)}</p>
 </div>
 
 <button 
 onClick={handlePlaceOrder}
 className="bg-[var(--color-blue)] text-white px-8 py-3 rounded-ds-md font-semibold hover:-translate-y-1 transition-smooth flex items-center gap-2"
 style={{border: 'none'}}
 >
 <ShoppingCart />
 Submit Order
 </button>
 </div>
 </div>
 )}
 
 </div>
 );
}
