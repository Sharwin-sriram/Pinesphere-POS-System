import Image from 'next/image'
import Link from 'next/link'

const modules = [
  {
    href: '/onboarding/dashboard',
    eyebrow: 'Onboarding',
    title: 'Launch restaurants with a polished setup flow',
    description: 'Manage branches, staff, documents, and payment readiness with the same premium dark SaaS language used across the product.',
    image: '/images/dashboard/lounge-flow.jpg',
  },
  {
    href: '/menu',
    eyebrow: 'Menu Management',
    title: 'Run the menu workspace with stable local visuals',
    description: 'Explore analytics, categories, items, combos, modifiers, and pricing with polished modals, loaders, filters, and fallback-safe imagery.',
    image: '/images/dashboard/revenue-command.jpg',
  },
]

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-6xl space-y-8">
        <section className="overflow-hidden rounded-[40px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.18),_transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,6,23,0.96))] p-6 shadow-[0_32px_120px_-44px_rgba(15,23,42,0.85)] sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-violet-300">PineSphere POS</p>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Premium restaurant operations, ready for demos and daily use.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
                Continue into onboarding or jump straight into menu management. Both flows now share the same dark enterprise presentation, stable local image system, and production-ready polish.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/onboarding/dashboard"
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-purple-600 px-5 py-3 font-semibold text-white shadow-[0_24px_80px_-36px_rgba(147,51,234,0.85)] transition hover:-translate-y-0.5 hover:shadow-[0_28px_90px_-40px_rgba(147,51,234,0.75)]"
                >
                  Open onboarding
                </Link>
                <Link
                  href="/menu"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/15"
                >
                  Open menu workspace
                </Link>
              </div>
            </div>

            <div className="relative h-[280px] overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/80 sm:h-[340px]">
              <Image
                src="/images/dashboard/service-metrics.jpg"
                alt="PineSphere POS operations preview"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 420px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.2),_transparent_32%),linear-gradient(180deg,rgba(2,6,23,0.04),rgba(2,6,23,0.58))]" />
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          {modules.map((module) => (
            <Link
              key={module.href}
              href={module.href}
              className="group overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/90 shadow-[0_28px_80px_-40px_rgba(15,23,42,0.8)] transition hover:-translate-y-1 hover:border-violet-300/20"
            >
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={module.image}
                  alt={module.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              </div>
              <div className="space-y-3 p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-violet-300">{module.eyebrow}</p>
                <h2 className="text-2xl font-semibold text-white">{module.title}</h2>
                <p className="text-sm leading-7 text-slate-400">{module.description}</p>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  )
}
