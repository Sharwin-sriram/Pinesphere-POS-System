"use client";

import { CheckCircle2, CreditCard, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../components/Header";
import AdminSidebar from "../components/restaurant-admin/AdminSidebar";
import { CartProvider } from "../components/dashboard/CartContext";
import { Toaster } from "react-hot-toast";

type Plan = {
  name: string;
  priceMonthly: number;
  trialDays: number;
  automationScore: number;
  locations: number;
  description: string;
  badge: string;
  accent: string;
  features: string[];
};

const plans: Plan[] = [
  {
    name: "Basic",
    priceMonthly: 39,
    trialDays: 7,
    automationScore: 42,
    locations: 1,
    description: "Starter stack for independent restaurants launching digital billing fast.",
    badge: "Best for launches",
    accent: "from-amber-100/50 via-orange-50/30 to-white",
    features: ["1 branch included", "Auto-renew billing", "Digital invoices", "Core POS reports"],
  },
  {
    name: "Standard",
    priceMonthly: 89,
    trialDays: 14,
    automationScore: 64,
    locations: 3,
    description: "Balanced SaaS plan for growing brands that need trials, billing and controls.",
    badge: "Most adopted",
    accent: "from-sky-100/50 via-cyan-50/30 to-white",
    features: ["3 branches included", "Usage-based billing", "Invoice exports", "Role-based access"],
  },
  {
    name: "Premium",
    priceMonthly: 169,
    trialDays: 21,
    automationScore: 82,
    locations: 10,
    description: "Advanced revenue operations with automation, compliance and deeper insights.",
    badge: "Recommended",
    accent: "from-violet-100/50 via-fuchsia-50/30 to-white",
    features: ["10 branches included", "Smart renewals", "Revenue analytics", "API access"],
  },
  {
    name: "Enterprise",
    priceMonthly: 329,
    trialDays: 30,
    automationScore: 96,
    locations: 999,
    description: "Enterprise-grade billing with custom invoicing, restrictions and multi-brand control.",
    badge: "Custom contract",
    accent: "from-slate-200/50 via-slate-100/30 to-white",
    features: ["Unlimited branches", "Contract invoicing", "Advanced restrictions", "Dedicated success manager"],
  },
];

const SUBSCRIPTION_STORAGE_KEY = "pos_subscription_plan";

type SubscriptionState = {
  planName: string;
  purchasedAt: string;
};

function getPlanByName(planName: string | null | undefined) {
  return plans.find((plan) => plan.name === planName) ?? plans[2];
}

export default function BillingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentPlanName, setCurrentPlanName] = useState(plans[2].name);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const rawPlan = window.localStorage.getItem(SUBSCRIPTION_STORAGE_KEY);

    if (!rawPlan) {
      return;
    }

    try {
      const parsedPlan = JSON.parse(rawPlan) as SubscriptionState;
      if (parsedPlan?.planName) {
        setCurrentPlanName(parsedPlan.planName);
      }
    } catch {
      setCurrentPlanName(plans[2].name);
    }
  }, []);

  const selectedPlan = useMemo(() => {
    const planFromQuery = searchParams.get("plan");
    return getPlanByName(planFromQuery ?? currentPlanName);
  }, [currentPlanName, searchParams]);

  const activePlan = getPlanByName(currentPlanName);

  const activatePlan = () => {
    if (typeof window === "undefined") {
      return;
    }

    const payload: SubscriptionState = {
      planName: selectedPlan.name,
      purchasedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(payload));
    setCurrentPlanName(selectedPlan.name);
    router.push("/restaurant-admin");
  };

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
          
          <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[1.15fr_0.85fr]">
              <section className="rounded-ds-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)]">Billing checkout</p>
                    <h1 className="mt-3 text-3xl font-semibold text-[var(--color-text-primary)] sm:text-4xl">Complete your subscription payment</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
                      Pick a plan, confirm the charge, and the restaurant admin subscription card will update automatically
                      after purchase.
                    </p>
                  </div>
                  <div className="hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-4 py-3 text-right text-[var(--color-text-primary)] md:block">
                    <div className="text-xs uppercase tracking-[0.22em] text-[var(--color-text-muted)]">Current active</div>
                    <div className="mt-2 text-lg font-semibold text-[var(--color-accent-green)]">{activePlan.name}</div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {plans.map((plan) => {
                    const isSelected = plan.name === selectedPlan.name;
                    return (
                      <button
                        key={plan.name}
                        type="button"
                        onClick={() => router.push(`/billing?plan=${encodeURIComponent(plan.name)}`)}
                        className={`rounded-ds-lg border p-4 text-left transition-smooth ${
                          isSelected
                            ? "border-[var(--color-accent-green)] bg-[var(--color-accent-green-subtle)] text-[var(--color-text-primary)] shadow-sm"
                            : "border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] hover:-translate-y-0.5 hover:border-[var(--color-border-hover)]"
                        }`}
                      >
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                            isSelected 
                              ? "bg-[var(--color-accent-green)] text-white" 
                              : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]"
                          }`}
                        >
                          {plan.badge}
                        </span>
                        <div className="mt-4 text-base font-semibold">{plan.name}</div>
                        <div className="mt-1 text-2xl font-bold text-[var(--color-text-primary)]">
                          ₹{plan.priceMonthly}
                        </div>
                        <div className="mt-1 text-[11px] text-[var(--color-text-secondary)]">per month</div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
                  <div className={`rounded-ds-lg border border-[var(--color-border)] bg-gradient-to-r ${selectedPlan.accent} p-5`}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-bg-secondary)] text-[var(--color-accent)] shadow-sm border border-[var(--color-border)]/50">
                        <Sparkles className="h-5 w-5" strokeWidth={1.8} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">Selected plan</p>
                        <h2 className="mt-1 text-2xl font-semibold text-[var(--color-text-primary)]">{selectedPlan.name}</h2>
                      </div>
                    </div>

                    <p className="mt-4 text-sm leading-relaxed text-[var(--color-text-secondary)]">{selectedPlan.description}</p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-[var(--color-bg-secondary)]/80 border border-[var(--color-border)]/50 p-4">
                        <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-muted)]">Trial</div>
                        <div className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">{selectedPlan.trialDays} days</div>
                      </div>
                      <div className="rounded-2xl bg-[var(--color-bg-secondary)]/80 border border-[var(--color-border)]/50 p-4">
                        <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-muted)]">Branches</div>
                        <div className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">
                          {selectedPlan.locations === 999 ? "Unlimited" : selectedPlan.locations}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-ds-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-accent-green-subtle)] text-[var(--color-accent-green)] border border-[var(--color-accent-green)]/10">
                        <CreditCard className="h-5 w-5" strokeWidth={1.8} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">Payment summary</p>
                        <h2 className="mt-1 text-2xl font-semibold text-[var(--color-text-primary)]">₹{selectedPlan.priceMonthly} monthly</h2>
                      </div>
                    </div>

                    <div className="mt-5 space-y-3 text-sm text-[var(--color-text-secondary)]">
                      {selectedPlan.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-3 rounded-2xl bg-[var(--color-bg-tertiary)] px-4 py-3 border border-[var(--color-border)]/30">
                          <CheckCircle2 className="h-4 w-4 text-[var(--color-accent-green)]" strokeWidth={2} />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] p-4 text-sm text-[var(--color-text-secondary)]">
                      <div className="flex items-center gap-2 font-semibold text-[var(--color-text-primary)]">
                        <ShieldCheck className="h-4 w-4 text-[var(--color-text-secondary)]" strokeWidth={2} />
                        Secure local checkout
                      </div>
                      <p className="mt-2 leading-relaxed text-[var(--color-text-muted)]">
                        This demo checkout stores the selected plan locally so the restaurant admin subscription state can
                        update immediately after purchase.
                      </p>
                    </div>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <button 
                        type="button" 
                        className="inline-flex items-center justify-center gap-2 bg-[var(--color-accent-green)] text-white hover:bg-[var(--color-accent-green-hover)] transition-smooth py-2 px-5 h-10 rounded-md font-semibold text-sm w-full sm:w-auto" 
                        onClick={activatePlan}
                      >
                        Pay and activate
                        <CheckCircle2 className="h-4 w-4" strokeWidth={1.8} />
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 bg-transparent text-[var(--color-text-primary)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-bg-tertiary)] transition-smooth py-2 px-5 h-10 rounded-md font-medium text-sm w-full sm:w-auto"
                        onClick={() => router.push("/restaurant-admin")}
                      >
                        Back to plans
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <aside className="rounded-ds-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6 shadow-sm flex flex-col gap-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">Checkout state</p>
                  <div className="mt-3 text-2xl font-semibold text-[var(--color-text-primary)]">{activePlan.name} active</div>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                    Once you confirm the payment, the subscription module on the restaurant admin page will reflect the new
                    plan automatically.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-muted)]">Selected plan</div>
                    <div className="mt-2 text-base font-semibold text-[var(--color-text-primary)]">{selectedPlan.name}</div>
                  </div>
                  <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-muted)]">Amount due</div>
                    <div className="mt-2 text-base font-semibold text-[var(--color-text-primary)]">₹{selectedPlan.priceMonthly}</div>
                  </div>
                  <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-muted)]">Payment note</div>
                    <div className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">The checkout is wired for local plan persistence.</div>
                  </div>
                </div>
              </aside>
            </div>
          </main>
        </div>
      </div>
    </CartProvider>
  );
}