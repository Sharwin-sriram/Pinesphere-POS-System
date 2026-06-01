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

// Orange accent from design system
const ACCENT = "#f59e0b";
const ACCENT_SECONDARY = "#10b981";

export default function DeliveryAnalyticsCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Weekly Deliveries – Line Chart */}
      <div className="card-light !p-5">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Weekly Deliveries</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">Total deliveries per day this week</p>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={deliveryData}>
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: "var(--color-bg-secondary)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Line
              type="monotone"
              dataKey="deliveries"
              stroke={ACCENT}
              strokeWidth={3}
              dot={{ fill: ACCENT, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: ACCENT }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Rider Performance – Bar Chart */}
      <div className="card-light !p-5">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Rider Performance</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">Completed deliveries per rider</p>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={riderData}>
            <XAxis dataKey="rider" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: "var(--color-bg-secondary)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Bar
              dataKey="completed"
              fill={ACCENT}
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}