"use client";

import { useMemo, useState } from "react";
import { Bell, ChefHat, CreditCard, FileText, FolderKanban, Plug, Shield, Store, UserCog } from "lucide-react";
import Header from "@/app/components/Header";
import AdminSidebar from "@/app/components/restaurant-admin/AdminSidebar";
import { CartProvider } from "@/app/components/dashboard/CartContext";
import { Toaster } from "react-hot-toast";
import RestaurantProfileSection from "@/components/settings/RestaurantProfileSection";
import RolesPermissionsSection from "@/components/settings/RolesPermissionsSection";
import MenuCategoriesSection from "@/components/settings/MenuCategoriesSection";
import KdsStationsSection from "@/components/settings/KdsStationsSection";
import ShiftManagementSection from "@/components/settings/ShiftManagementSection";
import PaymentTaxSection from "@/components/settings/PaymentTaxSection";
import NotificationsAlertsSection from "@/components/settings/NotificationsAlertsSection";
import SecurityAccessSection from "@/components/settings/SecurityAccessSection";
import IntegrationsSection from "@/components/settings/IntegrationsSection";

const sections = [
  { id: "restaurant", label: "Restaurant Profile", icon: Store },
  { id: "roles", label: "Roles & Permissions", icon: UserCog },
  { id: "categories", label: "Menu Categories", icon: FolderKanban },
  { id: "kds", label: "KDS Stations", icon: ChefHat },
  { id: "shifts", label: "Shift Management", icon: FileText },
  { id: "payment", label: "Payment & Tax", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security & Access", icon: Shield },
  { id: "integrations", label: "Integrations", icon: Plug },
] as const;

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<(typeof sections)[number]["id"]>("restaurant");

  const activeComponent = useMemo(() => {
    switch (activeSection) {
      case "restaurant":
        return <RestaurantProfileSection />;
      case "roles":
        return <RolesPermissionsSection />;
      case "categories":
        return <MenuCategoriesSection />;
      case "kds":
        return <KdsStationsSection />;
      case "shifts":
        return <ShiftManagementSection />;
      case "payment":
        return <PaymentTaxSection />;
      case "notifications":
        return <NotificationsAlertsSection />;
      case "security":
        return <SecurityAccessSection />;
      case "integrations":
        return <IntegrationsSection />;
      default:
        return <RestaurantProfileSection />;
    }
  }, [activeSection]);

  return (
    <CartProvider>
      <div className="flex min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "var(--color-bg-secondary)",
              color: "var(--color-text-primary)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
            },
          }}
        />

        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex min-w-0 flex-1 flex-col lg:ml-72">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
            <aside className="sticky top-24 hidden h-[calc(100vh-7rem)] w-72 shrink-0 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-3 lg:block">
              <div className="mb-3 px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">Settings</p>
                <h1 className="mt-1 text-lg font-semibold text-[var(--color-text-primary)]">Restaurant controls</h1>
              </div>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border-l-4 px-3 py-3 text-left transition-smooth ${
                      activeSection === section.id
                        ? "border-[var(--color-accent)] bg-[var(--color-accent-subtle)] text-[var(--color-accent)]"
                        : "border-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]"
                    }`}
                  >
                    <section.icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                    <span className="text-sm font-medium">{section.label}</span>
                  </button>
                ))}
              </nav>
            </aside>

            <section className="min-w-0 flex-1">{activeComponent}</section>
          </main>
        </div>
      </div>
    </CartProvider>
  );
}
