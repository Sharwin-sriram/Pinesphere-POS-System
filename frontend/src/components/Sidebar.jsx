import {
  LineChart,
  LayoutDashboard,
  FileText,
  Users,
  Package,
  UserCircle,
  FileOutput,
  TrendingUp,
  ClipboardList,
  Receipt,
  Percent,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();

  const menuClass = (path) =>
    `flex w-full items-center gap-3 rounded-md px-4 py-2 text-[length:var(--text-base)] font-medium transition duration-150 ${
      location.pathname === path
        ? "bg-[var(--color-bg-tertiary)] font-semibold text-[var(--color-text-primary)]"
        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]"
    }`;

  const iconProps = { size: 16, strokeWidth: 1.5 };

  return (
    <div
      className="fixed left-0 top-0 h-screen w-60 overflow-y-auto border-r border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
      style={{ zIndex: "var(--z-sticky)" }}
    >
      <div className="border-b border-[var(--color-border)] p-6">
        <h1 className="text-[length:var(--text-2xl)] font-semibold tracking-tight text-[var(--color-text-primary)]">
          Analytics Pro
        </h1>
        <p className="mt-2 text-[length:var(--text-sm)] text-[var(--color-text-secondary)]">
          Reporting dashboard
        </p>
      </div>

      <nav className="mt-6 space-y-1 px-3">
        <Link to="/analytics" className={menuClass("/analytics")}>
          <LineChart {...iconProps} />
          <span>Analytics</span>
        </Link>
        <Link to="/" className={menuClass("/")}>
          <LayoutDashboard {...iconProps} />
          <span>Dashboard</span>
        </Link>
        <Link to="/sales-report" className={menuClass("/sales-report")}>
          <FileText {...iconProps} />
          <span>Sales reports</span>
        </Link>
        <Link to="/customer-report" className={menuClass("/customer-report")}>
          <Users {...iconProps} />
          <span>Customer reports</span>
        </Link>
        <Link to="/inventory-report" className={menuClass("/inventory-report")}>
          <Package {...iconProps} />
          <span>Inventory reports</span>
        </Link>
        <Link to="/employee-report" className={menuClass("/employee-report")}>
          <UserCircle {...iconProps} />
          <span>Employee reports</span>
        </Link>
        <Link to="/profit-analytics" className={menuClass("/profit-analytics")}>
          <TrendingUp {...iconProps} />
          <span>Profit analytics</span>
        </Link>
        <Link to="/order-report" className={menuClass("/order-report")}>
          <ClipboardList {...iconProps} />
          <span>Order report</span>
        </Link>
        <Link to="/tax-report" className={menuClass("/tax-report")}>
          <Receipt {...iconProps} />
          <span>Tax report</span>
        </Link>
        <Link to="/discount-report" className={menuClass("/discount-report")}>
          <Percent {...iconProps} />
          <span>Discount report</span>
        </Link>
        <Link to="/export-report" className={menuClass("/export-report")}>
          <FileOutput {...iconProps} />
          <span>Export reports</span>
        </Link>
      </nav>
    </div>
  );
}

export default Sidebar;
