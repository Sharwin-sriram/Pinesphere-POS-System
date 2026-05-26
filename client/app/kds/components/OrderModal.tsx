"use client";

type Props = {
  order: {
    id: string;
    table: string;
    items: number;
    status: string;
    time: string;
  } | null;

  onClose: () => void;
};

export default function OrderModal({
  order,
  onClose,
}: Props) {

  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      {/* MODAL */}
      <div className="bg-white w-[500px] rounded-2xl p-6 shadow-xl">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-bold">
            Order Details
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-xl"
          >
            ✕
          </button>

        </div>

        {/* ORDER INFO */}
        <div className="space-y-4">

          <div>
            <p className="text-gray-500">
              Order ID
            </p>

            <h3 className="font-semibold">
              {order.id}
            </h3>
          </div>

          <div>
            <p className="text-gray-500">
              Table
            </p>

            <h3 className="font-semibold">
              {order.table}
            </h3>
          </div>

          <div>
            <p className="text-gray-500">
              Status
            </p>

            <h3 className="font-semibold">
              {order.status}
            </h3>
          </div>

          <div>
            <p className="text-gray-500">
              Remaining Time
            </p>

            <h3 className="font-semibold text-red-500">
              {order.time}
            </h3>
          </div>

        </div>

        {/* ITEMS */}
        <div className="mt-8">

          <h3 className="text-lg font-bold mb-4">
            Ordered Items
          </h3>

          <div className="space-y-3">

            <div className="flex justify-between bg-gray-100 p-3 rounded-xl">
              <span>Margherita Pizza</span>
              <span>x2</span>
            </div>

            <div className="flex justify-between bg-gray-100 p-3 rounded-xl">
              <span>Pasta Alfredo</span>
              <span>x1</span>
            </div>

            <div className="flex justify-between bg-gray-100 p-3 rounded-xl">
              <span>Cold Coffee</span>
              <span>x1</span>
            </div>

          </div>

        </div>

        {/* NOTES */}
        <div className="mt-8">

          <h3 className="text-lg font-bold mb-3">
            Special Instructions
          </h3>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-sm text-gray-700">
            Less spicy. Extra cheese for pizza.
          </div>

        </div>

      </div>

    </div>
  );
}