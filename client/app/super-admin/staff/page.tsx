"use client";

import React, { useState } from "react";
import { FiEdit2, FiTrash2, FiShield } from "react-icons/fi";
import toast from "react-hot-toast";

const initialStaff = [
  { id: "STF-001", name: "Super Admin", role: "Super Admin", email: "admin@platform.com" },
  { id: "STF-002", name: "Support Agent 1", role: "Support", email: "support1@platform.com" },
  { id: "STF-003", name: "Billing Manager", role: "Billing", email: "billing@platform.com" },
];

export default function StaffPage() {
  const [staff, setStaff] = useState(initialStaff);

  const handleDelete = (id: string) => {
    if (id === "STF-001") {
      toast.error("Cannot delete the root Super Admin.");
      return;
    }
    setStaff(staff.filter(s => s.id !== id));
    toast.success("Staff member removed.");
  };

  return (
    <div className="flex flex-col h-full animate-fade-in-up">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Platform Staff Management</h2>
          <p className="text-sm text-gray-500">Manage internal employees and their access levels.</p>
        </div>
        <button className="bg-gradient-to-tr from-blue-500 to-cyan-400 text-white px-4 py-2 rounded-xl font-bold shadow-sm hover:shadow-md transition-all text-sm">
          + Add Staff Member
        </button>
      </div>

      <div className="card-light !p-0 overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200 text-gray-500 text-sm">
                <th className="p-4 font-semibold">Staff ID</th>
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Access Role</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => (
                <tr key={member.id} className="border-b border-gray-100 hover:bg-white/60 transition-colors">
                  <td className="p-4 text-sm font-medium text-gray-600">{member.id}</td>
                  <td className="p-4 font-bold text-gray-800">{member.name}</td>
                  <td className="p-4 text-sm text-gray-600">{member.email}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                      <FiShield size={12} />
                      {member.role}
                    </span>
                  </td>
                  <td className="p-4 flex justify-end gap-2">
                    <button 
                      onClick={() => toast(`Changing role for ${member.name}`)}
                      className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      title="Edit Role"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(member.id)}
                      className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      title="Revoke Access"
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
