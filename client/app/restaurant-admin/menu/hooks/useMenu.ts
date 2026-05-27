"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { MenuItem, Category, MenuFilters } from "../types";
import { menuApi } from "../services/menuApi";
import { debounce } from "../../../dashboard/utils/debounce";
import { toast } from "react-hot-toast";

export default function useMenu(restaurantId: string) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  const [filters, setFilters] = useState<MenuFilters>({
    q: "",
    category: "",
    status: "",
    sort: "name_asc",
    page: 1,
    page_size: 10,
  });

  // Track debounced functions per item ID to isolate stepper updates
  const debounceMapRef = useRef<Record<string, ReturnType<typeof debounce>>>({});

  // ─── Fetch Categories ───
  const fetchCategories = useCallback(async () => {
    if (!restaurantId) return;
    setCategoriesLoading(true);
    try {
      const data = await menuApi.getCategories(restaurantId);
      setCategories(data);
      setCategoriesError("");
    } catch (err: any) {
      console.error("Error fetching categories:", err);
      setCategoriesError("Failed to load categories");
    } finally {
      setCategoriesLoading(false);
    }
  }, [restaurantId]);

  // ─── Fetch Menu Items ───
  const fetchMenu = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const data = await menuApi.getMenu(restaurantId, filters);
      setItems(data.results);
      setTotalItems(data.total);
      setError("");
    } catch (err: any) {
      console.error("Error fetching menu items:", err);
      setError("Failed to load menu items");
    } finally {
      setLoading(false);
    }
  }, [restaurantId, filters]);

  // Fetch menu on filters change
  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Cleanup pending debounced functions on unmount
  useEffect(() => {
    const map = debounceMapRef.current;
    return () => {
      Object.values(map).forEach((fn) => fn.cancel());
    };
  }, []);

  // ─── Set Individual Filters ───
  const setFilterValue = useCallback((key: keyof MenuFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      // Reset page back to 1 if filter is changing
      page: key === "page" ? value : 1,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      q: "",
      category: "",
      status: "",
      sort: "name_asc",
      page: 1,
      page_size: 10,
    });
  }, []);

  // ─── Mutation Helpers ───

  // 1. Optimistic Status Toggle
  const toggleItemStatus = useCallback(async (itemId: string, failSimulated = false) => {
    const target = items.find((i) => i.id === itemId);
    if (!target) return;

    const oldStatus = target.status;
    const newStatus = oldStatus === "Active" ? "Inactive" : "Active";

    // Apply immediate local update
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, status: newStatus } : i))
    );

    const toastId = toast.loading("Updating status...");
    try {
      await menuApi.updateMenuItem(restaurantId, itemId, {
        status: newStatus,
        fail: failSimulated,
      });
      toast.success("Status updated successfully", { id: toastId });
    } catch (err: any) {
      // Revert state on failure
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, status: oldStatus } : i))
      );
      toast.error(err?.response?.data?.detail || "Failed to toggle status", { id: toastId });
    }
  }, [items, restaurantId]);

  // 2. Debounced & Optimistic Quantity Stepper Update
  const updateItemQuantity = useCallback((itemId: string, newQty: number, failSimulated = false) => {
    const target = items.find((i) => i.id === itemId);
    if (!target) return;

    const oldQty = target.quantity;
    const oldStatus = target.status;

    // Apply inline status rule locally:
    // - If quantity reaches 0, status goes to "Out of Stock"
    // - If quantity rises from 0 and it was Out of Stock, status goes to "Active"
    let newStatus = oldStatus;
    if (newQty <= 0) {
      newStatus = "Out of Stock";
    } else if (oldQty <= 0 && newQty > 0 && oldStatus === "Out of Stock") {
      newStatus = "Active";
    }

    // Apply immediate local update
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId ? { ...i, quantity: newQty, status: newStatus } : i
      )
    );

    // Cancel previous debounce for this item if active
    if (debounceMapRef.current[itemId]) {
      debounceMapRef.current[itemId].cancel();
    }

    // Define debounced worker
    const updateWorker = async (qty: number) => {
      try {
        await menuApi.updateMenuItem(restaurantId, itemId, {
          quantity: qty,
          fail: failSimulated,
        });
      } catch (err: any) {
        // Rollback state on failure
        setItems((prev) =>
          prev.map((i) =>
            i.id === itemId ? { ...i, quantity: oldQty, status: oldStatus } : i
          )
        );
        toast.error(err?.response?.data?.detail || "Failed to sync quantity");
      }
    };

    // Create and schedule debounced trigger (400ms)
    const debouncedFn = debounce(updateWorker, 400);
    debounceMapRef.current[itemId] = debouncedFn;
    debouncedFn(newQty);
  }, [items, restaurantId]);

  // 3. Optimistic Single Deletion
  const deleteItem = useCallback(async (itemId: string, failSimulated = false) => {
    const index = items.findIndex((i) => i.id === itemId);
    if (index === -1) return;

    const targetItem = items[index];
    const previousItems = [...items];

    // Optimistically remove from local state
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    setTotalItems((prev) => Math.max(0, prev - 1));

    const toastId = toast.loading(`Deleting ${targetItem.name}...`);
    try {
      await menuApi.deleteMenuItem(restaurantId, itemId, failSimulated);
      toast.success("Item deleted successfully", { id: toastId });
    } catch (err: any) {
      // Revert local state
      setItems(previousItems);
      setTotalItems(previousItems.length);
      toast.error(err?.response?.data?.detail || "Failed to delete item", { id: toastId });
    }
  }, [items, restaurantId]);

  // 4. Optimistic Bulk Deletion
  const bulkDeleteItems = useCallback(async (itemIds: string[], failSimulated = false) => {
    const previousItems = [...items];
    const previousTotal = totalItems;

    // Optimistically remove matching elements
    setItems((prev) => prev.filter((i) => !itemIds.includes(i.id)));
    setTotalItems((prev) => Math.max(0, prev - itemIds.length));

    const toastId = toast.loading(`Deleting ${itemIds.length} items...`);
    try {
      await menuApi.bulkDeleteMenuItems(restaurantId, itemIds, failSimulated);
      toast.success("Selected items deleted", { id: toastId });
    } catch (err: any) {
      // Revert local state
      setItems(previousItems);
      setTotalItems(previousTotal);
      toast.error(err?.response?.data?.detail || "Failed to bulk delete items", { id: toastId });
    }
  }, [items, totalItems, restaurantId]);

  // ─── Category Mutations ───
  const addCategory = useCallback(async (name: string) => {
    const toastId = toast.loading(`Adding category "${name}"...`);
    try {
      const newCat = await menuApi.createCategory(restaurantId, name);
      setCategories((prev) => [...prev, newCat]);
      toast.success("Category created", { id: toastId });
      return newCat;
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to create category", { id: toastId });
      throw err;
    }
  }, [restaurantId]);

  const renameCategory = useCallback(async (catId: string, newName: string) => {
    const target = categories.find((c) => c.id === catId);
    if (!target) return;
    const oldName = target.name;

    const toastId = toast.loading(`Renaming to "${newName}"...`);
    try {
      const updated = await menuApi.updateCategory(restaurantId, catId, newName);
      setCategories((prev) =>
        prev.map((c) => (c.id === catId ? updated : c))
      );

      // Sync menu categories immediately to prevent UI mismatch
      setItems((prev) =>
        prev.map((item) =>
          item.category === oldName ? { ...item, category: newName } : item
        )
      );

      toast.success("Category renamed", { id: toastId });
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to rename category", { id: toastId });
      throw err;
    }
  }, [categories, restaurantId]);

  const removeCategory = useCallback(async (catId: string) => {
    const toastId = toast.loading("Deleting category...");
    try {
      await menuApi.deleteCategory(restaurantId, catId);
      setCategories((prev) => prev.filter((c) => c.id !== catId));
      toast.success("Category deleted", { id: toastId });
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to delete category", { id: toastId });
    }
  }, [restaurantId]);

  return {
    items,
    totalItems,
    loading,
    error,
    categories,
    categoriesLoading,
    categoriesError,
    filters,
    setFilterValue,
    resetFilters,
    fetchMenu,
    fetchCategories,
    toggleItemStatus,
    updateItemQuantity,
    deleteItem,
    bulkDeleteItems,
    addCategory,
    renameCategory,
    removeCategory,
  };
}
