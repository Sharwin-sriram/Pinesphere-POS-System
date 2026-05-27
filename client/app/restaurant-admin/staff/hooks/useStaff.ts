"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { StaffMember, Role, Shift, StaffFilters, StaffSummary } from "../types";
import { staffApi } from "../services/staffApi";
import { toast } from "react-hot-toast";

export function useStaff(restaurantId: string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [totalStaff, setTotalStaff] = useState(0);
  const [summary, setSummary] = useState<StaffSummary>({
    total_staff: 0,
    on_shift: 0,
    off_shift: 0,
    on_leave: 0,
    total_roles: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [shiftsLoading, setShiftsLoading] = useState(true);

  // Read initial filters from search parameters
  const [filters, setFilters] = useState<StaffFilters>({
    search: searchParams.get("search") || "",
    role: searchParams.get("role") || "",
    status: searchParams.get("status") || "",
    shift: searchParams.get("shift") || "",
    sort: searchParams.get("sort") || "name_asc",
    page: parseInt(searchParams.get("page") || "1", 10),
    page_size: parseInt(searchParams.get("page_size") || "10", 10),
  });

  // Sync state filter updates to browser URL query parameters
  const syncFiltersToUrl = useCallback(
    (newFilters: StaffFilters) => {
      const params = new URLSearchParams();
      if (newFilters.search) params.set("search", newFilters.search);
      if (newFilters.role) params.set("role", newFilters.role);
      if (newFilters.status) params.set("status", newFilters.status);
      if (newFilters.shift) params.set("shift", newFilters.shift);
      if (newFilters.sort) params.set("sort", newFilters.sort);
      if (newFilters.page && newFilters.page > 1) {
        params.set("page", String(newFilters.page));
      }
      if (newFilters.page_size && newFilters.page_size !== 10) {
        params.set("page_size", String(newFilters.page_size));
      }

      const nextQuery = params.toString();
      const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
      const currentQuery = searchParams.toString();
      const currentUrl = currentQuery ? `${pathname}?${currentQuery}` : pathname;

      if (nextUrl !== currentUrl) {
        router.replace(nextUrl);
      }
    },
    [router, pathname, searchParams]
  );

  // Set filter property
  const setFilterValue = useCallback(
    (key: keyof StaffFilters, value: any) => {
      setFilters((prev) => {
        const updated = {
          ...prev,
          [key]: value,
          page: key === "page" ? value : 1,
        };
        return updated;
      });
    },
    []
  );

  const resetFilters = useCallback(() => {
    const cleared = {
      search: "",
      role: "",
      status: "",
      shift: "",
      sort: "name_asc",
      page: 1,
      page_size: 10,
    };
    setFilters(cleared);
  }, []);

  // Synchronize browser backward/forward navigation changes with local React state
  useEffect(() => {
    setFilters({
      search: searchParams.get("search") || "",
      role: searchParams.get("role") || "",
      status: searchParams.get("status") || "",
      shift: searchParams.get("shift") || "",
      sort: searchParams.get("sort") || "name_asc",
      page: parseInt(searchParams.get("page") || "1", 10),
      page_size: parseInt(searchParams.get("page_size") || "10", 10),
    });
  }, [searchParams]);

  useEffect(() => {
    syncFiltersToUrl(filters);
  }, [filters, syncFiltersToUrl]);

  // Fetch staff list
  const fetchStaff = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const data = await staffApi.getStaff(restaurantId, filters);
      setStaff(data.results);
      setTotalStaff(data.total);
      if (data.summary) {
        setSummary(data.summary);
      }
      setError("");
    } catch (err: any) {
      console.error(err);
      setError("Failed to load staff list");
    } finally {
      setLoading(false);
    }
  }, [restaurantId, filters]);

  // Fetch metadata dropdown lists
  const fetchMetadata = useCallback(async () => {
    if (!restaurantId) return;
    setRolesLoading(true);
    setShiftsLoading(true);
    try {
      const [rolesData, shiftsData] = await Promise.all([
        staffApi.getRoles(restaurantId),
        staffApi.getShifts(restaurantId),
      ]);
      setRoles(rolesData);
      setShifts(shiftsData);
    } catch (err) {
      console.error("Failed to load roles and shifts template lists", err);
    } finally {
      setRolesLoading(false);
      setShiftsLoading(false);
    }
  }, [restaurantId]);

  // Trigger loading list on filters or restaurantId change
  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // Trigger loading metadata on mount
  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  // ─── Staff Mutations ───

  // 1. Add Staff Member
  const addStaffMember = async (payload: Partial<StaffMember>) => {
    const toastId = toast.loading("Adding staff member...");
    try {
      const created = await staffApi.createStaff(restaurantId, payload);
      // Fetch latest list to refresh stats and pagination bounds
      await fetchStaff();
      toast.success("Staff member added successfully", { id: toastId });
      return created;
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to add staff member", { id: toastId });
      throw err;
    }
  };

  // 2. Edit Staff Member
  const updateStaffMember = async (staffId: string, payload: Partial<StaffMember>) => {
    const toastId = toast.loading("Updating staff member...");
    try {
      const updated = await staffApi.updateStaff(restaurantId, staffId, payload);
      await fetchStaff();
      toast.success("Staff member updated successfully", { id: toastId });
      return updated;
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to update staff member", { id: toastId });
      throw err;
    }
  };

  // 3. Optimistic Deactivation / Status changes (Mark On Leave / Deactivate)
  const toggleStaffStatus = async (staffId: string, newStatus: "Active" | "Inactive" | "On Leave", failSimulated = false) => {
    const target = staff.find((s) => s.id === staffId);
    if (!target) return;

    const oldStatus = target.status;
    const oldSchedule = target.today_schedule ? { ...target.today_schedule } : undefined;

    // Apply optimistic updates to local state
    setStaff((prev) =>
      prev.map((s) => {
        if (s.id !== staffId) return s;
        const sched = s.today_schedule ? { ...s.today_schedule } : undefined;
        if (sched && (newStatus === "On Leave" || newStatus === "Inactive")) {
          sched.clock_in = "";
          sched.clock_out = "";
          sched.total_hours = "0.0";
        }
        return { ...s, status: newStatus, today_schedule: sched };
      })
    );

    const toastId = toast.loading("Updating status...");
    try {
      await staffApi.patchStaff(restaurantId, staffId, {
        status: newStatus,
        fail: failSimulated,
      });
      // Fetch list to sync statistics
      await fetchStaff();
      toast.success(`Status updated to ${newStatus}`, { id: toastId });
    } catch (err: any) {
      // Rollback on failure
      setStaff((prev) =>
        prev.map((s) =>
          s.id === staffId
            ? { ...s, status: oldStatus, today_schedule: oldSchedule }
            : s
        )
      );
      toast.error(err?.response?.data?.detail || "Failed to update status", { id: toastId });
    }
  };

  // 4. Optimistic Staff Deletion
  const deleteStaffMember = async (staffId: string, failSimulated = false) => {
    const index = staff.findIndex((s) => s.id === staffId);
    if (index === -1) return;

    const targetStaff = staff[index];
    const previousStaff = [...staff];

    // Optimistic Deletion
    setStaff((prev) => prev.filter((s) => s.id !== staffId));
    setTotalStaff((prev) => Math.max(0, prev - 1));

    const toastId = toast.loading(`Removing ${targetStaff.first_name} ${targetStaff.last_name}...`);
    try {
      await staffApi.deleteStaff(restaurantId, staffId, failSimulated);
      await fetchStaff(); // Sync stats & total pages count
      toast.success("Staff member removed", { id: toastId });
    } catch (err: any) {
      // Rollback on failure
      setStaff(previousStaff);
      setTotalStaff(previousStaff.length);
      toast.error(err?.response?.data?.detail || "Failed to remove staff member", { id: toastId });
    }
  };

  // ─── Roles mutations ───

  const addRole = async (name: string, color: string) => {
    const toastId = toast.loading(`Creating role "${name}"...`);
    try {
      const created = await staffApi.createRole(restaurantId, { name, color });
      setRoles((prev) => [...prev, created]);
      toast.success("Role created", { id: toastId });
      return created;
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to create role", { id: toastId });
      throw err;
    }
  };

  const renameRole = async (roleId: string, name: string, color: string) => {
    const toastId = toast.loading(`Updating role...`);
    try {
      const updated = await staffApi.updateRole(restaurantId, roleId, { name, color });
      setRoles((prev) => prev.map((r) => (r.id === roleId ? updated : r)));
      // Refetch staff to reflect renamed role in UI badges
      await fetchStaff();
      toast.success("Role updated", { id: toastId });
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to update role", { id: toastId });
      throw err;
    }
  };

  const deleteRole = async (roleId: string) => {
    const toastId = toast.loading("Deleting role...");
    try {
      await staffApi.deleteRole(restaurantId, roleId);
      setRoles((prev) => prev.filter((r) => r.id !== roleId));
      toast.success("Role deleted", { id: toastId });
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to delete role", { id: toastId });
    }
  };

  return {
    staff,
    totalStaff,
    summary,
    loading,
    error,
    roles,
    rolesLoading,
    shifts,
    shiftsLoading,
    filters,
    setFilterValue,
    resetFilters,
    fetchStaff,
    fetchMetadata,
    addStaffMember,
    updateStaffMember,
    toggleStaffStatus,
    deleteStaffMember,
    addRole,
    renameRole,
    deleteRole,
  };
}
export default useStaff;
