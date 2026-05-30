"use client";

import { Package } from "lucide-react";
import React from "react";
import EmptyState from "@/components/ui/EmptyState";

export default function InventoryPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up">
      <EmptyState
        icon={Package}
        title="Inventory Management"
        description="Track your ingredients, raw materials, and stock levels here."
        actionLabel="Manage Inventory"
        onAction={() => {}}
        buttonVariant="success"
      />
    </div>
  );
}
