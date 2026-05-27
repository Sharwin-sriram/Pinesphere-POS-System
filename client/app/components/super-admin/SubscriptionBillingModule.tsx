"use client";

import {
  ArrowRight,
  Bell,
  Check,
  ChevronDown,
  CreditCard,
  FileText,
  Gauge,
  Globe,
  Layers3,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";

type BillingCycle = "Monthly" | "Annual";
type SegmentFilter = "All" | "Popular" | "Growth" | "Enterprise";

type Plan = {
  name: string;
  segment: Exclude<SegmentFilter, "All">;
  priceMonthly: number;
  priceAnnual: number;
  trialDays: number;
  automationScore: number;
  locations: number;
  description: string;
  badge: string;
  accent: string;
  usageMetric: string;
  gateway: string;
  features: string[];
  restrictions: string[];
};

const plans: Plan[] = [
  {
    name: "Basic",
    segment: "Popular",
    priceMonthly: 39,
    priceAnnual: 29,
    trialDays: 7,
    automationScore: 42,
    locations: 1,
    description: "Starter stack for independent restaurants launching digital billing fast.",
    badge: "Best for launches",
    accent: "from-amber-100 via-orange-50 to-white",
    usageMetric: "2.5% per online order above 300 orders",
    gateway: "Stripe / Razorpay starter checkout",
    features: ["1 branch included", "Auto-renew billing", "Digital invoices", "Core POS reports"],
    restrictions: ["No custom roles", "Advanced analytics locked"],
  },
  {
    name: "Standard",
    segment: "Growth",
    priceMonthly: 89,
    priceAnnual: 69,
    trialDays: 14,
    automationScore: 64,
    locations: 3,
    description: "Balanced SaaS plan for growing brands that need trials, billing and controls.",
    badge: "Most adopted",
    accent: "from-sky-100 via-cyan-50 to-white",
    usageMetric: "1.9% per order above 1,000 orders",
    gateway: "Stripe / Razorpay / PayPal",
    features: ["3 branches included", "Usage-based billing", "Invoice exports", "Role-based access"],
    restrictions: ["Priority support unavailable"],
  },
  {
    name: "Premium",
    segment: "Growth",
    priceMonthly: 169,
    priceAnnual: 139,
    trialDays: 21,
    automationScore: 82,
    locations: 10,
    description: "Advanced revenue operations with automation, compliance and deeper insights.",
    badge: "Recommended",
    accent: "from-violet-100 via-fuchsia-50 to-white",
    usageMetric: "1.2% per order above 4,000 orders",
    gateway: "All gateways + saved mandates",
    features: ["10 branches included", "Smart renewals", "Revenue analytics", "API access"],
    restrictions: ["Dedicated CSM unavailable"],
  },
  {
    name: "Enterprise",
    segment: "Enterprise",
    priceMonthly: 329,
    priceAnnual: 279,
    trialDays: 30,
    automationScore: 96,
    locations: 999,
    description: "Enterprise-grade billing with custom invoicing, restrictions and multi-brand control.",
    badge: "Custom contract",
    accent: "from-slate-200 via-slate-100 to-white",
    usageMetric: "Custom committed usage tiers",
    gateway: "Custom gateway orchestration",
    features: ["Unlimited branches", "Contract invoicing", "Advanced restrictions", "Dedicated success manager"],
    restrictions: ["Custom implementation scope"],
  },
];

const invoices = [
  { id: "INV-3091", customer: "Spice Garden Group", amount: "$4,860", status: "Paid", due: "27 May 2026" },
  { id: "INV-3090", customer: "Harvest Kitchen", amount: "$1,290", status: "Due today", due: "27 May 2026" },
  { id: "INV-3088", customer: "Atlas Foods", amount: "$8,420", status: "Auto-renewed", due: "25 May 2026" },
];

const restrictionGroups = [
  { title: "Feature restrictions", description: "Gate premium analytics, automation and API access by plan entitlement." },
  { title: "Trial management", description: "Activate timed onboarding trials with upgrade prompts and conversion nudges." },
  { title: "Invoice generation", description: "Create VAT-ready invoices with downloadable PDFs and payment references." },
  { title: "Payment gateway integration", description: "Route recurring billing through Stripe, Razorpay, PayPal or custom gateways." },
];

export default function SubscriptionBillingModule() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cycle, setCycle] = useState<BillingCycle>("Annual");
  const [segment, setSegment] = useState<SegmentFilter>("All");
  const [minimumAutomation, setMinimumAutomation] = useState(60);

  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const matchesSearch =
        !searchTerm ||
        `${plan.name} ${plan.description} ${plan.features.join(" ")} ${plan.gateway}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesSegment = segment === "All" || plan.segment === segment;
      const matchesAutomation = plan.automationScore >= minimumAutomation;

      return matchesSearch && matchesSegment && matchesAutomation;
    });
  }, [minimumAutomation, searchTerm, segment]);

  return (
    <div className="space-y-8 animate-fade-in-up">
      <section className="card-light !p-4 sm:!p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" strokeWidth={1.8} />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search subscription plans, invoices, or billing features..."
              className="h-14 w-full rounded-[24px] border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-700 placeholder:text-slate-400"
              type="text"
            />
          </div>
          <div className="flex items-center gap-3 self-end lg:self-auto">
            <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition-colors hover:text-slate-900">
              <CreditCard className="h-5 w-5" strokeWidth={1.8} />
            </button>
            <button className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition-colors hover:text-slate-900">
              <Bell className="h-5 w-5" strokeWidth={1.8} />
              <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-amber-400" />
            </button>
            <button className="h-12 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-colors hover:text-slate-900">
              Billing login
            </button>
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

      <section className="card-light space-y-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h2 className="text-4xl font-semibold tracking-tight text-slate-900">Subscription &amp; SaaS billing</h2>
            <p className="mt-2 max-w-2xl text-base text-slate-500">
              Manage subscription plans, trial conversion, renewals, payment collection, invoices and feature access from one revenue console.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[760px]">
            <label className="flex h-14 items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-600">
              <span>{segment}</span>
              <select
                aria-label="Plan filter"
                className="appearance-none bg-transparent pr-6 text-sm font-medium text-slate-900"
                value={segment}
                onChange={(event) => setSegment(event.target.value as SegmentFilter)}
              >
                <option value="All">All</option>
                <option value="Popular">Popular</option>
                <option value="Growth">Growth</option>
                <option value="Enterprise">Enterprise</option>
              </select>
              <ChevronDown className="-ml-5 h-4 w-4 text-slate-400" strokeWidth={1.8} />
            </label>
            <label className="flex h-14 items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-600">
              <span>{cycle}</span>
              <select
                aria-label="Billing cycle"
                className="appearance-none bg-transparent pr-6 text-sm font-medium text-slate-900"
                value={cycle}
                onChange={(event) => setCycle(event.target.value as BillingCycle)}
              >
                <option value="Monthly">Monthly</option>
                <option value="Annual">Annual</option>
              </select>
              <ChevronDown className="-ml-5 h-4 w-4 text-slate-400" strokeWidth={1.8} />
            </label>
            <div className="flex h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4">
              <span className="text-sm text-slate-500">Min automation</span>
              <input
                aria-label="Minimum automation score"
                className="h-2 flex-1 accent-amber-400"
                max={95}
                min={40}
                onChange={(event) => setMinimumAutomation(Number(event.target.value))}
                type="range"
                value={minimumAutomation}
              />
              <span className="min-w-8 text-right text-sm font-semibold text-slate-900">{minimumAutomation}</span>
            </div>
          </div>
        </div>

        <div className="rounded-[22px] border border-slate-100 bg-slate-50 p-4">
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search billing plans, trial rules, or invoice workflows..."
            className="h-14 w-full rounded-[18px] border border-slate-200 bg-white px-5 text-sm text-slate-700 placeholder:text-slate-400"
            type="text"
          />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
        <div className="space-y-6">
          <section className="grid gap-6 md:grid-cols-2">
            {filteredPlans.map((plan) => {
              const planPrice = cycle === "Monthly" ? plan.priceMonthly : plan.priceAnnual;

              return (
                <article
                  key={plan.name}
                  className="overflow-hidden rounded-[28px] border border-slate-200 bg-white"
                >
                  <div className={`border-b border-slate-100 bg-gradient-to-r ${plan.accent} p-6`}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                          {plan.badge}
                        </span>
                        <h3 className="mt-4 text-2xl font-semibold text-slate-900">{plan.name}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-500">{plan.description}</p>
                      </div>
                      <div className="rounded-2xl bg-white px-4 py-3 text-right shadow-sm">
                        <div className="text-3xl font-semibold text-slate-900">${planPrice}</div>
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-500">per month</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5 p-6">
                    <div className="grid grid-cols-3 gap-3 text-center">
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

                    <div className="space-y-3">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-3 rounded-2xl border border-slate-100 px-4 py-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                            <Check className="h-4 w-4" strokeWidth={2} />
                          </span>
                          <span className="text-sm text-slate-600">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                      Usage billing: {plan.usageMetric}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button className="btn-light">
                        Activate {plan.name}
                        <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
                      </button>
                      <button className="btn-secondary-light">View invoices</button>
                    </div>
                  </div>
                </article>
              );
            })}
            {filteredPlans.length === 0 && (
              <article className="card-light md:col-span-2">
                <h3 className="text-xl font-semibold text-slate-900">No plans match the current filters</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Adjust the automation threshold or search terms to surface Basic, Standard, Premium or Enterprise plans.
                </p>
              </article>
            )}
          </section>

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
            <article className="card-light">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">Usage-based billing</h3>
                  <p className="mt-1 text-sm text-slate-500">Meter overages, renew them automatically and attach clear invoice references.</p>
                </div>
                <Gauge className="h-5 w-5 text-amber-500" strokeWidth={1.8} />
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Monthly recurring revenue", value: "$184.6K", tone: "bg-emerald-50 text-emerald-600" },
                  { label: "Trials converting", value: "68%", tone: "bg-sky-50 text-sky-600" },
                  { label: "Renewals on autopay", value: "91%", tone: "bg-violet-50 text-violet-600" },
                ].map((metric) => (
                  <div key={metric.label} className="rounded-2xl border border-slate-100 bg-white p-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${metric.tone}`}>{metric.label}</span>
                    <div className="mt-4 text-3xl font-semibold text-slate-900">{metric.value}</div>
                  </div>
                ))}
              </div>
            </article>

            <article className="card-light">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">Recent invoices</h3>
                  <p className="mt-1 text-sm text-slate-500">Track generated invoices and renewal-linked payments.</p>
                </div>
                <FileText className="h-5 w-5 text-slate-400" strokeWidth={1.8} />
              </div>
              <div className="mt-6 space-y-3">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="rounded-2xl border border-slate-100 bg-white p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{invoice.id}</div>
                        <div className="mt-1 text-sm text-slate-500">{invoice.customer}</div>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{invoice.status}</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-slate-500">Due {invoice.due}</span>
                      <span className="font-semibold text-slate-900">{invoice.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="card-light">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Current subscription</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900">Premium plan live</h3>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">Auto-renew enabled</span>
            </div>
            <div className="mt-6 rounded-[24px] bg-slate-900 p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300">Next invoice</p>
                  <div className="mt-1 text-3xl font-semibold">$2,940</div>
                </div>
                <Wallet className="h-6 w-6 text-amber-300" strokeWidth={1.8} />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-slate-300">
                <div className="rounded-2xl bg-white/10 p-3">
                  <div>Renewal date</div>
                  <div className="mt-2 font-semibold text-white">02 Jun 2026</div>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <div>Gateway</div>
                  <div className="mt-2 font-semibold text-white">Stripe mandate</div>
                </div>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {[
                { icon: RefreshCcw, label: "Auto-renewal", value: "Smart retry after failed charge" },
                { icon: Globe, label: "Payment gateway", value: "Stripe, Razorpay, PayPal supported" },
                { icon: Layers3, label: "Feature access", value: "Premium analytics and API unlocked" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-slate-100 px-4 py-3">
                  <item.icon className="h-4 w-4 text-slate-400" strokeWidth={1.8} />
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{item.label}</div>
                    <div className="text-sm text-slate-500">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card-light">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Module coverage</h3>
                <p className="mt-1 text-sm text-slate-500">Everything requested in the project document is represented here.</p>
              </div>
              <ShieldCheck className="h-5 w-5 text-emerald-500" strokeWidth={1.8} />
            </div>
            <div className="mt-6 space-y-3">
              {restrictionGroups.map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-100 bg-white p-4">
                  <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="card-light">
            <h3 className="text-xl font-semibold text-slate-900">Plan restrictions snapshot</h3>
            <div className="mt-5 space-y-4">
              {plans.map((plan) => (
                <div key={plan.name} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-slate-900">{plan.name}</div>
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{plan.segment}</div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {plan.restrictions.map((restriction) => (
                      <span key={restriction} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500">
                        {restriction}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
