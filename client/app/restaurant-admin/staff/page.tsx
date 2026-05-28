"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  Grid,
  List,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  UserCheck,
  UserX,
  Calendar,
  AlertTriangle,
  Settings,
} from "lucide-react";
import { useRouter } from "next/navigation";
import useStaff from "./hooks/useStaff";
import StaffTable from "./components/StaffTable";
import StaffGrid from "./components/StaffGrid";
import StaffModal from "./components/StaffModal";
import StaffDrawer from "./components/StaffDrawer";
import RoleModal from "./components/RoleModal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import { StaffMember } from "./types";
import { toast } from "react-hot-toast";
import { authService } from "../../lib/authService";

export default function StaffManagementPage() {
  const router = useRouter();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState("Restaurant");

  // Get restaurant ID from authenticated user on mount
  useEffect(() => {
    const userInfo = authService.getUserInfo();
    if (userInfo?.restaurant_id) {
      setRestaurantId(String(userInfo.restaurant_id));
      setRestaurantName(userInfo.restaurant_name || "Restaurant");
    } else {
      // Fallback to mock data if not authenticated
      setRestaurantId("r1");
      setRestaurantName("KFC - Kentucky Fried Chicken");
    }
  }, []);

  // State Hook orchestrating API queries, local states and URL syncing
  const {
    staff,
    totalStaff,
    summary,
    loading,
    error,
    roles,
    shifts,
    filters,
    setFilterValue,
    resetFilters,
    fetchStaff,
    addStaffMember,
    updateStaffMember,
    toggleStaffStatus,
    deleteStaffMember,
    addRole,
    renameRole,
    deleteRole,
  } = useStaff(restaurantId || "");

  // View modes: "table" (desktop default) vs "grid" (mobile/tablet default)
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Selection states
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [activeEditStaff, setActiveEditStaff] = useState<StaffMember | null>(null);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  // Deletion confirm states
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);

  // Responsiveness Auto-Switch View Modes
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 1024) {
        setViewMode("grid");
      } else {
        setViewMode("table");
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Search Input Debouncing 400ms (Task 3 spec)
  const [searchVal, setSearchVal] = useState(filters.search || "");
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilterValue("search", searchVal);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchVal, setFilterValue]);

  // Sync searchVal if filters change externally (e.g. on mount or URL restore)
  useEffect(() => {
    setSearchVal(filters.search || "");
  }, [filters.search]);

  // Derived pagination counts
  const totalPages = Math.ceil(totalStaff / (filters.page_size || 10)) || 1;

  // Pagination triggers
  const handlePrevPage = () => {
    if (filters.page && filters.page > 1) {
      setFilterValue("page", filters.page - 1);
    }
  };

  const handleNextPage = () => {
    if (filters.page && filters.page < totalPages) {
      setFilterValue("page", filters.page + 1);
    }
  };

  // Form Submissions
  const handleAddClick = () => {
    setActiveEditStaff(null);
    setIsStaffModalOpen(true);
  };

  const handleEditClick = (member: StaffMember) => {
    setActiveEditStaff(member);
    setIsStaffModalOpen(true);
  };

  const handleViewClick = (member: StaffMember) => {
    setSelectedStaff(member);
  };

  const handleFormSubmit = async (payload: Partial<StaffMember>) => {
    try {
      if (activeEditStaff) {
        await updateStaffMember(activeEditStaff.id, payload);
        // Sync active detail drawer if currently open
        if (selectedStaff && selectedStaff.id === activeEditStaff.id) {
          setSelectedStaff({ ...selectedStaff, ...payload } as StaffMember);
        }
      } else {
        await addStaffMember(payload);
      }
      setIsStaffModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTrigger = (member: StaffMember) => {
    setStaffToDelete(member);
  };

  const handleConfirmDelete = async () => {
    if (!staffToDelete) return;
    const member = staffToDelete;
    setStaffToDelete(null);

    // Call deletion logic inside hook supporting optimistic rollbacks
    await deleteStaffMember(member.id);

    // Close detail drawer if deleting active selected member
    if (selectedStaff && selectedStaff.id === member.id) {
      setSelectedStaff(null);
    }
  };

  const handleStatusChange = async (staffId: string, newStatus: "Active" | "Inactive" | "On Leave") => {
    await toggleStaffStatus(staffId, newStatus);
    // Sync selected drawer details immediately
    if (selectedStaff && selectedStaff.id === staffId) {
      setSelectedStaff((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up pb-10">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          {/* Breadcrumbs navigation */}
          <nav className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] font-medium mb-1 select-none">
            <Link href="/restaurant-admin" className="hover:text-[var(--color-accent-green)] transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="hover:text-[var(--color-accent-green)] transition-colors cursor-pointer">
              {restaurantName}
            </span>
            <span>/</span>
            <span className="text-[var(--color-text-primary)]">Staff Management</span>
          </nav>

          <h1 className="text-[length:var(--text-xl)] font-bold text-[var(--color-text-primary)] leading-tight">
            Staff Management
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Manage your team, roles, shifts, and performance
          </p>
        </div>

        {/* Primary CTA Add Staff Member */}
        <Button
          variant="success"
          onClick={handleAddClick}
          leftIcon={<Plus className="h-5 w-5" strokeWidth={2.5} />}
        >
          Add Staff Member
        </Button>
      </div>

      {/* Metric Statistics row (Total, On Shift, Off Shift, On Leave, Roles) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2 select-none">
        {/* Total Staff */}
        <div className="card-light !p-4 flex flex-col justify-between hover:shadow-xs border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[var(--color-blue-subtle)] text-[var(--color-blue)]">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-[var(--color-text-secondary)] text-[10px] uppercase font-bold tracking-wider">
                Total Staff
              </h3>
              <p className="text-lg font-bold text-[var(--color-text-primary)] mt-0.5">
                {summary.total_staff}
              </p>
            </div>
          </div>
        </div>

        {/* On Shift */}
        <div className="card-light !p-4 flex flex-col justify-between hover:shadow-xs border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[var(--color-accent-green-subtle)] text-[var(--color-accent-green)]">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-[var(--color-text-secondary)] text-[10px] uppercase font-bold tracking-wider">
                On Shift
              </h3>
              <p className="text-lg font-bold text-[var(--color-accent-green)] mt-0.5">
                {summary.on_shift}
              </p>
            </div>
          </div>
        </div>

        {/* Off Shift */}
        <div className="card-light !p-4 flex flex-col justify-between hover:shadow-xs border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[var(--color-danger-subtle)] text-[var(--color-danger)]">
              <UserX className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-[var(--color-text-secondary)] text-[10px] uppercase font-bold tracking-wider">
                Off Shift
              </h3>
              <p className="text-lg font-bold text-[var(--color-text-primary)] mt-0.5">
                {summary.off_shift}
              </p>
            </div>
          </div>
        </div>

        {/* On Leave */}
        <div className="card-light !p-4 flex flex-col justify-between hover:shadow-xs border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[var(--color-warning-subtle)] text-[var(--color-warning)]">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-[var(--color-text-secondary)] text-[10px] uppercase font-bold tracking-wider">
                On Leave
              </h3>
              <p className="text-lg font-bold text-[var(--color-warning)] mt-0.5">
                {summary.on_leave}
              </p>
            </div>
          </div>
        </div>

        {/* Total Roles */}
        <div className="card-light !p-4 flex flex-col justify-between hover:shadow-xs border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-[var(--color-text-secondary)] text-[10px] uppercase font-bold tracking-wider">
                Total Roles
              </h3>
              <p className="text-lg font-bold text-[var(--color-text-primary)] mt-0.5">
                {summary.total_roles}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Filtering Controls Box */}
      <div className="card-light !p-6 flex flex-col gap-5 mt-2 border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left search input */}
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search staff by name, email, phone, or role..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Right quick links & toggles */}
          <div className="flex flex-wrap items-center gap-4 select-none">
            {/* Manage roles text link */}
            <button
              type="button"
              onClick={() => setIsRoleModalOpen(true)}
              className="text-xs font-semibold text-[var(--color-accent-green)] hover:underline flex items-center gap-1.5 cursor-pointer mr-2"
            >
              <FolderOpen className="h-4 w-4" strokeWidth={1.5} />
              Manage Roles
            </button>

            {/* Desktop only view switcher toggles */}
            <div className="hidden lg:flex items-center border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-tertiary)] p-1 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === "table"
                    ? "bg-[var(--color-bg-secondary)] text-[var(--color-accent-green)] shadow-sm"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                }`}
                title="Table View"
              >
                <List className="h-4 w-4" strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-[var(--color-bg-secondary)] text-[var(--color-accent-green)] shadow-sm"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                }`}
                title="Grid View"
              >
                <Grid className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        {/* Filter controls row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1 border-t border-[var(--color-border)] select-none">
          {/* Roles Filter */}
          <Select
            label="Filter Role"
            value={filters.role || ""}
            onChange={(e) => setFilterValue("role", e.target.value)}
          >
            <option value="">All Roles</option>
            {roles.map((r) => (
              <option key={r.id} value={r.name}>
                {r.name}
              </option>
            ))}
          </Select>

          {/* Status Filter */}
          <Select
            label="Filter Status"
            value={filters.status || ""}
            onChange={(e) => setFilterValue("status", e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="On Leave">On Leave</option>
          </Select>

          {/* Shift Filter */}
          <Select
            label="Filter Shift Clockings"
            value={filters.shift || ""}
            onChange={(e) => setFilterValue("shift", e.target.value)}
          >
            <option value="">All Staff</option>
            <option value="On Shift">On Shift (Clocked In)</option>
            <option value="Off Shift">Off Shift (Clocked Out)</option>
          </Select>

          {/* Sorting */}
          <Select
            label="Sort Staff List By"
            value={filters.sort || "name_asc"}
            onChange={(e) => setFilterValue("sort", e.target.value)}
          >
            <option value="name_asc">Name: A to Z</option>
            <option value="name_desc">Name: Z to A</option>
            <option value="role">Role (Alphabetical)</option>
            <option value="date_joined_desc">Date Joined: Newest</option>
            <option value="date_joined_asc">Date Joined: Oldest</option>
          </Select>
        </div>

        {/* Reset filters row button */}
        {(filters.search || filters.role || filters.status || filters.shift || filters.sort !== "name_asc") && (
          <div className="flex justify-end pt-1 select-none">
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:underline"
            >
              Clear Active Filters
            </button>
          </div>
        )}

        {/* Content Listing Area */}
        <div className="mt-4 min-h-[350px]">
          {loading ? (
            /* Skeletons load per view mode */
            viewMode === "table" ? (
              <StaffTable
                staff={[]}
                roles={[]}
                shifts={[]}
                loading={true}
                onEdit={() => {}}
                onView={() => {}}
                onDelete={() => {}}
                onStatusChange={() => {}}
              />
            ) : (
              <StaffGrid
                staff={[]}
                roles={[]}
                shifts={[]}
                loading={true}
                onEdit={() => {}}
                onView={() => {}}
                onDelete={() => {}}
              />
            )
          ) : error ? (
            <div className="text-center py-16 text-xs text-[var(--color-danger)] font-bold">
              {error}
            </div>
          ) : staff.length === 0 ? (
            /* Empty State Displays */
            <div className="py-6 select-none">
              <EmptyState
                icon={Sparkles}
                title="No staff members found"
                description={
                  filters.search || filters.role || filters.status || filters.shift
                    ? "Try adjusting your filters or search terms to locate your team."
                    : "No staff members registered yet. Add your very first team member to get started!"
                }
                actionLabel={
                  filters.search || filters.role || filters.status || filters.shift
                    ? "Reset Search Filters"
                    : "Add First Staff Member"
                }
                onAction={
                  filters.search || filters.role || filters.status || filters.shift
                    ? resetFilters
                    : handleAddClick
                }
                buttonVariant="success"
              />
            </div>
          ) : viewMode === "table" ? (
            /* Table View Layout (Default Desktop) */
            <StaffTable
              staff={staff}
              roles={roles}
              shifts={shifts}
              loading={false}
              onEdit={handleEditClick}
              onView={handleViewClick}
              onDelete={handleDeleteTrigger}
              onStatusChange={handleStatusChange}
            />
          ) : (
            /* Grid View Layout (Tablet/Mobile Default) */
            <StaffGrid
              staff={staff}
              roles={roles}
              shifts={shifts}
              loading={false}
              onEdit={handleEditClick}
              onView={handleViewClick}
              onDelete={handleDeleteTrigger}
            />
          )}
        </div>

        {/* Pagination Footer */}
        {!loading && staff.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[var(--color-border)] select-none">
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-[var(--color-text-secondary)] font-semibold">Items per page:</span>
              <select
                value={filters.page_size || 10}
                onChange={(e) => setFilterValue("page_size", parseInt(e.target.value, 10))}
                className="h-8 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-2 text-xs font-semibold text-[var(--color-text-primary)] focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-xs text-[var(--color-text-muted)] font-medium">
                Showing {Math.min(staff.length, filters.page_size || 10)} of {totalStaff} team members
              </span>
            </div>

            {/* Pagination Controls buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={filters.page === 1}
                className="h-8 w-8 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)] disabled:opacity-40 transition-colors flex items-center justify-center cursor-pointer text-[var(--color-text-primary)]"
                title="Previous Page"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
              </button>
              <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                Page {filters.page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={handleNextPage}
                disabled={filters.page === totalPages}
                className="h-8 w-8 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)] disabled:opacity-40 transition-colors flex items-center justify-center cursor-pointer text-[var(--color-text-primary)]"
                title="Next Page"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Profile Dialog Modal */}
      <StaffModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        onSubmit={handleFormSubmit}
        editMember={activeEditStaff}
        roles={roles}
        shifts={shifts}
        restaurantId={restaurantId}
        onAddRole={addRole}
      />

      {/* Role Manager Lightweight Dialog Modal */}
      <RoleModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        roles={roles}
        onAddRole={addRole}
        onRenameRole={renameRole}
        onDeleteRole={deleteRole}
      />

      {/* Side-sheet Detail Profile Drawer */}
      <StaffDrawer
        member={selectedStaff}
        roles={roles}
        shifts={shifts}
        onClose={() => setSelectedStaff(null)}
        onEdit={handleEditClick}
        onStatusChange={handleStatusChange}
      />

      {/* Confirmation Dialog: Delete staff member */}
      <Modal
        open={staffToDelete !== null}
        onClose={() => setStaffToDelete(null)}
        title={staffToDelete ? `Remove ${staffToDelete.first_name} ${staffToDelete.last_name}?` : "Remove Staff Member?"}
        description="This will permanently remove them from your team and revoke all active credentials. This action cannot be undone."
        footer={
          <>
            <Button variant="secondary" onClick={() => setStaffToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Remove
            </Button>
          </>
        }
        size="md"
      >
        <div className="flex items-center gap-3 text-[var(--color-danger)] p-1">
          <AlertTriangle className="h-6 w-6 shrink-0" strokeWidth={1.5} />
          <span className="text-xs font-semibold text-[var(--color-text-primary)]">
            Warning: Removing this member will invalidate all their tables assignments and active clock records.
          </span>
        </div>
      </Modal>
    </div>
  );
}
