"use client";

import { useState } from "react";

import InventorySidebar from "./components/InventorySidebar";
import MobileSidebar from "./components/MobileSidebar";

import InventoryHeader from "./components/InventoryHeader";

import SearchBar from "./components/SearchBar";
import FilterBar from "./components/FilterBar";

import InventoryTable from "./components/InventoryTable";

import AddItemModal from "./components/AddItemModal";

import LoadingSkeleton from "./components/LoadingSkeleton";

import EmptyState from "./components/EmptyState";

import StatusBadge from "./components/StatusBadge";

import useInventory from "./hooks/useInventory";

const columns = [
  {
    key: "name",
    label: "Item",
  },
  {
    key: "sku",
    label: "SKU",
  },
  {
    key: "category",
    label: "Category",
  },
  {
    key: "current_stock",
    label: "Stock",
  },
  {
    key: "status",
    label: "Status",
  },
];

export default function InventoryPage() {
  const [openModal, setOpenModal] =
    useState(false);

  const {
    items,
    loading,
    error,
  } = useInventory();

  const formattedData =
    items.map((item) => ({
      ...item,

      status: (
        <StatusBadge
          status={
            Number(item.current_stock) <=
            Number(item.reorder_level)
              ? "Low Stock"
              : "In Stock"
          }
        />
      ),
    }));

  return (
    <div className="flex min-h-screen bg-[#f5f7fb]">
      <MobileSidebar />

      <InventorySidebar />

      <main className="flex-1 p-6">
        <InventoryHeader
          onAddItem={() =>
            setOpenModal(true)
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Items
            </p>

            <h2 className="text-3xl font-bold mt-3">
              {items.length}
            </h2>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Low Stock Items
            </p>

            <h2 className="text-3xl font-bold mt-3">
              {
                items.filter(
                  (item) =>
                    Number(
                      item.current_stock
                    ) <=
                    Number(
                      item.reorder_level
                    )
                ).length
              }
            </h2>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Active Suppliers
            </p>

            <h2 className="text-3xl font-bold mt-3">
              --
            </h2>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 mt-6 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <SearchBar />

            <FilterBar />
          </div>

          <div className="mt-6">
            {loading ? (
              <LoadingSkeleton />
            ) : error ? (
              <p className="text-red-500">
                {error}
              </p>
            ) : formattedData.length === 0 ? (
              <EmptyState
                title="No Inventory Data"
                subtitle="Inventory items from backend will appear here"
              />
            ) : (
              <InventoryTable
                columns={columns}
                data={formattedData}
              />
            )}
          </div>
        </div>

        <AddItemModal
          isOpen={openModal}
          onClose={() =>
            setOpenModal(false)
          }
        />
      </main>
    </div>
  );
}