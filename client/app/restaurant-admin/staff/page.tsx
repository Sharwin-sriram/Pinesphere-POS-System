"use client";

import { Users } from "lucide-react";
import React from "react";
import EmptyState from "@/components/ui/EmptyState";

export default function StaffPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up">
      <EmptyState
        icon={Users}
        title="Staff Management"
        description="This is where you can manage your restaurant's staff attendance, roles, and shifts. Content will be added here soon."
        actionLabel="Add New Staff"
        onAction={() => {}}
        buttonVariant="success"
      />
    </div>
  );
}
