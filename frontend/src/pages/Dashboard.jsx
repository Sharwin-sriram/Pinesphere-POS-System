import { useEffect, useState } from "react";
import axios from "axios";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import RevenueChart from "../components/RevenueChart";
import StatCard from "../components/StatCard";

function Dashboard() {
  const [report, setReport] = useState({
    total_sales: 0,
    total_orders: 0,
  });

  const [customerData, setCustomerData] = useState({
    total_customers: 0,
  });

  const [profitData, setProfitData] = useState({
    total_profit: 0,
  });

  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/monthly-report/")
      .then((response) => {
        setReport(response.data);
      })
      .catch((error) => console.error(error));

    axios
      .get("http://127.0.0.1:8000/api/customer-analytics/")
      .then((response) => {
        setCustomerData(response.data);
      })
      .catch((error) => console.error(error));

    axios
      .get("http://127.0.0.1:8000/api/profit-analytics/")
      .then((response) => {
        setProfitData(response.data);
      })
      .catch((error) => console.error(error));

    axios
      .get("http://127.0.0.1:8000/api/chart-data/")
      .then((response) => {
        const labels = response.data.labels || [];
        const sales = response.data.sales || [];

        const formatted = labels.map((label, index) => ({
          month: label,
          reservations: sales[index],
        }));

        setChartData(formatted);
      })
      .catch((error) => console.error(error));
  }, []);

  return (
    <div className="flex bg-slate-100 min-h-screen">
      <Sidebar />

      <div className="ml-72 flex-1">
        <Navbar />

        <div className="p-8">

          <div>
            <h2 className="text-4xl font-bold text-slate-800">
              Analytics Dashboard
            </h2>

            <p className="text-gray-500 mt-2">
              Business Intelligence & Reporting Overview
            </p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">

            <StatCard
              title="Revenue Report"
              value={`₹${report.total_sales}`}
              color="border-green-500"
            />

            <StatCard
              title="Order Analytics"
              value={report.total_orders}
              color="border-blue-500"
            />

            <StatCard
              title="Customer Insights"
              value={customerData.total_customers}
              color="border-purple-500"
            />

            <StatCard
              title="Profit Analytics"
              value={`₹${profitData.total_profit}`}
              color="border-orange-500"
            />

          </div>

          {/* Chart */}
          <div className="mt-8">
            <RevenueChart data={chartData} />
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;