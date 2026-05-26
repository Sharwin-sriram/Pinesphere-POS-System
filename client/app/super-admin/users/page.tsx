"use client";

import { Ban, Check, CheckCircle, Pencil, Trash2 } from "lucide-react";
import React, { useState } from "react";

import toast from "react-hot-toast";

const initialUsers = [
 { id: "USR-001", name: "Alex Johnson", email: "alex.j@example.com", status: "Active", joined: "2026-01-15" },
 { id: "USR-002", name: "Maria Garcia", email: "maria.g@example.com", status: "Banned", joined: "2026-02-10" },
 { id: "USR-003", name: "David Kim", email: "dkim@example.com", status: "Active", joined: "2026-02-22" },
 { id: "USR-004", name: "Emma Wilson", email: "emma.w@example.com", status: "Active", joined: "2026-03-05" },
];

export default function UsersPage() {
 const [users, setUsers] = useState(initialUsers);

 const handleBan = (id: string, currentStatus: string) => {
 const newStatus = currentStatus === "Banned" ? "Active" : "Banned";
 setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
 toast.success(`User ${newStatus === "Banned" ? "banned" : "reactivated"} successfully.`);
 };

 const handleDelete = (id: string) => {
 setUsers(users.filter(u => u.id !== id));
 toast.error("User deleted permanently.");
 };

 const handleEdit = (name: string) => {
 toast(`Editing user: ${name}`, { icon: '✏️' });
 };

 return (
 <div className="flex flex-col h-full animate-fade-in-up">
 <div className="flex justify-between items-center mb-6">
 <div>
 <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">User Management</h2>
 <p className="text-sm text-gray-500">View and manage all registered users on the platform.</p>
 </div>
 </div>

 <div className="card-light !p-0 overflow-hidden flex-1 flex flex-col">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-[var(--color-bg-primary)]/50 border-b border-gray-200 text-gray-500 text-sm">
 <th className="p-4 font-semibold">User ID</th>
 <th className="p-4 font-semibold">Name</th>
 <th className="p-4 font-semibold">Email</th>
 <th className="p-4 font-semibold">Joined Date</th>
 <th className="p-4 font-semibold">Status</th>
 <th className="p-4 font-semibold text-right">Actions</th>
 </tr>
 </thead>
 <tbody>
 {users.map((user) => (
 <tr key={user.id} className="border-b border-gray-100 hover:bg-white/60 transition-colors">
 <td className="p-4 text-sm font-medium text-[var(--color-text-secondary)]">{user.id}</td>
 <td className="p-4 font-semibold text-[var(--color-text-primary)]">{user.name}</td>
 <td className="p-4 text-sm text-[var(--color-text-secondary)]">{user.email}</td>
 <td className="p-4 text-sm text-gray-500">{user.joined}</td>
 <td className="p-4">
 <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
 user.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
 }`}>
 {user.status === 'Active' ? <CheckCircle className="h-4 w-4" strokeWidth={1.5} /> : <Ban className="h-4 w-4" strokeWidth={1.5} />}
 {user.status}
 </span>
 </td>
 <td className="p-4 flex justify-end gap-2">
 <button 
 onClick={() => handleEdit(user.name)}
 className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors tooltip"
 title="Edit User"
 >
 <Pencil className="h-4 w-4" strokeWidth={1.5} />
 </button>
 <button 
 onClick={() => handleBan(user.id, user.status)}
 className={`p-2 rounded-lg transition-colors ${user.status === 'Active' ? 'text-orange-600 bg-orange-50 hover:bg-orange-100' : 'text-green-600 bg-green-50 hover:bg-green-100'}`}
 title={user.status === 'Active' ? "Ban User" : "Unban User"}
 >
 {user.status === 'Active' ? <Ban className="h-4 w-4" strokeWidth={1.5} /> : <CheckCircle className="h-4 w-4" strokeWidth={1.5} />}
 </button>
 <button 
 onClick={() => handleDelete(user.id)}
 className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
 title="Delete User"
 >
 <Trash2 className="h-4 w-4" strokeWidth={1.5} />
 </button>
 </td>
 </tr>
 ))}
 
 {users.length === 0 && (
 <tr>
 <td colSpan={6} className="p-8 text-center text-gray-500">No users found.</td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 );
}
