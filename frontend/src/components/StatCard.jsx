function StatCard({ title, value, color }) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-lg border-l-4 ${color}
      p-6 hover:shadow-2xl hover:-translate-y-1
      transition duration-300`}
    >
      <div className="flex flex-col">

        <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">
          {title}
        </p>

        <h2 className="text-4xl font-bold text-slate-800 mt-4">
          {value}
        </h2>

        <div className="mt-4 flex items-center">
          <span className="text-green-500 text-sm font-semibold">
            ↑ 12%
          </span>

          <span className="text-gray-400 text-sm ml-2">
            from last month
          </span>
        </div>

      </div>
    </div>
  );
}

export default StatCard;