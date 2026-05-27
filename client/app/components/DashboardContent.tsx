"use client";

import { BarChart3, Bell, Check, CheckCircle, Clock, Home, LogOut, Menu, Settings, ShoppingCart, TrendingUp, User, Users, UtensilsCrossed, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { authService } from "../lib/authService";

const Dashboard = () => {
 const [user, setUser] = useState<any>(null);
 const [sidebarOpen, setSidebarOpen] = useState(false);

 useEffect(() => {
 const currentUser = authService.getCurrentUser();
 setUser(currentUser || { name: "Guest", role: "guest" });
 }, []);

 const handleLogout = () => {
 authService.logout();
 };

 const menuItems = [
 { icon: Home, label: "Dashboard", href: "/dashboard", active: true },
 { icon: ShoppingCart, label: "Orders", href: "/orders" },
 { icon: Users, label: "Customers", href: "/customers" },
 { icon: BarChart3, label: "Analytics", href: "/analytics" },
 { icon: Settings, label: "Settings", href: "/settings" },
 ];

 if (!user) {
 return (
 <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
 <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
 {/* Sidebar */}
 <motion.div
 initial={{ x: -300 }}
 animate={{ x: sidebarOpen ? 0 : -300 }}
 transition={{ duration: 0.3 }}
 className="fixed inset-y-0 left-0 z-50 w-64 bg-black/20 border-r border-white/10 lg:translate-x-0 lg:static lg:inset-0"
 >
 <div className="flex items-center justify-between h-16 px-6 border-b border-white/10">
 <div className="flex items-center space-x-3">
 <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
 <UtensilsCrossed className="h-5 w-5 text-[var(--color-accent)]" strokeWidth={1.5} />
 </div>
 <span className="text-lg font-semibold text-white">PineSphere</span>
 </div>
 <button
 onClick={() => setSidebarOpen(false)}
 className="lg:hidden text-gray-400 hover:text-white"
 >
 <X className="h-4 w-4" strokeWidth={1.5} />
 </button>
 </div>

 <nav className="mt-8 px-4">
 <div className="space-y-2">
 {menuItems.map((item, index) => (
 <motion.a
 key={item.label}
 href={item.href}
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: index * 0.1 }}
 className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
 item.active
 ? "bg-orange-500 text-white"
 : "text-gray-400 hover:text-white hover:bg-white/5"
 }`}
 >
 <item.icon size={20} />
 <span>{item.label}</span>
 </motion.a>
 ))}
 </div>
 </nav>

 <div className="absolute bottom-4 left-4 right-4">
 <button
 onClick={handleLogout}
 className="flex items-center space-x-3 w-full px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
 >
 <LogOut className="h-4 w-4" strokeWidth={1.5} />
 <span>Logout</span>
 </button>
 </div>
 </motion.div>

 {/* Main Content */}
 <div className="lg:ml-64">
 {/* Header */}
 <header className="bg-black/20 border-b border-white/10 px-6 py-4">
 <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
 <div className="flex items-center gap-4">
 <button
 onClick={() => setSidebarOpen(true)}
 className="lg:hidden text-gray-400 hover:text-white"
 >
 <Menu className="h-4 w-4" strokeWidth={1.5} />
 </button>
 <div>
 <h1 className="text-xl font-semibold text-white">Dashboard</h1>
 <p className="text-sm text-gray-400">
 Overview of store performance and order activity
 </p>
 </div>
 </div>

 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
 <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-gray-300 border border-white/10">
 <Clock className="h-4 w-4 text-orange-400" strokeWidth={1.5} />
 <span>Live data — updated now</span>
 </div>
 <div className="flex items-center space-x-4">
 <button className="relative text-gray-400 hover:text-white">
 <Bell className="h-4 w-4" strokeWidth={1.5} />
 <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"></span>
 </button>
 <div className="flex items-center space-x-3">
 <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
 <span className="text-sm font-medium text-white">
 {user?.name?.charAt(0) || "U"}
 </span>
 </div>
 <div className="hidden sm:block">
 <p className="text-sm font-medium text-white">
 {user?.name || "User"}
 </p>
 <p className="text-xs text-gray-400 capitalize">
 {user?.role || "cashier"}
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>
 </header>

 {/* Dashboard Content */}
 <main className="p-6">
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6 }}
 >
 {/* Welcome Section */}
 <div className="mb-8">
 <h2 className="text-3xl font-semibold text-white mb-2">
 Welcome back, {user?.name || "User"}! 👋
 </h2>
 <p className="text-gray-400">
 Here's a summary of your restaurant's performance today
 </p>
 </div>

 {/* Stats Cards */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
 {[
 {
 title: "Today's Sales",
 value: "$2,847",
 change: "+12%",
 icon: ShoppingCart,
 bgColor: "from-green-500/20 to-emerald-500/20",
 borderColor: "border-green-500/30",
 textColor: "text-green-400",
 },
 {
 title: "Total Orders",
 value: "156",
 change: "+8%",
 icon: CheckCircle,
 bgColor: "from-blue-500/20 to-cyan-500/20",
 borderColor: "border-blue-500/30",
 textColor: "text-blue-400",
 },
 {
 title: "Active Customers",
 value: "89",
 change: "+15%",
 icon: Users,
 bgColor: "from-purple-500/20 to-pink-500/20",
 borderColor: "border-purple-500/30",
 textColor: "text-purple-400",
 progress: "w-2/3",
 },
 {
 title: "Total Revenue",
 value: "$12,847",
 change: "+23%",
 icon: TrendingUp,
 bgColor: "from-orange-500/20 to-red-500/20",
 borderColor: "border-orange-500/30",
 textColor: "text-orange-400",
 progress: "w-4/5",
 },
 ].map((stat, index) => {
 const StatIcon = stat.icon;
 return (
 <motion.div
 key={stat.title}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: index * 0.1 }}
 whileHover={{ y: -5, transition: { duration: 0.2 } }}
 className={`relative bg-gradient-to-br ${stat.bgColor} rounded-2xl p-6 border ${stat.borderColor} overflow-hidden group shadow-black/20`}
 >
 {/* Background glow effect */}
 <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

 <div className="relative">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-gray-300 text-sm font-medium">
 {stat.title}
 </h3>
 <div
 className={`w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center ${stat.textColor}`}
 >
 <StatIcon className="h-4 w-4" strokeWidth={1.5} />
 </div>
 </div>

 <div className="flex items-end justify-between gap-6">
 <div>
 <p className="text-3xl font-semibold text-white">
 {stat.value}
 </p>
 <div className="flex items-center mt-2 gap-1">
 <TrendingUp className={`h-4 w-4 ${stat.textColor}`} strokeWidth={1.5} />
 <span
 className={`text-sm font-semibold ${stat.textColor}`}
 >
 {stat.change}
 </span>
 </div>
 </div>
 </div>

 {/* Progress bar */}
 <div className="mt-5 h-2 bg-white/10 rounded-full overflow-hidden">
 <div
 className={`h-full bg-gradient-to-r ${stat.bgColor} ${stat.progress}`}
 />
 </div>
 </div>
 </motion.div>
 );
 })}
 </div>

 {/* Recent Activity */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.4 }}
 className="bg-white/5 rounded-2xl p-6 border border-white/10"
 >
 <h3 className="text-lg font-semibold text-white mb-4">
 Recent Orders
 </h3>
 <div className="space-y-4">
 {[
 {
 id: "#1234",
 customer: "John Doe",
 amount: "$45.99",
 status: "Completed",
 time: "2 min ago",
 },
 {
 id: "#1235",
 customer: "Jane Smith",
 amount: "$32.50",
 status: "Preparing",
 time: "5 min ago",
 },
 {
 id: "#1236",
 customer: "Mike Johnson",
 amount: "$78.25",
 status: "Delivered",
 time: "8 min ago",
 },
 ].map((order, index) => (
 <motion.div
 key={order.id}
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: 0.5 + index * 0.1 }}
 className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5"
 >
 <div className="flex items-center space-x-4">
 <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
 <span className="text-sm font-medium text-white">
 {order.customer.charAt(0)}
 </span>
 </div>
 <div>
 <p className="text-white font-medium">
 {order.customer}
 </p>
 <p className="text-gray-400 text-sm">
 {order.id} • {order.time}
 </p>
 </div>
 </div>
 <div className="text-right">
 <p className="text-white font-medium">{order.amount}</p>
 <span
 className={`text-sm px-2 py-1 rounded-full ${
 order.status === "Completed"
 ? "bg-green-500/20 text-green-400"
 : order.status === "Preparing"
 ? "bg-yellow-500/20 text-yellow-400"
 : "bg-blue-500/20 text-blue-400"
 }`}
 >
 {order.status}
 </span>
 </div>
 </motion.div>
 ))}
 </div>
 </motion.div>
 </motion.div>
 </main>
 </div>

 {/* Mobile Sidebar Overlay */}
 {sidebarOpen && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={() => setSidebarOpen(false)}
 className="fixed inset-0 bg-black/50 z-40 lg:hidden"
 />
 )}
 </div>
 );
};

export default Dashboard;
