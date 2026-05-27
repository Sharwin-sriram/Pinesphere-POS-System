import { Bell, Search, UserCircle } from "lucide-react";

function Navbar() {
  return (
    <div
      className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-primary)] px-8 py-4"
      style={{ zIndex: "var(--z-sticky)" }}
    >
      <div>
        <h1 className="text-[length:var(--text-2xl)] font-semibold tracking-tight text-[var(--color-text-primary)]">
          Analytics dashboard
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          Business intelligence and reporting
        </p>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]"
            strokeWidth={1.5}
          />
          <input
            type="text"
            placeholder="e.g. March sales summary"
            className="h-10 w-64 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] pl-10 pr-4 text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] focus:outline-none"
          />
        </div>

        <button type="button" className="relative text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
          <Bell size={20} strokeWidth={1.5} />
          <span className="absolute -right-2 -top-2 rounded-sm bg-[var(--color-danger)] px-1 text-[10px] text-[var(--color-text-primary)]">
            3
          </span>
        </button>

        <UserCircle size={24} strokeWidth={1.5} className="text-[var(--color-text-secondary)]" />
      </div>
    </div>
  );
}

export default Navbar;
