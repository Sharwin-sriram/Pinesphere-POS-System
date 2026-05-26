"use client";

import InventoryLayout from "../components/InventoryLayout";

import GRNForm from "../components/GRNForm";

export default function GRNPage() {
 return (
 <InventoryLayout>
 <h1 className="text-3xl font-semibold mb-6">
 GRN Management
 </h1>

 <GRNForm />
 </InventoryLayout>
 );
}