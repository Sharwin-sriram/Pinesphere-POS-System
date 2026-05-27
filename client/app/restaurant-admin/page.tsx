"use client";

import { DollarSign, ShoppingBag, TrendingUp, Users } from "lucide-react";
import React from "react";

const stats = [
  { title: "Total Revenue", amount: "$12,426", change: "+32.40%", isUp: true, icon: DollarSign, color: "text-[var(--color-accent-green)]", bg: "bg-[var(--color-accent-green-subtle)]" },
  { title: "Total Dish Ordered", amount: "2,345", change: "-12.40%", isUp: false, icon: ShoppingBag, color: "text-[var(--color-danger)]", bg: "bg-[var(--color-danger-subtle)]" },
  { title: "Total Customers", amount: "1,234", change: "+2.40%", isUp: true, icon: Users, color: "text-[var(--color-blue)]", bg: "bg-[var(--color-blue-subtle)]" },
];

export default function RestaurantAdminDashboard() {
  const [activeTimeFilter, setActiveTimeFilter] = React.useState("Monthly");
  const timeFilters = ["Today", "Weekly", "Monthly"];

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-[length:var(--text-xl)] font-semibold text-[var(--color-text-primary)]">Dashboard Overview</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="card-light !p-6 flex flex-col justify-between">
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <h3 className="text-[var(--color-text-secondary)] text-[length:var(--text-sm)] font-medium">{stat.title}</h3>
                <p className="text-[length:var(--text-xl)] font-semibold text-[var(--color-text-primary)] mt-1">{stat.amount}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[length:var(--text-sm)]">
              <span className={`flex items-center gap-1 ${stat.isUp ? 'text-[var(--color-accent-green)]' : 'text-[var(--color-danger)]'}`}>
                {stat.isUp ? (
                  <TrendingUp className="h-4 w-4" strokeWidth={1.5} />
                ) : (
                  <TrendingUp className="h-4 w-4 rotate-180" strokeWidth={1.5} />
                )}
                {stat.change}
              </span>
              <span className="text-[var(--color-text-muted)]">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
        
        {/* Mock Line Chart */}
        <div className="lg:col-span-2 card-light !p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[length:var(--text-lg)] font-semibold text-[var(--color-text-primary)]">Revenue Growth</h3>
            <div className="flex items-center gap-1 bg-[var(--color-bg-tertiary)] p-1 rounded-xl">
              {timeFilters.map((filter) => {
                const isActive = activeTimeFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setActiveTimeFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-[var(--color-accent-green)] text-white shadow-sm"
                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]"
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Simple SVG Line Chart Mockup */}
          <div className="h-64 w-full flex items-end gap-2 relative">
            <div className="absolute inset-0 border-b border-l border-[var(--color-border)] pointer-events-none" />
            {[40, 60, 45, 80, 55, 90, 75, 100, 85, 110, 95, 120].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end items-center group relative h-full">
                {/* Tooltip */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 bg-[var(--color-accent-green)] text-white text-xs font-semibold px-2 py-1 rounded transition-opacity">
                  ${h}k
                </div>
                {/* Bar */}
                <div 
                  className="w-full bg-gradient-to-t from-[var(--color-accent-green)] to-[var(--color-accent-green-hover)] rounded-t-sm opacity-80 group-hover:opacity-100 transition-all duration-150" 
                  style={{ height: `${(h / 120) * 100}%` }}
                />
                <span className="text-[10px] text-[var(--color-text-muted)] mt-2">M{i+1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mock Pie Chart */}
        <div className="card-light !p-6 flex flex-col">
          <h3 className="text-[length:var(--text-lg)] font-semibold text-[var(--color-text-primary)] mb-6">Order Distribution</h3>
          
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* CSS Conic Gradient Pie Chart Mock */}
            <div 
              className="w-48 h-48 rounded-full relative flex items-center justify-center"
              style={{
                background: 'conic-gradient(var(--color-accent-green) 0% 45%, var(--color-blue) 45% 75%, var(--color-accent) 75% 100%)'
              }}
            >
              <div className="w-32 h-32 bg-[var(--color-bg-secondary)] rounded-full flex flex-col items-center justify-center shadow-inner">
                <span className="text-[length:var(--text-xl)] font-semibold text-[var(--color-text-primary)]">45%</span>
                <span className="text-xs text-[var(--color-text-muted)]">Dine-in</span>
              </div>
            </div>

            <div className="w-full mt-8 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[var(--color-accent-green)]"></div>
                  <span className="text-[length:var(--text-sm)] text-[var(--color-text-secondary)]">Dine-in</span>
                </div>
                <span className="text-[length:var(--text-sm)] text-[var(--color-text-primary)] font-semibold">45%</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[var(--color-blue)]"></div>
                  <span className="text-[length:var(--text-sm)] text-[var(--color-text-secondary)]">Takeaway</span>
                </div>
                <span className="text-[length:var(--text-sm)] text-[var(--color-text-primary)] font-semibold">30%</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[var(--color-accent)]"></div>
                  <span className="text-[length:var(--text-sm)] text-[var(--color-text-secondary)]">Delivery</span>
                </div>
                <span className="text-[length:var(--text-sm)] text-[var(--color-text-primary)] font-semibold">25%</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
