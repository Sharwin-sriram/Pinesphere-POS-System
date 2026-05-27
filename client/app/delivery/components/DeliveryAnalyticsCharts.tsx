"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const deliveryData = [
  { day: "Mon", deliveries: 45 },
  { day: "Tue", deliveries: 60 },
  { day: "Wed", deliveries: 52 },
  { day: "Thu", deliveries: 70 },
  { day: "Fri", deliveries: 95 },
  { day: "Sat", deliveries: 120 },
  { day: "Sun", deliveries: 88 },
];

const riderData = [
  { rider: "Arjun", completed: 32 },
  { rider: "Karthik", completed: 24 },
  { rider: "Vijay", completed: 18 },
  { rider: "Akash", completed: 27 },
];

export default function DeliveryAnalyticsCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="bg-white p-5 rounded-2xl shadow-sm">
        <h2 className="text-xl font-bold mb-5">
          Weekly Deliveries
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={deliveryData}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />

            <Line
              type="monotone"
              dataKey="deliveries"
              stroke="#2563eb"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm">
        <h2 className="text-xl font-bold mb-5">
          Rider Performance
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={riderData}>
            <XAxis dataKey="rider" />
            <YAxis />
            <Tooltip />

            <Bar
              dataKey="completed"
              fill="#2563eb"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}