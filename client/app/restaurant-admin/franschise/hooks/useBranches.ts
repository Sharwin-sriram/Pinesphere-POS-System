"use client";

import { useEffect, useState, useCallback } from "react";
import { Branch, CreateBranchPayload, branchApi } from "../services/branchApi";
import toast from "react-hot-toast";

export default function useBranches(restaurantId: string) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const normalizeBranches = (data: unknown): Branch[] => {
    if (Array.isArray(data)) {
      return data;
    }

    if (data && typeof data === "object") {
      const payload = data as {
        results?: unknown;
        branches?: unknown;
        data?: unknown;
      };

      if (Array.isArray(payload.results)) {
        return payload.results as Branch[];
      }

      if (Array.isArray(payload.branches)) {
        return payload.branches as Branch[];
      }

      if (Array.isArray(payload.data)) {
        return payload.data as Branch[];
      }
    }

    return [];
  };

  // Fetch branches
  const fetchBranches = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const data = await branchApi.getBranches(restaurantId);
      setBranches(normalizeBranches(data));
      setError("");
    } catch (err: any) {
      console.error("Error fetching branches:", err);
      setError("Failed to load branches");
      toast.error("Failed to load branches");
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  // Fetch branches on mount
  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  // Create branch
  const createBranch = useCallback(
    async (payload: CreateBranchPayload) => {
      try {
        const newBranch = await branchApi.createBranch(restaurantId, payload);
        setBranches((prev) => [...prev, newBranch]);
        toast.success("Branch created successfully");
        return newBranch;
      } catch (err: any) {
        console.error("Error creating branch:", err);
        const errorMessage =
          err.response?.data?.message || "Failed to create branch";
        toast.error(errorMessage);
        throw err;
      }
    },
    [restaurantId]
  );

  // Update branch
  const updateBranch = useCallback(
    async (branchId: string, payload: Partial<CreateBranchPayload>) => {
      try {
        const updatedBranch = await branchApi.updateBranch(
          restaurantId,
          branchId,
          payload
        );
        setBranches((prev) =>
          prev.map((b) => (b.id === branchId ? updatedBranch : b))
        );
        toast.success("Branch updated successfully");
        return updatedBranch;
      } catch (err: any) {
        console.error("Error updating branch:", err);
        const errorMessage =
          err.response?.data?.message || "Failed to update branch";
        toast.error(errorMessage);
        throw err;
      }
    },
    [restaurantId]
  );

  // Delete branch
  const deleteBranch = useCallback(
    async (branchId: string) => {
      try {
        await branchApi.deleteBranch(restaurantId, branchId);
        setBranches((prev) => prev.filter((b) => b.id !== branchId));
        toast.success("Branch deleted successfully");
      } catch (err: any) {
        console.error("Error deleting branch:", err);
        const errorMessage =
          err.response?.data?.message || "Failed to delete branch";
        toast.error(errorMessage);
        throw err;
      }
    },
    [restaurantId]
  );

  return {
    branches,
    loading,
    error,
    fetchBranches,
    createBranch,
    updateBranch,
    deleteBranch,
  };
}
