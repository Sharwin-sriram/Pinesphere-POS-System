"use client";

import InventoryLayout from "../components/InventoryLayout";

import StockTransferForm from "../components/StockTransferForm";

export default function StockTransferPage() {
  return (
    <InventoryLayout>
      <h1 className="text-3xl font-bold mb-6">
        Stock Transfer
      </h1>

      <StockTransferForm />
    </InventoryLayout>
  );
}