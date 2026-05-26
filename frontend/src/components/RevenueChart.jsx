import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function RevenueChart({ data }) {
  const chartData = Array.isArray(data) ? data : [];

  return (
    <div className="bg-slate-900 rounded-3xl shadow-2xl p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">

        <div>
          <h3 className="text-white text-2xl font-bold">
              Reservation Report

          </h3>

          <p className="text-slate-400 text-sm">
            Monthly Reservation Analytics
          </p>
        </div>

        <div className="bg-pink-500/20 text-pink-300 px-4 py-2 rounded-xl font-semibold">
          2026
        </div>

      </div>

      {/* Chart */}

      <div className="h-96">

        <ResponsiveContainer width="100%" height="100%">

          <AreaChart data={chartData}>

            <defs>

              <linearGradient
                id="colorRevenue"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="#f472b6"
                  stopOpacity={0.8}
                />

                <stop
                  offset="95%"
                  stopColor="#f472b6"
                  stopOpacity={0}
                />
              </linearGradient>

            </defs>

            <CartesianGrid
              stroke="#334155"
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="month"
              stroke="#cbd5e1"
              tick={{ fill: "#cbd5e1" }}
            />

            <YAxis
              stroke="#cbd5e1"
              tick={{ fill: "#cbd5e1" }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "12px",
                color: "#fff",
              }}
            />

            <Area
              type="monotone"
              dataKey="reservations"
              stroke="#f472b6"
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />

          </AreaChart>

        </ResponsiveContainer>

      </div>

      {/* Bottom Summary */}

      <div className="grid grid-cols-3 gap-4 mt-6">
<div className="bg-slate-800 rounded-xl p-4 text-center">
  <p className="text-slate-400 text-sm">
    Total Reservations
  </p>

  <h4 className="text-green-400 text-xl font-bold mt-1">
    160
  </h4>
</div>

<div className="bg-slate-800 rounded-xl p-4 text-center">
  <p className="text-slate-400 text-sm">
    Occupied Tables
  </p>

  <h4 className="text-blue-400 text-xl font-bold mt-1">
    32
  </h4>
</div>

<div className="bg-slate-800 rounded-xl p-4 text-center">
  <p className="text-slate-400 text-sm">
    Waitlist Customers
  </p>

  <h4 className="text-pink-400 text-xl font-bold mt-1">
    12
  </h4>
</div>

      </div>

    </div>
  );
}

export default RevenueChart;