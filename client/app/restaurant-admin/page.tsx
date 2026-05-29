"use client";

import { DollarSign, ShoppingBag, TrendingUp, Users } from "lucide-react";
import React, { useEffect, useState } from "react";

import { authService, httpClient } from "../lib/authService";
import { menuApi } from "./menu/services/menuApi";
import { staffApi } from "./staff/services/staffApi";

type MenuItem = {
  category: string;
  status: string;
  quantity: number;
  low_stock_threshold: number;
};

type StaffMember = {
  role: string;
  status: string;
};

type DashboardData = {
  restaurantName: string;
  isActive: boolean;
  branchesTotal: number;
  activeBranches: number;
  menuItemsTotal: number;
  activeMenuItems: number;
  lowStockItems: number;
  staffTotal: number;
  activeStaff: number;
  onLeaveStaff: number;
  menuCategoryBreakdown: Array<{ label: string; value: number }>;
  staffRoleBreakdown: Array<{ label: string; value: number }>;
};

function buildBreakdown<T extends Record<string, string>>(items: T[], key: keyof T) {
  const counts = new Map<string, number>();
  items.forEach((item) => {
    const value = String(item[key] || "Unknown").trim() || "Unknown";
    counts.set(value, (counts.get(value) || 0) + 1);
  });

  return [...counts.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

export default function RestaurantAdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const profileResult = await authService.getProfile();
        const currentUser = profileResult.success ? profileResult.data : authService.getCurrentUser();
        const restaurantProfile = currentUser?.restaurant || null;
        const restaurantId = restaurantProfile?.id || currentUser?.restaurant_id;

        if (!restaurantId) {
          throw new Error("Unable to resolve restaurant context");
        }

        const [branchesResult, menuResult, staffResult] = await Promise.all([
          httpClient.get(`/api/restaurant/${restaurantId}/branches/`),
          menuApi.getMenu(restaurantId, { page_size: 1000, sort: "name_asc" }),
          staffApi.getStaff(restaurantId, { page_size: 1000, sort: "name_asc" }),
        ]);

        const branches = Array.isArray(branchesResult.data) ? branchesResult.data : [];
        const menuItems = (menuResult.results || []) as MenuItem[];
        const staffMembers = (staffResult.results || []) as StaffMember[];

        const dashboardSummary: DashboardData = {
          restaurantName: restaurantProfile?.name || currentUser?.restaurant_name || "Restaurant",
          isActive: Boolean(restaurantProfile?.is_active),
          branchesTotal: branches.length,
          activeBranches: branches.filter((branch: { is_active?: boolean }) => branch.is_active !== false).length,
          menuItemsTotal: menuItems.length,
          activeMenuItems: menuItems.filter((item) => item.status === "Active").length,
          lowStockItems: menuItems.filter((item) => item.quantity <= item.low_stock_threshold).length,
          staffTotal: staffResult.summary?.total_staff ?? staffMembers.length,
          activeStaff: staffResult.summary?.on_shift ?? staffMembers.filter((member) => member.status === "Active").length,
          onLeaveStaff: staffResult.summary?.on_leave ?? staffMembers.filter((member) => member.status === "On Leave").length,
          menuCategoryBreakdown: buildBreakdown(menuItems, "category").slice(0, 6),
          staffRoleBreakdown: buildBreakdown(staffMembers, "role").slice(0, 6),
        };

        if (!mounted) return;
        setDashboardData(dashboardSummary);
      } catch (loadError) {
        if (!mounted) return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load dashboard data");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const isApprovalPending = Boolean(dashboardData && !dashboardData.isActive);
  const metricCards = dashboardData
    ? [
        {
          title: "Branches",
          amount: `${dashboardData.branchesTotal}`,
          change: `${dashboardData.activeBranches} active`,
          isUp: true,
          icon: ShoppingBag,
          color: "text-[var(--color-accent-green)]",
          bg: "bg-[var(--color-accent-green-subtle)]",
        },
        {
          title: "Menu items",
          amount: `${dashboardData.menuItemsTotal}`,
          change: `${dashboardData.activeMenuItems} active`,
          isUp: true,
          icon: DollarSign,
          color: "text-[var(--color-blue)]",
          bg: "bg-[var(--color-blue-subtle)]",
        },
        {
          title: "Staff members",
          amount: `${dashboardData.staffTotal}`,
          change: `${dashboardData.activeStaff} on shift`,
          isUp: true,
          icon: Users,
          color: "text-[var(--color-accent)]",
          bg: "bg-[var(--color-accent-subtle)]",
        },
      ]
    : [];

  return (
    <div className="relative flex flex-col gap-6 animate-fade-in-up">
      {isApprovalPending && (
        <div className="sticky top-4 z-10 rounded-2xl border border-amber-200 bg-amber-50/95 px-4 py-3 shadow-[0_10px_30px_rgba(180,83,9,0.12)] backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700">
              Pending approval
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900">Waiting for admin approval</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-[length:var(--text-xl)] font-semibold text-[var(--color-text-primary)]">
            {dashboardData?.restaurantName || "Dashboard Overview"}
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Live backend data for menu, staff, and branch activity
          </p>
        </div>
      </div>

      {loading ? (
        <div className="card-light !p-6 text-sm text-[var(--color-text-secondary)]">
          Loading backend data...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : dashboardData ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {metricCards.map((stat, idx) => (
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
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
            <div className="card-light !p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[length:var(--text-lg)] font-semibold text-[var(--color-text-primary)]">Menu categories</h3>
                <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-[0.16em]">
                  From backend menu items
                </span>
              </div>

              <div className="space-y-4">
                {dashboardData.menuCategoryBreakdown.length > 0 ? (
                  dashboardData.menuCategoryBreakdown.map((entry) => (
                    <div key={entry.label} className="space-y-2">
                      <div className="flex justify-between text-sm font-medium text-[var(--color-text-secondary)]">
                        <span>{entry.label}</span>
                        <span>{entry.value}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[var(--color-bg-tertiary)]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent-green)] to-[var(--color-blue)]"
                          style={{ width: `${Math.max(8, (entry.value / dashboardData.menuItemsTotal) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[var(--color-text-muted)]">No menu items have been created yet.</p>
                )}
              </div>
            </div>

            <div className="card-light !p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[length:var(--text-lg)] font-semibold text-[var(--color-text-primary)]">Staff roles</h3>
                <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-[0.16em]">
                  From backend staff records
                </span>
              </div>

              <div className="flex flex-1 flex-col items-center justify-center">
                <div
                  className="w-48 h-48 rounded-full relative flex items-center justify-center"
                  style={{
                    background: dashboardData.staffRoleBreakdown.length
                      ? `conic-gradient(${dashboardData.staffRoleBreakdown
                          .map((entry, index) => {
                            const palette = ["var(--color-accent-green)", "var(--color-blue)", "var(--color-accent)", "var(--color-danger)", "var(--color-success)", "var(--color-warning)"];
                            const total = dashboardData.staffRoleBreakdown.reduce((sum, item) => sum + item.value, 0);
                            const start = dashboardData.staffRoleBreakdown
                              .slice(0, index)
                              .reduce((sum, item) => sum + item.value, 0);
                            const end = start + entry.value;
                            return `${palette[index % palette.length]} ${Math.round((start / total) * 100)}% ${Math.round((end / total) * 100)}%`;
                          })
                          .join(", ")})`
                      : "conic-gradient(var(--color-bg-tertiary) 0% 100%)",
                  }}
                >
                  <div className="w-32 h-32 bg-[var(--color-bg-secondary)] rounded-full flex flex-col items-center justify-center shadow-inner text-center px-3">
                    <span className="text-[length:var(--text-xl)] font-semibold text-[var(--color-text-primary)]">
                      {dashboardData.staffTotal}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)]">Staff total</span>
                  </div>
                </div>

                <div className="w-full mt-8 flex flex-col gap-3">
                  {dashboardData.staffRoleBreakdown.length > 0 ? (
                    dashboardData.staffRoleBreakdown.map((entry, index) => {
                      const palette = ["bg-[var(--color-accent-green)]", "bg-[var(--color-blue)]", "bg-[var(--color-accent)]", "bg-[var(--color-danger)]", "bg-[var(--color-success)]", "bg-[var(--color-warning)]"];
                      return (
                        <div key={entry.label} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${palette[index % palette.length]}`} />
                            <span className="text-[length:var(--text-sm)] text-[var(--color-text-secondary)]">{entry.label}</span>
                          </div>
                          <span className="text-[length:var(--text-sm)] text-[var(--color-text-primary)] font-semibold">{entry.value}</span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-[var(--color-text-muted)]">No staff members have been added yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
            <div className="card-light !p-6">
              <p className="text-sm font-medium text-[var(--color-text-secondary)]">Branch status</p>
              <p className="mt-2 text-[length:var(--text-2xl)] font-semibold text-[var(--color-text-primary)]">
                {dashboardData.activeBranches}/{dashboardData.branchesTotal}
              </p>
              <p className="text-sm text-[var(--color-text-muted)]">Active branches</p>
            </div>
            <div className="card-light !p-6">
              <p className="text-sm font-medium text-[var(--color-text-secondary)]">Menu stock health</p>
              <p className="mt-2 text-[length:var(--text-2xl)] font-semibold text-[var(--color-text-primary)]">
                {dashboardData.lowStockItems}
              </p>
              <p className="text-sm text-[var(--color-text-muted)]">Items at or below threshold</p>
            </div>
            <div className="card-light !p-6">
              <p className="text-sm font-medium text-[var(--color-text-secondary)]">Staff availability</p>
              <p className="mt-2 text-[length:var(--text-2xl)] font-semibold text-[var(--color-text-primary)]">
                {dashboardData.onLeaveStaff}
              </p>
              <p className="text-sm text-[var(--color-text-muted)]">Staff currently on leave</p>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
