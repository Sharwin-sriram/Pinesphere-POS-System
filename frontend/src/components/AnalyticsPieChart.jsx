import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Orders", value: 40 },
  { name: "Customers", value: 30 },
  { name: "Revenue", value: 20 },
  { name: "Profit", value: 10 },
];

const COLORS = [
  "#f472b6",
  "#ec4899",
  "#f9a8d4",
  "#fbcfe8",
];

function AnalyticsPieChart() {
  return (
    <div className="bg-slate-800 rounded-2xl shadow-xl p-6">
      <h3 className="text-white text-xl font-bold mb-4">
        Analytics Distribution
      </h3>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={70}
              outerRadius={100}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index]}
                />
              ))}
            </Pie>

            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default AnalyticsPieChart;