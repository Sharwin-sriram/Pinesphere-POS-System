"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  LayoutGrid,
  List,
  Plus,
  Trash2,
  FolderOpen,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useMenu from "./hooks/useMenu";
import MenuStats from "./components/MenuStats";
import MenuTable from "./components/MenuTable";
import MenuGrid from "./components/MenuGrid";
import MenuItemModal from "./components/MenuItemModal";
import CategoryPanel from "./components/CategoryPanel";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { MenuItem } from "./types";
import { toast } from "react-hot-toast";
import authService from "../../lib/authService";
import { fetchRestaurants } from "../../dashboard/services/restaurantsApi";

export default function MenuManagementPage() {
  const router = useRouter();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string>("Restaurant");
  const [restaurantLookupDone, setRestaurantLookupDone] = useState(false);
  const [restaurantLookupError, setRestaurantLookupError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const resolveRestaurantContext = async () => {
      try {
        const profileResult = await authService.getProfile();
        const user = profileResult.success ? profileResult.data : authService.getCurrentUser();
        
        console.log("User profile loaded:", user);
        
        const resolvedRestaurantId =
          user?.restaurant_id ??
          user?.restaurant?.id ??
          user?.restaurant?.restaurant_id ??
          user?.restaurantId;

        let resolvedRestaurantName = user?.restaurant_name || user?.restaurant?.name || user?.name || "Restaurant";

        if (!resolvedRestaurantId && user?.email) {
          console.log("No restaurant_id found, attempting to fetch restaurants by email...");
          const response = await fetchRestaurants({ page_size: 1000, sort: "name_asc" });
          const ownedRestaurant = response.results.find(
            (restaurant) => restaurant.email?.toLowerCase() === user.email.toLowerCase()
          );

          if (ownedRestaurant) {
            if (!mounted) return;
            console.log("Found restaurant by email:", ownedRestaurant);
            setRestaurantId(ownedRestaurant.id);
            setRestaurantName(ownedRestaurant.name || resolvedRestaurantName);
            setRestaurantLookupDone(true);
            return;
          }
        }

        if (!mounted) return;

        if (!resolvedRestaurantId) {
          console.error("Unable to resolve restaurant ID from user:", user);
          setRestaurantLookupError("Unable to load restaurant information");
          router.replace("/restaurant-admin");
          return;
        }

        console.log("Restaurant ID resolved:", resolvedRestaurantId);
        setRestaurantId(String(resolvedRestaurantId));
        setRestaurantName(resolvedRestaurantName);
      } catch (error) {
        console.error("Error resolving restaurant context:", error);
        if (!mounted) return;
        setRestaurantLookupError("Unable to load restaurant information");
        router.replace("/restaurant-admin");
      } finally {
        if (mounted) {
          setRestaurantLookupDone(true);
        }
      }
    };

    resolveRestaurantContext();

    return () => {
      mounted = false;
    };
  }, [router]);

  const {
    items,
    totalItems,
    loading,
    error,
    categories,
    categoriesLoading,
    filters,
    setFilterValue,
    resetFilters,
    toggleItemStatus,
    updateItemQuantity,
    deleteItem,
    bulkDeleteItems,
    addCategory,
    renameCategory,
    removeCategory,
  } = useMenu(restaurantId || "");

  // View settings: table vs grid
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Selection states for bulk deletion
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isCategoryPanelOpen, setIsCategoryPanelOpen] = useState(false);
  const [activeEditItem, setActiveEditItem] = useState<MenuItem | null>(null);

  // Deletion confirm modal state
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Auto-switch view modes on screen resize (mobile default is grid)
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 768) {
        setViewMode("grid");
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sync selection check when list items update
  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => items.some((item) => item.id === id)));
  }, [items]);

  // Search input with 400ms debounce
  const [searchVal, setSearchVal] = useState(filters.q || "");
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilterValue("q", searchVal);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchVal, setFilterValue]);

  // Bulk selectors
  const handleSelectToggle = (itemId: string) => {
    setSelectedIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleSelectAllToggle = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((i) => i.id));
    }
  };

  // Create & Edit form handlers
  const handleAddClick = () => {
    setActiveEditItem(null);
    setIsItemModalOpen(true);
  };

  const handleEditClick = (item: MenuItem) => {
    setActiveEditItem(item);
    setIsItemModalOpen(true);
  };

  const handleFormSubmit = async (payload: Partial<MenuItem>) => {
    const isEdit = !!activeEditItem;
    const toastId = toast.loading(isEdit ? "Updating item..." : "Creating item...");

    try {
      const { menuApi } = await import("./services/menuApi");
      if (isEdit && activeEditItem) {
        await menuApi.updateMenuItem(restaurantId, activeEditItem.id, payload);
        toast.success("Menu item updated successfully", { id: toastId });
      } else {
        await menuApi.createMenuItem(restaurantId, payload);
        toast.success("Menu item created successfully", { id: toastId });
      }
      // Force reload menu data
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.detail || "Failed to save menu item", { id: toastId });
      throw err;
    }
  };

  // Deletion confirm triggers
  const handleDeleteTrigger = (itemId: string) => {
    setItemToDelete(itemId);
    setIsBulkDeleting(false);
    setShowDeleteConfirm(true);
  };

  const handleBulkDeleteTrigger = () => {
    setIsBulkDeleting(true);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteConfirm(false);
    if (isBulkDeleting) {
      const ids = [...selectedIds];
      setSelectedIds([]);
      await bulkDeleteItems(ids);
    } else if (itemToDelete) {
      const id = itemToDelete;
      setItemToDelete(null);
      await deleteItem(id);
    }
  };

  // Derived deletion text
  const deleteConfirmTitle = useMemo(() => {
    if (isBulkDeleting) {
      return `Delete ${selectedIds.length} Selected Items?`;
    }
    const item = items.find((i) => i.id === itemToDelete);
    return item ? `Delete "${item.name}"?` : "Delete Menu Item?";
  }, [isBulkDeleting, selectedIds, itemToDelete, items]);

  const deleteConfirmBody = useMemo(() => {
    if (isBulkDeleting) {
      return "Are you sure you want to delete all selected items? This action cannot be undone and will permanently remove them from your menu.";
    }
    return "This action cannot be undone. The item will be permanently removed from your menu.";
  }, [isBulkDeleting]);

  // Derived counts for metrics cards
  const totalPages = Math.ceil(totalItems / (filters.page_size || 10)) || 1;

  // Pagination controls
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

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up pb-10">
      {/* Show loading state while restaurant ID is being fetched */}
      {!restaurantLookupDone && (
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-[var(--color-text-secondary)]">Loading restaurant menu...</p>
        </div>
      )}

      {restaurantLookupDone && restaurantLookupError && (
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-[var(--color-text-secondary)]">{restaurantLookupError}</p>
        </div>
      )}

      {restaurantId && restaurantLookupDone && !restaurantLookupError && (
        <>
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          {/* Breadcrumb links */}
          <nav className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] font-medium mb-1">
            <Link href="/restaurant-admin" className="hover:text-[var(--color-accent-green)] transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="hover:text-[var(--color-accent-green)] transition-colors cursor-pointer">
              {restaurantName}
            </span>
            <span>/</span>
            <span className="text-[var(--color-text-primary)]">Menu Management</span>
          </nav>

          <h1 className="text-[length:var(--text-xl)] font-bold text-[var(--color-text-primary)] leading-tight">
            Menu Management
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Configure dishes, categories, pricing, stock levels, and schedules.
          </p>
        </div>

        {/* Primary CTA + Add Menu Item */}
        <Button
          variant="success"
          onClick={handleAddClick}
          leftIcon={<Plus className="h-5 w-5" strokeWidth={2.5} />}
        >
          Add Menu Item
        </Button>
      </div>

      {/* Metrics stats section */}
      <MenuStats items={items} categories={categories} />

      {/* Main Controls Panel */}
      <div className="card-light !p-6 flex flex-col gap-5 mt-2">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Search bar (left) */}
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search by name, description, or tags..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Quick links & view switches (right) */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Manage categories text link */}
            <button
              type="button"
              onClick={() => setIsCategoryPanelOpen(true)}
              className="text-xs font-semibold text-[var(--color-accent-green)] hover:underline flex items-center gap-1.5 cursor-pointer mr-2"
            >
              <FolderOpen className="h-4 w-4" strokeWidth={1.5} />
              Manage Categories
            </button>

            {/* Desktop-only view mode toggle icons */}
            <div className="hidden md:flex items-center border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-tertiary)] p-1 shrink-0 select-none">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === "table"
                    ? "bg-[var(--color-bg-secondary)] text-[var(--color-accent-green)] shadow-xs"
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
                    ? "bg-[var(--color-bg-secondary)] text-[var(--color-accent-green)] shadow-xs"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                }`}
                title="Grid Card View"
              >
                <LayoutGrid className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Sort Selection Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1 border-t border-[var(--color-border)]">
          {/* Category Dropdown */}
          <Select
            label="Filter Category"
            value={filters.category || ""}
            onChange={(e) => setFilterValue("category", e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </Select>

          {/* Status Dropdown */}
          <Select
            label="Filter Status"
            value={filters.status || ""}
            onChange={(e) => setFilterValue("status", e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Out of Stock">Out of Stock</option>
          </Select>

          {/* Sort Dropdown */}
          <Select
            label="Sort Items By"
            value={filters.sort || "name_asc"}
            onChange={(e) => setFilterValue("sort", e.target.value)}
          >
            <option value="name_asc">Name: A to Z</option>
            <option value="name_desc">Name: Z to A</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="updated_desc">Recently Updated</option>
          </Select>

          {/* Bulk Actions Button Container */}
          <div className="flex items-end">
            {selectedIds.length > 0 ? (
              <Button
                variant="danger"
                onClick={handleBulkDeleteTrigger}
                className="w-full h-10 select-none animate-shimmer"
                leftIcon={<Trash2 className="h-4.5 w-4.5" strokeWidth={2} />}
              >
                Delete Selected ({selectedIds.length})
              </Button>
            ) : (
              <Button variant="secondary" onClick={resetFilters} className="w-full h-10">
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Data Display Content Container */}
        <div className="mt-4 min-h-[300px]">
          {loading ? (
            // Skeleton loader matches view layouts
            <div className="flex flex-col gap-4">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg animate-pulse" />
              <Skeleton className="h-16 w-full rounded-lg animate-pulse" />
              <Skeleton className="h-16 w-full rounded-lg animate-pulse" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-sm text-[var(--color-danger)] font-medium">
              {error}
            </div>
          ) : items.length === 0 ? (
            // Empty view states
            <div className="py-6">
              <EmptyState
                icon={Sparkles}
                title="No menu items found"
                description={
                  filters.q || filters.category || filters.status
                    ? "Try adjusting your filters or search terms to locate your items."
                    : "Your restaurant menu is currently empty. Get started by creating your very first dish!"
                }
                actionLabel={
                  filters.q || filters.category || filters.status ? "Reset Filters" : "Add Your First Item"
                }
                onAction={
                  filters.q || filters.category || filters.status ? resetFilters : handleAddClick
                }
                buttonVariant="success"
              />
            </div>
          ) : viewMode === "table" ? (
            // Desktop Table Layout
            <MenuTable
              items={items}
              selectedIds={selectedIds}
              onSelectToggle={handleSelectToggle}
              onSelectAllToggle={handleSelectAllToggle}
              onStatusToggle={toggleItemStatus}
              onQuantityUpdate={updateItemQuantity}
              onEdit={handleEditClick}
              onDelete={handleDeleteTrigger}
            />
          ) : (
            // Card Grid Layout (Mobile / Tablet default)
            <MenuGrid
              items={items}
              onStatusToggle={toggleItemStatus}
              onQuantityUpdate={updateItemQuantity}
              onEdit={handleEditClick}
              onDelete={handleDeleteTrigger}
            />
          )}
        </div>

        {/* Pagination Footer */}
        {!loading && items.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[var(--color-border)] select-none">
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-[var(--color-text-secondary)] font-medium">Items per page:</span>
              <select
                value={filters.page_size || 10}
                onChange={(e) => setFilterValue("page_size", parseInt(e.target.value, 10))}
                className="h-8 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-2 text-xs font-semibold text-[var(--color-text-primary)] focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-xs text-[var(--color-text-muted)]">
                Showing {Math.min(items.length, filters.page_size || 10)} of {totalItems} items
              </span>
            </div>

            {/* Pagination Controls */}
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

      {/* Create / Edit Form Modal */}
      <MenuItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSubmit={handleFormSubmit}
        categories={categories}
        onAddCategory={addCategory}
        editItem={activeEditItem}
      />

      {/* Category Management lightweight overlay */}
      <CategoryPanel
        isOpen={isCategoryPanelOpen}
        onClose={() => setIsCategoryPanelOpen(false)}
        categories={categories}
        onAddCategory={addCategory}
        onRenameCategory={renameCategory}
        onDeleteCategory={removeCategory}
      />

      {/* Delete Item Confirmation dialog Modal */}
      <Modal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title={deleteConfirmTitle}
        description={deleteConfirmBody}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </>
        }
        size="md"
      >
        <div className="flex items-center gap-3 text-[var(--color-danger)] p-1">
          <AlertTriangle className="h-6 w-6 shrink-0" strokeWidth={1.5} />
          <span className="text-sm font-semibold text-[var(--color-text-primary)]">
            This action is destructive and cannot be undone.
          </span>
        </div>
      </Modal>
        </>
      )}
    </div>
  );
}
