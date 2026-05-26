"use client";

import InventoryLayout from "../components/InventoryLayout";

import LoadingSkeleton from "../components/LoadingSkeleton";

import EmptyState from "../components/EmptyState";

import InventoryTable from "../components/InventoryTable";

import StatusBadge from "../components/StatusBadge";

import CreatePOForm from "../components/CreatePOForm";

const columns = [
  {
    key: "po_number",
    label: "PO Number",
  },
  {
    key: "supplier",
    label: "Supplier",
  },
  {
    key: "total",
    label: "Total",
  },
  {
    key: "status",
    label: "Status",
  },
];

export default function PurchaseOrdersPage() {
  const loading = false;

  const purchaseOrders: any[] = [];

  return (
    <InventoryLayout>
      <h1 className="text-3xl font-bold">
        Purchase Orders
      </h1>

      <div className="space-y-6 mt-6">
        <CreatePOForm />

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-5">
            Purchase Orders
          </h2>

          {loading ? (
            <LoadingSkeleton />
          ) : purchaseOrders.length ===
            0 ? (
            <EmptyState
              title="No Purchase Orders"
              subtitle="Purchase orders from backend will appear here"
            />
          ) : (
            <InventoryTable
              columns={columns}
              data={purchaseOrders.map(
                (po) => ({
                  ...po,

                  supplier:
                    po.supplier?.name,

                  status: (
                    <StatusBadge
                      status={
                        po.status
                      }
                    />
                  ),
                })
              )}
            />
          )}
        </div>
      </div>
    </InventoryLayout>
  );
}