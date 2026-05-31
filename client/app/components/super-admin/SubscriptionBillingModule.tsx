"use client";

import { ArrowRight, Sparkles, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
    accent: "from-amber-100 via-orange-50 to-white",
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
    accent: "from-sky-100 via-cyan-50 to-white",
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
    accent: "from-violet-100 via-fuchsia-50 to-white",
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
    accent: "from-slate-200 via-slate-100 to-white",
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

export default function SubscriptionBillingModule() {
  const router = useRouter();
  const [activePlanName, setActivePlanName] = useState(plans[2].name);

  useEffect(() => {
    const readStoredPlan = () => {
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
          setActivePlanName(parsedPlan.planName);
        }
      } catch {
        setActivePlanName(plans[2].name);
      }
    };

    readStoredPlan();

    const handleStorageChange = () => readStoredPlan();
    window.addEventListener("storage", handleStorageChange);

    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const activePlan = getPlanByName(activePlanName);

  return (
    <div className="space-y-8 animate-fade-in-up">
      <section className="card-light">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Current subscription</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">{activePlan.name} plan live</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">Payment active</span>
            <div className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              {activePlan.description}
            </div>
          </div>
        </div>

        <div className={`mt-6 rounded-[24px] bg-gradient-to-r ${activePlan.accent} p-5 text-slate-900`}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-600">Next invoice</p>
              <div className="mt-1 text-3xl font-semibold">₹{activePlan.priceMonthly}</div>
            </div>
            <Wallet className="h-6 w-6 text-slate-700" strokeWidth={1.8} />
          </div>
          <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/70 p-3">
              <div>Renewal date</div>
              <div className="mt-2 font-semibold text-slate-900">02 Jun 2026</div>
            </div>
            <div className="rounded-2xl bg-white/70 p-3">
              <div>Gateway</div>
              <div className="mt-2 font-semibold text-slate-900">Stripe mandate</div>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-r from-amber-50 via-orange-50 to-sky-50 p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-amber-500 shadow-sm">
              <Sparkles className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">50% off first-cycle billing for new restaurant trials</p>
              <p className="text-sm text-slate-500">Launch Basic to Enterprise plans with auto-renew and usage billing enabled.</p>
            </div>
          </div>
          <span className="inline-flex w-fit rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-500">Limited time</span>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white"
          >
            <div className={`border-b border-slate-100 bg-gradient-to-r ${plan.accent} p-4 sm:p-5`}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    {activePlan.name === plan.name ? "Current plan" : plan.badge}
                  </span>
                  <h3 className="mt-3 text-xl font-semibold text-slate-900">{plan.name}</h3>
                  <p
                    className="mt-2 text-sm leading-6 text-slate-500"
                    style={{
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      WebkitLineClamp: 3,
                      overflow: "hidden",
                    }}
                  >
                    {plan.description}
                  </p>
                </div>
                <div className="text-left sm:text-right self-center">
                  <div className="text-2xl font-semibold text-slate-900">₹{plan.priceMonthly}</div>
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">per month</div>
                </div>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
              <div className="grid grid-cols-1 gap-2 text-center sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Trial</div>
                  <div className="mt-2 text-lg font-semibold text-slate-900">{plan.trialDays} days</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Branches</div>
                  <div className="mt-2 text-lg font-semibold text-slate-900">{plan.locations === 999 ? "∞" : plan.locations}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Score</div>
                  <div className="mt-2 text-lg font-semibold text-slate-900">{plan.automationScore}</div>
                </div>
              </div>

              <div className="mt-auto flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  className="btn-light w-full sm:w-auto"
                  onClick={() => router.push(`/billing?plan=${encodeURIComponent(plan.name)}`)}
                >
                  {activePlan.name === plan.name ? "Manage billing" : "Activate"}
                  <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
                </button>
                <button
                  type="button"
                  className="btn-secondary-light w-full sm:w-auto"
                  onClick={() => router.push(`/billing?plan=${encodeURIComponent(plan.name)}`)}
                >
                  invoices
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}