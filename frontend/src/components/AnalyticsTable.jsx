function AnalyticsTable() {
  const rows = [
    {
      product: "Pizza",
      sold: 200,
      revenue: "₹25,000",
      profit: "₹10,000",
    },
    {
      product: "Burger",
      sold: 180,
      revenue: "₹20,000",
      profit: "₹8,500",
    },
    {
      product: "Sandwich",
      sold: 150,
      revenue: "₹18,000",
      profit: "₹7,200",
    },
  ];

  return (
    <div className="bg-slate-800 rounded-2xl p-6 mt-8">
      <h2 className="text-white text-xl font-bold mb-4">
        Sales Performance Report
      </h2>

      <table className="w-full text-slate-300">
        <thead>
          <tr>
            <th className="text-left p-3">
              Product
            </th>
            <th className="text-left p-3">
              Sold
            </th>
            <th className="text-left p-3">
              Revenue
            </th>
            <th className="text-left p-3">
              Profit
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr
              key={index}
              className="border-t border-slate-700"
            >
              <td className="p-3">
                {row.product}
              </td>
              <td className="p-3">
                {row.sold}
              </td>
              <td className="p-3">
                {row.revenue}
              </td>
              <td className="p-3">
                {row.profit}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AnalyticsTable;