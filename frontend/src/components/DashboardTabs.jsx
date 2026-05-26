function DashboardTabs() {
  return (
    <div className="flex gap-3 mb-6">
      <button className="bg-pink-200 text-pink-900 px-5 py-2 rounded-lg">
        Revenue Report
      </button>

      <button className="bg-slate-700 text-white px-5 py-2 rounded-lg">
        Customer Report
      </button>

      <button className="bg-slate-700 text-white px-5 py-2 rounded-lg">
        Employee Report
      </button>
    </div>
  );
}

export default DashboardTabs;