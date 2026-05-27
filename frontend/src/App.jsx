import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import SalesReport from "./pages/SalesReport";
import CustomerReport from "./pages/CustomerReport";
import InventoryReport from "./pages/InventoryReport";
import EmployeeReport from "./pages/EmployeeReport";
import ExportReport from "./pages/ExportReport";
import Analytics from "./pages/Analytics";
import ProfitAnalytics from "./pages/ProfitAnalytics";
import OrderReport from "./pages/OrderReport";
import TaxReport from "./pages/TaxReport";
import DiscountReport from "./pages/DiscountReport";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />

        <Route path="/" element={<Analytics />} />

        <Route
          path="/sales-report"
          element={<SalesReport />}
        />

        <Route
          path="/customer-report"
          element={<CustomerReport />}
        />

        <Route
          path="/inventory-report"
          element={<InventoryReport />}
        />

        <Route
          path="/employee-report"
          element={<EmployeeReport />}
        />

        <Route
          path="/export-report"
          element={<ExportReport />}
        />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/profit-analytics" element={<ProfitAnalytics />} />
        <Route path="/order-report" element={<OrderReport />} />
        <Route path="/tax-report" element={<TaxReport />} />
        <Route path="/discount-report" element={<DiscountReport />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;