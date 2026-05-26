import { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../layouts/MainLayout";

function InventoryReport() {
  const [report, setReport] = useState({
    total_products: 0,
    total_stock: 0,
    low_stock_products: 0,
    out_of_stock_products: 0,
  });

  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Cards API
    axios
      .get("http://127.0.0.1:8000/api/inventory-report/")
      .then((res) => {
        setReport(res.data);
      })
      .catch((err) => console.log(err));

    // Table API
    axios
      .get("http://127.0.0.1:8000/api/inventory-list/")
      .then((res) => {
        setProducts(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <MainLayout>
      <h1 className="text-5xl font-bold text-slate-800 mb-2">
        Inventory Reports
      </h1>

      <p className="text-slate-500 mb-8">
        Inventory stock and product management overview.
      </p>

      {/* Cards */}

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-gray-500">Total Products</h3>
          <p className="text-4xl font-bold text-blue-600 mt-3">
            {report.total_products}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-gray-500">Total Stock</h3>
          <p className="text-4xl font-bold text-green-600 mt-3">
            {report.total_stock}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-gray-500">Low Stock Products</h3>
          <p className="text-4xl font-bold text-orange-600 mt-3">
            {report.low_stock_products}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-gray-500">Out Of Stock</h3>
          <p className="text-4xl font-bold text-red-600 mt-3">
            {report.out_of_stock_products}
          </p>
        </div>
      </div>

      {/* Inventory Table */}

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="p-4 text-left">Product</th>
              <th className="p-4 text-left">Category</th>
              <th className="p-4 text-left">Stock</th>
              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product, index) => (
              <tr key={index} className="border-b">
                <td className="p-4">{product.product}</td>
                <td className="p-4">{product.category}</td>
                <td className="p-4">{product.stock}</td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full ${
                      product.status === "Available"
                        ? "bg-green-100 text-green-700"
                        : product.status === "Low Stock"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {product.status}
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

export default InventoryReport;