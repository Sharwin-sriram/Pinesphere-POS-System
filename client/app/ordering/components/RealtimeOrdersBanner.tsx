// components/RealtimeOrdersBanner.tsx

"use client";

interface Props {
  activeOrders?: number;
  preparing?: number;
  ready?: number;
  delivered?: number;
  cancelled?: number;
}

export default function RealtimeOrdersBanner({
  activeOrders = 0,
  preparing = 0,
  ready = 0,
  delivered = 0,
  cancelled = 0,
}: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mt-10">
      <div className="bg-white rounded-[32px] p-6 shadow-sm">
        <p className="text-gray-500">
          Active
        </p>

        <h2 className="text-4xl font-black mt-4">
          {activeOrders}
        </h2>
      </div>

      <div className="bg-white rounded-[32px] p-6 shadow-sm">
        <p className="text-gray-500">
          Preparing
        </p>

        <h2 className="text-4xl font-black mt-4">
          {preparing}
        </h2>
      </div>

      <div className="bg-white rounded-[32px] p-6 shadow-sm">
        <p className="text-gray-500">
          Ready
        </p>

        <h2 className="text-4xl font-black mt-4">
          {ready}
        </h2>
      </div>

      <div className="bg-white rounded-[32px] p-6 shadow-sm">
        <p className="text-gray-500">
          Delivered
        </p>

        <h2 className="text-4xl font-black mt-4">
          {delivered}
        </h2>
      </div>

      <div className="bg-white rounded-[32px] p-6 shadow-sm">
        <p className="text-gray-500">
          Cancelled
        </p>

        <h2 className="text-4xl font-black mt-4">
          {cancelled}
        </h2>
      </div>
    </div>
  );
}