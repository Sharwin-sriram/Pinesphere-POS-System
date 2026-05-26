"use client";

import { useState } from "react";
import Link from "next/link";

export default function MobileSidebar() {
  const [open, setOpen] =
    useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg"
      >
        Menu
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50">
          <div className="w-[260px] bg-white h-full p-5">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold">
                Inventory
              </h2>

              <button
                onClick={() => setOpen(false)}
                className="text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <Link
                href="/inventory"
                className="block"
              >
                Dashboard
              </Link>

              <Link
                href="/inventory/items"
                className="block"
              >
                Items
              </Link>

              <Link
                href="/inventory/purchase-orders"
                className="block"
              >
                Purchase Orders
              </Link>

              <Link
                href="/inventory/grn"
                className="block"
              >
                GRN
              </Link>

              <Link
                href="/inventory/stock-transfer"
                className="block"
              >
                Stock Transfer
              </Link>

              <Link
                href="/inventory/recipe-mapping"
                className="block"
              >
                Recipe Mapping
              </Link>

              <Link
                href="/inventory/low-stock"
                className="block"
              >
                Low Stock
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}