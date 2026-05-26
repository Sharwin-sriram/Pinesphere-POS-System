"use client";

import InventoryLayout from "../components/InventoryLayout";

import RecipeMappingForm from "../components/RecipeMappingForm";

export default function RecipeMappingPage() {
 return (
 <InventoryLayout>
 <h1 className="text-3xl font-semibold mb-6">
 Recipe Mapping
 </h1>

 <RecipeMappingForm />
 </InventoryLayout>
 );
}