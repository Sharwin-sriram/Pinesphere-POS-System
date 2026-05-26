import {
  FaChartLine,
  FaFileInvoiceDollar,
  FaUsers,
  FaBoxes,
  FaUserTie,
  FaFileExport,
  FaMoneyBillWave,
  FaClipboardList,
  FaReceipt,
  FaPercent,
} from "react-icons/fa";

import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();

  const menuClass = (path) =>
    `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition duration-300 ${
      location.pathname === path
        ? "bg-cyan-600 text-white"
        : "hover:bg-cyan-600 text-gray-200"
    }`;

  return (
    <div className="w-72 h-screen bg-slate-900 text-white fixed left-0 top-0 shadow-2xl overflow-y-auto">

      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-3xl font-bold text-cyan-400">
          Analytics Pro
        </h1>

        <p className="text-sm text-slate-400 mt-2">
          Reporting Dashboard
        </p>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-4 space-y-2">

        <Link
          to="/analytics"
          className={menuClass("/analytics")}
        >
          <FaChartLine size={18} />
          <span>Analytics</span>
        </Link>

        <Link
          to="/"
          className={menuClass("/")}
        >
          <FaChartLine size={18} />
          <span>Dashboard</span>
        </Link>

        <Link
          to="/sales-report"
          className={menuClass("/sales-report")}
        >
          <FaFileInvoiceDollar size={18} />
          <span>Sales Reports</span>
        </Link>

        <Link
          to="/customer-report"
          className={menuClass("/customer-report")}
        >
          <FaUsers size={18} />
          <span>Customer Reports</span>
        </Link>

        <Link
          to="/inventory-report"
          className={menuClass("/inventory-report")}
        >
          <FaBoxes size={18} />
          <span>Inventory Reports</span>
        </Link>

        <Link
          to="/employee-report"
          className={menuClass("/employee-report")}
        >
          <FaUserTie size={18} />
          <span>Employee Reports</span>
        </Link>

        <Link
          to="/profit-analytics"
          className={menuClass("/profit-analytics")}
        >
          <FaMoneyBillWave size={18} />
          <span>Profit Analytics</span>
        </Link>

        <Link
          to="/order-report"
          className={menuClass("/order-report")}
        >
          <FaClipboardList size={18} />
          <span>Order Report</span>
        </Link>

        <Link
          to="/tax-report"
          className={menuClass("/tax-report")}
        >
          <FaReceipt size={18} />
          <span>Tax Report</span>
        </Link>

        <Link
          to="/discount-report"
          className={menuClass("/discount-report")}
        >
          <FaPercent size={18} />
          <span>Discount Report</span>
        </Link>

        <Link
          to="/export-report"
          className={menuClass("/export-report")}
        >
          <FaFileExport size={18} />
          <span>Export Reports</span>
        </Link>

      </nav>

    </div>
  );
}

export default Sidebar;