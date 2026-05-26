import { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../layouts/MainLayout";

function DiscountReport() {
  const [report, setReport] = useState({
    total_discount: 0,
    discounted_orders: 0,
    average_discount: 0,
  });

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/discount-report/")
      .then((res) => {
        setReport(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <MainLayout>
      <h1 className="text-5xl font-bold text-slate-800 mb-2">
        Discount Report
      </h1>

      <p className="text-slate-500 mb-8">
        Discount usage and offer performance analysis.
      </p>

      {/* Cards */}

      <div className="grid md:grid-cols-3 gap-6 mb-8">

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-gray-500">Total Discount</h3>
          <p className="text-4xl font-bold text-red-600 mt-3">
            ₹{report.total_discount}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-gray-500">Discounted Orders</h3>
          <p className="text-4xl font-bold text-blue-600 mt-3">
            {report.discounted_orders}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-gray-500">Average Discount</h3>
          <p className="text-4xl font-bold text-green-600 mt-3">
            ₹{report.average_discount}
          </p>
        </div>

      </div>

      {/* Large Table */}

      <div className="bg-white rounded-xl shadow-md overflow-hidden">

        <table className="w-full">

          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="p-4 text-left">Offer Name</th>
              <th className="p-4 text-left">Discount Amount</th>
              <th className="p-4 text-left">Orders Used</th>
              <th className="p-4 text-left">Customers</th>
              <th className="p-4 text-left">Start Date</th>
              <th className="p-4 text-left">End Date</th>
              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>

          <tbody>

            <tr className="border-b">
              <td className="p-4">Summer Sale</td>
              <td className="p-4">₹1000</td>
              <td className="p-4">25</td>
              <td className="p-4">20</td>
              <td className="p-4">01-05-2026</td>
              <td className="p-4">31-05-2026</td>
              <td className="p-4">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                  Active
                </span>
              </td>
            </tr>

            <tr className="border-b">
              <td className="p-4">Festival Offer</td>
              <td className="p-4">₹1500</td>
              <td className="p-4">18</td>
              <td className="p-4">15</td>
              <td className="p-4">10-05-2026</td>
              <td className="p-4">20-05-2026</td>
              <td className="p-4">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                  Running
                </span>
              </td>
            </tr>

            <tr className="border-b">
              <td className="p-4">New Customer Offer</td>
              <td className="p-4">₹500</td>
              <td className="p-4">30</td>
              <td className="p-4">30</td>
              <td className="p-4">01-04-2026</td>
              <td className="p-4">30-04-2026</td>
              <td className="p-4">
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                  Completed
                </span>
              </td>
            </tr>

            <tr className="border-b">
              <td className="p-4">Weekend Deal</td>
              <td className="p-4">₹750</td>
              <td className="p-4">12</td>
              <td className="p-4">10</td>
              <td className="p-4">15-05-2026</td>
              <td className="p-4">18-05-2026</td>
              <td className="p-4">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                  Active
                </span>
              </td>
            </tr>

            <tr>
              <td className="p-4">Mega Discount</td>
              <td className="p-4">₹2000</td>
              <td className="p-4">40</td>
              <td className="p-4">35</td>
              <td className="p-4">01-06-2026</td>
              <td className="p-4">30-06-2026</td>
              <td className="p-4">
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                  Upcoming
                </span>
              </td>
            </tr>

          </tbody>

        </table>

      </div>

    </MainLayout>
  );
}

export default DiscountReport;