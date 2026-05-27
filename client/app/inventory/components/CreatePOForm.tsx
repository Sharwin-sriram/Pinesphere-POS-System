"use client";

export default function CreatePOForm() {
 return (
 <div className="bg-white rounded-2xl p-6 ">
 <h2 className="text-2xl font-semibold mb-6">
 Create Purchase Order
 </h2>

 <form className="grid grid-cols-1 md:grid-cols-2 gap-5">
 <div>
 <label className="text-sm font-medium">
 Supplier Name
 </label>

 <input
 type="text"
 placeholder="Enter supplier"
 className="w-full border rounded-xl px-4 py-3 mt-2 outline-none"
 />
 </div>

 <div>
 <label className="text-sm font-medium">
 PO Number
 </label>

 <input
 type="text"
 placeholder="PO-2026-001"
 className="w-full border rounded-xl px-4 py-3 mt-2 outline-none"
 />
 </div>

 <div>
 <label className="text-sm font-medium">
 Order Date
 </label>

 <input
 type="date"
 className="w-full border rounded-xl px-4 py-3 mt-2 outline-none"
 />
 </div>

 <div>
 <label className="text-sm font-medium">
 Expected Delivery
 </label>

 <input
 type="date"
 className="w-full border rounded-xl px-4 py-3 mt-2 outline-none"
 />
 </div>

 <div className="md:col-span-2">
 <label className="text-sm font-medium">
 Notes
 </label>

 <textarea
 rows={4}
 placeholder="Additional notes..."
 className="w-full border rounded-xl px-4 py-3 mt-2 outline-none"
 />
 </div>

 <div className="md:col-span-2 flex justify-end">
 <button className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700">
 Create PO
 </button>
 </div>
 </form>
 </div>
 );
}