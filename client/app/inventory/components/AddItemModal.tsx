"use client";

import { motion } from "framer-motion";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AddItemModal({
  isOpen,
  onClose,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.9,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        exit={{
          opacity: 0,
          scale: 0.9,
        }}
        className="bg-white w-full max-w-2xl rounded-2xl p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            Add Inventory Item
          </h2>

          <button
            onClick={onClose}
            className="text-2xl"
          >
            ×
          </button>
        </div>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <input
            type="text"
            placeholder="Item Name"
            className="border rounded-xl px-4 py-3"
          />

          <input
            type="text"
            placeholder="SKU"
            className="border rounded-xl px-4 py-3"
          />

          <input
            type="text"
            placeholder="Category"
            className="border rounded-xl px-4 py-3"
          />

          <input
            type="text"
            placeholder="Supplier"
            className="border rounded-xl px-4 py-3"
          />

          <input
            type="number"
            placeholder="Stock Quantity"
            className="border rounded-xl px-4 py-3"
          />

          <input
            type="number"
            placeholder="Purchase Price"
            className="border rounded-xl px-4 py-3"
          />

          <div className="md:col-span-2 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="border px-5 py-3 rounded-xl"
            >
              Cancel
            </button>

            <button className="bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700">
              Save Item
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}