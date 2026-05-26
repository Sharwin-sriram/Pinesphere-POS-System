import { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../layouts/MainLayout";

function OrderReport() {
  const [report, setReport] = useState({
    total_orders: 0,
    completed_orders: 0,
    pending_orders: 0,
    cancelled_orders: 0,
  });

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/order-report/")
      .then((res) => {
        setReport(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <MainLayout>
      <h1 className="text-5xl font-bold text-slate-800 mb-2">
        Order Report
      </h1>

      <p className="text-slate-500 mb-8">
        Order tracking and performance analysis.
      </p>

      <div className="grid md:grid-cols-4 gap-6">

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3>Total Orders</h3>
          <p className="text-4xl font-bold text-blue-600 mt-3">
            {report.total_orders}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3>Completed</h3>
          <p className="text-4xl font-bold text-green-600 mt-3">
            {report.completed_orders}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3>Pending</h3>
          <p className="text-4xl font-bold text-orange-600 mt-3">
            {report.pending_orders}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3>Cancelled</h3>
          <p className="text-4xl font-bold text-red-600 mt-3">
            {report.cancelled_orders}
          </p>
        </div>

      </div>
    </MainLayout>
  );
}

export default OrderReport;