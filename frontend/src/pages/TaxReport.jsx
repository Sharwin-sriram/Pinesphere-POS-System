import { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../layouts/MainLayout";

function TaxReport() {
  const [report, setReport] = useState({
    total_sales: 0,
    total_tax: 0,
    net_revenue: 0,
  });

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/tax-report/")
      .then((res) => {
        setReport(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <MainLayout>
      <h1 className="text-5xl font-bold text-slate-800 mb-2">
        Tax Report
      </h1>

      <p className="text-slate-500 mb-8">
        Tax calculation and revenue analysis.
      </p>

      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3>Total Sales</h3>
          <p className="text-4xl font-bold text-blue-600 mt-3">
            ₹{report.total_sales}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3>Total Tax</h3>
          <p className="text-4xl font-bold text-red-600 mt-3">
            ₹{report.total_tax}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3>Net Revenue</h3>
          <p className="text-4xl font-bold text-green-600 mt-3">
            ₹{report.net_revenue}
          </p>
        </div>

      </div>
    </MainLayout>
  );
}

export default TaxReport;