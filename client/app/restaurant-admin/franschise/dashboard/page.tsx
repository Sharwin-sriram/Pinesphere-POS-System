"use client";

import { useEffect, useState } from "react";
import { Briefcase, CheckCircle, XCircle, MapPin, User as UserIcon, Plus } from "lucide-react";
import Badge from "@/components/ui/Badge";
import useBranches from "../hooks/useBranches";
import NewBranchModal from "../components/NewBranchModal";
import { CreateBranchPayload } from "../services/branchApi";
import { authService } from "@/app/lib/authService";

interface Branch {
  _id: string;
  name: string;
  location: string;
  managerName: string;
  status: string;
}

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [restaurantId, setRestaurantId] = useState("");

  // Get restaurant ID from current user
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user?.restaurant_id) {
      setRestaurantId(user.restaurant_id);
    }
  }, []);

  // Use the custom hook for branch management
  const { branches: newBranches, loading, createBranch } = useBranches(restaurantId);

  // Convert new branch format to old format for display
  const branches: Branch[] = newBranches.map((branch) => ({
    _id: branch.id,
    name: branch.name,
    location: branch.address,
    managerName: branch.manager_name,
    status: branch.is_active ? "ACTIVE" : "INACTIVE",
  }));

  const handleCreateBranch = async (payload: CreateBranchPayload) => {
    setIsSubmitting(true);
    try {
      await createBranch(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  // COUNTS
  const totalBranches = branches.length;
  const activeBranches = branches.filter((branch) => branch.status === "ACTIVE").length;
  const inactiveBranches = branches.filter((branch) => branch.status === "INACTIVE").length;

  // PERCENTAGES
  const activePercentage = totalBranches > 0 ? (activeBranches / totalBranches) * 100 : 0;
  const inactivePercentage = totalBranches > 0 ? (inactiveBranches / totalBranches) * 100 : 0;

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      {/* HEADER */}
      <div className="mb-2 flex justify-between items-start">
        <div>
          <h1 className="text-[length:var(--text-xl)] font-semibold text-[var(--color-text-primary)]">
            Branch Dashboard
          </h1>
          <p className="mt-1 text-[length:var(--text-sm)] text-[var(--color-text-secondary)]">
            Monitor franchise branches and analytics
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-accent-green)] text-white text-[length:var(--text-sm)] font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={18} />
          New Branch
        </button>
      </div>

      {/* LOADING */}
      {loading && (
        <p className="text-center text-[length:var(--text-base)] text-[var(--color-text-secondary)]">
          Loading dashboard...
        </p>
      )}

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* TOTAL */}
        <div className="card-light !p-6 flex flex-col justify-between">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-[var(--color-blue-subtle)] text-[var(--color-blue)]">
              <Briefcase size={24} />
            </div>
            <div>
              <h3 className="text-[var(--color-text-secondary)] text-[length:var(--text-sm)] font-medium">Total Branches</h3>
              <p className="text-[length:var(--text-xl)] font-semibold text-[var(--color-text-primary)] mt-1">
                {totalBranches}
              </p>
            </div>
          </div>
          <div className="text-[length:var(--text-xs)] text-[var(--color-text-muted)]">
            Registered branches in POS
          </div>
        </div>

        {/* ACTIVE */}
        <div className="card-light !p-6 flex flex-col justify-between">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-[var(--color-accent-green-subtle)] text-[var(--color-accent-green)]">
              <CheckCircle size={24} />
            </div>
            <div>
              <h3 className="text-[var(--color-text-secondary)] text-[length:var(--text-sm)] font-medium">Active Branches</h3>
              <p className="text-[length:var(--text-xl)] font-semibold text-[var(--color-text-primary)] mt-1">
                {activeBranches}
              </p>
            </div>
          </div>
          <div className="text-[length:var(--text-xs)] text-[var(--color-text-muted)]">
            Operating normally
          </div>
        </div>

        {/* INACTIVE */}
        <div className="card-light !p-6 flex flex-col justify-between">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-[var(--color-danger-subtle)] text-[var(--color-danger)]">
              <XCircle size={24} />
            </div>
            <div>
              <h3 className="text-[var(--color-text-secondary)] text-[length:var(--text-sm)] font-medium">Inactive Branches</h3>
              <p className="text-[length:var(--text-xl)] font-semibold text-[var(--color-text-primary)] mt-1">
                {inactiveBranches}
              </p>
            </div>
          </div>
          <div className="text-[length:var(--text-xs)] text-[var(--color-text-muted)]">
            Temporarily closed or suspended
          </div>
        </div>
      </div>

      {/* ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ACTIVE ANALYTICS */}
        <div className="card-light !p-6">
          <h2 className="text-[length:var(--text-lg)] font-semibold text-[var(--color-text-primary)] mb-6">
            Active Branch Analytics
          </h2>
          <div className="mb-4 flex justify-between text-[length:var(--text-sm)]">
            <span className="font-medium text-[var(--color-text-secondary)]">
              Active Percentage
            </span>
            <span className="font-semibold text-[var(--color-text-primary)]">
              {activePercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-full h-4 overflow-hidden">
            <div
              className="bg-[var(--color-accent-green)] h-full rounded-full transition-all duration-350"
              style={{
                width: `${activePercentage}%`,
              }}
            />
          </div>
        </div>

        {/* INACTIVE ANALYTICS */}
        <div className="card-light !p-6">
          <h2 className="text-[length:var(--text-lg)] font-semibold text-[var(--color-text-primary)] mb-6">
            Inactive Branch Analytics
          </h2>
          <div className="mb-4 flex justify-between text-[length:var(--text-sm)]">
            <span className="font-medium text-[var(--color-text-secondary)]">
              Inactive Percentage
            </span>
            <span className="font-semibold text-[var(--color-text-primary)]">
              {inactivePercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-full h-4 overflow-hidden">
            <div
              className="bg-[var(--color-danger)] h-full rounded-full transition-all duration-350"
              style={{
                width: `${inactivePercentage}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* RECENT BRANCHES */}
      <div className="card-light !p-6">
        <h2 className="text-[length:var(--text-lg)] font-semibold text-[var(--color-text-primary)] mb-6">
          Recent Branches
        </h2>

        {branches.length === 0 ? (
          <p className="text-[var(--color-text-muted)] text-[length:var(--text-sm)]">
            No branches available
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {branches.slice(0, 6).map((branch) => (
              <div
                key={branch._id}
                className="border border-[var(--color-border)] rounded-xl p-5 hover:border-[var(--color-accent-green)] transition-all bg-[var(--color-bg-secondary)]"
              >
                <div className="flex justify-between items-start mb-4 gap-2">
                  <h3 className="text-[length:var(--text-base)] font-semibold text-[var(--color-text-primary)] truncate">
                    {branch.name}
                  </h3>
                  <Badge variant={branch.status === "ACTIVE" ? "success" : "danger"}>
                    {branch.status}
                  </Badge>
                </div>

                <div className="space-y-3 text-[length:var(--text-sm)] text-[var(--color-text-secondary)]">
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[var(--color-text-muted)] shrink-0" strokeWidth={1.5} />
                    <span className="truncate">{branch.location}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-[var(--color-text-muted)] shrink-0" strokeWidth={1.5} />
                    <span className="truncate">{branch.managerName}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* NEW BRANCH MODAL */}
      <NewBranchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateBranch}
        isLoading={isSubmitting}
      />
    </div>
  );
}