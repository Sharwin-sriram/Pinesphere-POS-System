import { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../layouts/MainLayout";

function ProfitAnalytics() {
  const [report, setReport] = useState({
    total_revenue: 0,
    total_cost: 0,
    total_profit: 0,
  });

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/profit-analytics/")
      .then((res) => {
        setReport(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <MainLayout>
      <h1 className="text-5xl font-bold text-slate-800 mb-2">
        Profit Analytics
      </h1>

      <p className="text-slate-500 mb-8">
        Revenue, Cost and Profit Analysis
      </p>

      <div className="grid md:grid-cols-3 gap-6 mb-8">

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-gray-500">Total Revenue</h3>
          <p className="text-4xl font-bold text-green-600 mt-3">
            ₹{report.total_revenue}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-gray-500">Total Cost</h3>
          <p className="text-4xl font-bold text-red-600 mt-3">
            ₹{report.total_cost}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-gray-500">Total Profit</h3>
          <p className="text-4xl font-bold text-blue-600 mt-3">
            ₹{report.total_profit}
          </p>
        </div>

      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="p-4 text-left">Metric</th>
              <th className="p-4 text-left">Amount</th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-b">
              <td className="p-4">Revenue</td>
              <td className="p-4">₹{report.total_revenue}</td>
            </tr>

            <tr className="border-b">
              <td className="p-4">Cost</td>
              <td className="p-4">₹{report.total_cost}</td>
            </tr>

            <tr>
              <td className="p-4">Profit</td>
              <td className="p-4">₹{report.total_profit}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}

export default ProfitAnalytics;