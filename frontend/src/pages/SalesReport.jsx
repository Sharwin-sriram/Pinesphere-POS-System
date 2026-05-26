import MainLayout from "../layouts/MainLayout";

function SalesReport() {
  const salesData = [
    {
      id: 1,
      date: "2026-05-01",
      revenue: 25000,
      orders: 120,
      status: "Completed",
    },
    {
      id: 2,
      date: "2026-05-02",
      revenue: 32000,
      orders: 145,
      status: "Completed",
    },
    {
      id: 3,
      date: "2026-05-03",
      revenue: 18000,
      orders: 90,
      status: "Pending",
    },
    {
      id: 4,
      date: "2026-05-04",
      revenue: 40000,
      orders: 180,
      status: "Completed",
    },
  ];

  return (
    <MainLayout>
      <h2 className="text-4xl font-bold text-slate-800 mb-2">
        Sales Reports
      </h2>

      <p className="text-slate-500 mb-8">
        Monitor daily sales and revenue performance.
      </p>

      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <input
          type="text"
          placeholder="Search sales report..."
          className="w-full border border-gray-300 rounded-lg px-4 py-3"
        />
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Revenue</th>
              <th className="p-4 text-left">Orders</th>
              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {salesData.map((sale) => (
              <tr
                key={sale.id}
                className="border-b hover:bg-slate-50"
              >
                <td className="p-4">{sale.date}</td>

                <td className="p-4">
                  ₹{sale.revenue}
                </td>

                <td className="p-4">
                  {sale.orders}
                </td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      sale.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {sale.status}
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

export default SalesReport;