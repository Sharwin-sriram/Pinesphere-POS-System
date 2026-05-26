"use client";

export default function GRNForm() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-2xl font-bold mb-6">
        Create GRN
      </h2>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="text-sm font-medium">
            GRN Number
          </label>

          <input
            type="text"
            placeholder="GRN-2026-001"
            className="w-full border rounded-xl px-4 py-3 mt-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium">
            Purchase Order
          </label>

          <select className="w-full border rounded-xl px-4 py-3 mt-2">
            <option>PO-2026-001</option>
            <option>PO-2026-002</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">
            Supplier
          </label>

          <input
            type="text"
            placeholder="Supplier Name"
            className="w-full border rounded-xl px-4 py-3 mt-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium">
            Delivery Date
          </label>

          <input
            type="date"
            className="w-full border rounded-xl px-4 py-3 mt-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium">
            Received Quantity
          </label>

          <input
            type="number"
            placeholder="Enter quantity"
            className="w-full border rounded-xl px-4 py-3 mt-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium">
            Received By
          </label>

          <input
            type="text"
            placeholder="Employee Name"
            className="w-full border rounded-xl px-4 py-3 mt-2"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-medium">
            Remarks
          </label>

          <textarea
            rows={4}
            placeholder="Additional notes..."
            className="w-full border rounded-xl px-4 py-3 mt-2"
          />
        </div>

        <div className="md:col-span-2 flex justify-end">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700">
            Save GRN
          </button>
        </div>
      </form>
    </div>
  );
}