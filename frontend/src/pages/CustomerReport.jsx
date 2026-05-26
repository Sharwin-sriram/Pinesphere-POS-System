import { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../layouts/MainLayout";

function CustomerReport() {
  const [report, setReport] = useState({
    total_customers: 0,
    total_orders: 0,
    total_spent: 0,
    top_customer: "",
  });

  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/customer-report/")
      .then((res) => {
        setReport(res.data);
      })
      .catch((err) => console.log(err));

    axios
      .get("http://127.0.0.1:8000/api/customer-list/")
      .then((res) => {
        setCustomers(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <MainLayout>
      <h1 className="text-5xl font-bold text-slate-800 mb-2">
        Customer Reports
      </h1>

      <p className="text-slate-500 mb-8">
        Customer analytics and spending insights.
      </p>

      {/* Cards */}

      <div className="grid md:grid-cols-4 gap-6 mb-8">

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-gray-500">Total Customers</h3>
          <p className="text-4xl font-bold text-blue-600 mt-3">
            {report.total_customers}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-gray-500">Total Orders</h3>
          <p className="text-4xl font-bold text-green-600 mt-3">
            {report.total_orders}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-gray-500">Total Spent</h3>
          <p className="text-4xl font-bold text-purple-600 mt-3">
            ₹{report.total_spent}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-gray-500">Top Customer</h3>
          <p className="text-2xl font-bold text-orange-600 mt-3">
            {report.top_customer}
          </p>
        </div>

      </div>

      {/* Customer Table */}

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">

          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="p-4 text-left">Customer</th>
              <th className="p-4 text-left">Orders</th>
              <th className="p-4 text-left">Spent</th>
              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>

          <tbody>

            {customers.map((customer, index) => (
              <tr key={index} className="border-b">

                <td className="p-4">
                  {customer.name}
                </td>

                <td className="p-4">
                  {customer.orders}
                </td>

                <td className="p-4">
                  ₹{customer.spent}
                </td>

                <td className="p-4">

                  <span
                    className={`px-3 py-1 rounded-full ${
                      customer.status === "Premium"
                        ? "bg-green-100 text-green-700"
                        : customer.status === "Active"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {customer.status}
                  </span>

                </td>

              </tr>
            ))}

          </tbody>

        </table>
      </div>
    </MainLayout>
  );
}

export default CustomerReport;