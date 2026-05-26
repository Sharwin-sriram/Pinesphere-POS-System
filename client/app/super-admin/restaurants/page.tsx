"use client";

import React, { useState } from "react";
import { FiEdit2, FiTrash2, FiPower, FiCheckCircle, FiExternalLink } from "react-icons/fi";
import toast from "react-hot-toast";
import Link from "next/link";

const initialRestaurants = [
  { id: "RES-101", name: "The Spicy Grill", owner: "Alex Johnson", type: "Dine-in", status: "Active" },
  { id: "RES-102", name: "Sushi Master", owner: "Kenji Sato", type: "Takeaway", status: "Active" },
  { id: "RES-103", name: "Pizza Hut Downtown", owner: "Maria Garcia", type: "Delivery", status: "Suspended" },
  { id: "RES-104", name: "Vegan Bites", owner: "Emma Wilson", type: "Dine-in", status: "Pending" },
];

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState(initialRestaurants);

  const handleToggleStatus = (id: string, currentStatus: string) => {
    let newStatus = "Active";
    if (currentStatus === "Active") newStatus = "Suspended";
    if (currentStatus === "Pending") newStatus = "Active";
    
    setRestaurants(restaurants.map(r => r.id === id ? { ...r, status: newStatus } : r));
    toast.success(`Restaurant status changed to ${newStatus}.`);
  };

  const handleDelete = (id: string) => {
    setRestaurants(restaurants.filter(r => r.id !== id));
    toast.error("Restaurant deleted from platform.");
  };

  return (
    <div className="flex flex-col h-full animate-fade-in-up">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Restaurant Management</h2>
          <p className="text-sm text-gray-500">Approve, suspend, or manage onboarded restaurants.</p>
        </div>
      </div>

      <div className="card-light !p-0 overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200 text-gray-500 text-sm">
                <th className="p-4 font-semibold">Res ID</th>
                <th className="p-4 font-semibold">Restaurant Name</th>
                <th className="p-4 font-semibold">Owner</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {restaurants.map((res) => (
                <tr key={res.id} className="border-b border-gray-100 hover:bg-white/60 transition-colors">
                  <td className="p-4 text-sm font-medium text-gray-600">{res.id}</td>
                  <td className="p-4 font-bold text-gray-800 flex items-center gap-2">
                    {res.name}
                    <Link href="/restaurant-admin" target="_blank" className="text-blue-500 hover:text-blue-700" title="View Dashboard">
                      <FiExternalLink size={14} />
                    </Link>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{res.owner}</td>
                  <td className="p-4 text-sm text-gray-500">{res.type}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                      res.status === 'Active' ? 'bg-green-100 text-green-600' : 
                      res.status === 'Suspended' ? 'bg-red-100 text-red-600' : 
                      'bg-orange-100 text-orange-600'
                    }`}>
                      {res.status === 'Active' ? <FiCheckCircle size={12} /> : <FiPower size={12} />}
                      {res.status}
                    </span>
                  </td>
                  <td className="p-4 flex justify-end gap-2">
                    <button 
                      onClick={() => toast(`Editing ${res.name}`, { icon: '✏️' })}
                      className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      title="Edit Details"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(res.id, res.status)}
                      className={`p-2 rounded-lg transition-colors ${res.status === 'Active' ? 'text-orange-600 bg-orange-50 hover:bg-orange-100' : 'text-green-600 bg-green-50 hover:bg-green-100'}`}
                      title={res.status === 'Active' ? "Suspend" : "Activate"}
                    >
                      {res.status === 'Active' ? <FiPower size={16} /> : <FiCheckCircle size={16} />}
                    </button>
                    <button 
                      onClick={() => handleDelete(res.id)}
                      className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      title="Delete Restaurant"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
