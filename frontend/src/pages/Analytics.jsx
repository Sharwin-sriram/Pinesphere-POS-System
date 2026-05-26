import MainLayout from "../layouts/MainLayout";
import RevenueChart from "../components/RevenueChart";

function Analytics() {
    const chartData = [
  { month: "Jan", sales: 2000 },
  { month: "Feb", sales: 3500 },
  { month: "Mar", sales: 2800 },
  { month: "Apr", sales: 4200 },
  { month: "May", sales: 5100 },
  { month: "Jun", sales: 4700 },
  { month: "Jul", sales: 5600 },
  { month: "Aug", sales: 4900 },
  { month: "Sep", sales: 6200 },
  { month: "Oct", sales: 5400 },
  { month: "Nov", sales: 6800 },
  { month: "Dec", sales: 7500 },
];
  return (
    <MainLayout>

      <h1 className="text-5xl font-bold text-slate-800 mb-2">
        Analytics Dashboard
      </h1>

      <p className="text-slate-500 mb-8">
        Business Intelligence & Reporting System Overview
      </p>

      {/* Analytics Cards */}

      <div className="grid md:grid-cols-4 gap-6 mb-8">

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-gray-500">Total Revenue</h3>
          <p className="text-4xl font-bold text-green-600 mt-3">
            ₹160000
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-gray-500">Total Profit</h3>
          <p className="text-4xl font-bold text-blue-600 mt-3">
            ₹75000
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-gray-500">Total Orders</h3>
          <p className="text-4xl font-bold text-orange-600 mt-3">
            5
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-gray-500">Customers</h3>
          <p className="text-4xl font-bold text-purple-600 mt-3">
            3
          </p>
        </div>

      </div>

      {/* Performance Overview */}

      <div className="bg-white rounded-xl shadow-md p-6 mb-8">

        <h2 className="text-2xl font-bold mb-4">
          Business Performance Summary
        </h2>

        <div className="grid md:grid-cols-2 gap-6">

          <div>
            <h3 className="font-semibold text-lg mb-2">
              Revenue Growth
            </h3>

            <div className="w-full bg-gray-200 rounded-full h-4">
              <div className="bg-green-500 h-4 rounded-full w-[80%]"></div>
            </div>

            <p className="mt-2 text-green-600 font-semibold">
              80% Growth
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">
              Customer Satisfaction
            </h3>

            <div className="w-full bg-gray-200 rounded-full h-4">
              <div className="bg-blue-500 h-4 rounded-full w-[92%]"></div>
            </div>

            <p className="mt-2 text-blue-600 font-semibold">
              92% Satisfaction
            </p>
          </div>

        </div>

      </div>

      {/* Quick Analytics Table */}
      <div className="mt-8">
  <RevenueChart data={chartData} />
</div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">

        <table className="w-full">

          <thead className="bg-slate-800 text-white">

            <tr>
              <th className="p-4 text-left">Metric</th>
              <th className="p-4 text-left">Value</th>
              <th className="p-4 text-left">Status</th>
            </tr>

          </thead>

          <tbody>

            <tr className="border-b">
              <td className="p-4">Revenue</td>
              <td className="p-4">₹160000</td>
              <td className="p-4">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                  Excellent
                </span>
              </td>
            </tr>

            <tr className="border-b">
              <td className="p-4">Profit</td>
              <td className="p-4">₹75000</td>
              <td className="p-4">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                  Good
                </span>
              </td>
            </tr>

            <tr className="border-b">
              <td className="p-4">Orders</td>
              <td className="p-4">5</td>
              <td className="p-4">
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                  Average
                </span>
              </td>
            </tr>

            <tr>
              <td className="p-4">Customers</td>
              <td className="p-4">3</td>
              <td className="p-4">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                  Active
                </span>
              </td>
            </tr>

          </tbody>

        </table>

      </div>

    </MainLayout>
  );
}

export default Analytics;