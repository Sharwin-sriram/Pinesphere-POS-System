"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Plus, X, AlertTriangle, Check, ChevronDown } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import ImageUploadZone from "./ImageUploadZone";
import { MenuItem, Category } from "../types";
import { toast } from "react-hot-toast";

interface MenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<MenuItem>) => Promise<void>;
  categories: Category[];
  onAddCategory: (name: string) => Promise<Category>;
  editItem?: MenuItem | null;
}

const AVAILABLE_TAGS = ["Veg", "Non-Veg", "Vegan", "Spicy", "Bestseller", "New"];
const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function MenuItemModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  onAddCategory,
  editItem,
}: MenuItemModalProps) {
  // Form controlled state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState("5");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableDays, setAvailableDays] = useState<string[]>(DAYS_OF_WEEK);
  const [timeFrom, setTimeFrom] = useState("00:00");
  const [timeTo, setTimeTo] = useState("23:59");

  // Category Selector Dropdown State
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const categorySelectorRef = useRef<HTMLDivElement | null>(null);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Populate form if editing
  useEffect(() => {
    if (editItem && isOpen) {
      setName(editItem.name || "");
      setDescription(editItem.description || "");
      setCategory(editItem.category || "");
      setPrice(editItem.price ? String(editItem.price) : "");
      setDiscountPrice(editItem.discount_price ? String(editItem.discount_price) : "");
      setQuantity(editItem.quantity !== undefined ? String(editItem.quantity) : "");
      setLowStockThreshold(editItem.low_stock_threshold !== undefined ? String(editItem.low_stock_threshold) : "5");
      setStatus(editItem.status === "Inactive" ? "Inactive" : "Active");
      setImageUrl(editItem.image_url || null);
      setSelectedTags(editItem.tags || []);
      setAvailableDays(editItem.available_days || DAYS_OF_WEEK);
      setTimeFrom(editItem.available_hours?.from || "00:00");
      setTimeTo(editItem.available_hours?.to || "23:59");
      setErrors({});
    } else if (isOpen) {
      // Reset form for creation
      setName("");
      setDescription("");
      setCategory("");
      setPrice("");
      setDiscountPrice("");
      setQuantity("");
      setLowStockThreshold("5");
      setStatus("Active");
      setImageUrl(null);
      setSelectedTags([]);
      setAvailableDays(DAYS_OF_WEEK);
      setTimeFrom("00:00");
      setTimeTo("23:59");
      setErrors({});
    }
  }, [editItem, isOpen]);

  // Handle outside clicks to close category select combobox
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categorySelectorRef.current && !categorySelectorRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
        setIsAddingNewCategory(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute form dirty state
  const isDirty = useMemo(() => {
    if (editItem) {
      const hasHoursChanged =
        timeFrom !== (editItem.available_hours?.from || "00:00") ||
        timeTo !== (editItem.available_hours?.to || "23:59");

      return (
        name !== (editItem.name || "") ||
        description !== (editItem.description || "") ||
        category !== (editItem.category || "") ||
        price !== (editItem.price ? String(editItem.price) : "") ||
        discountPrice !== (editItem.discount_price ? String(editItem.discount_price) : "") ||
        quantity !== (editItem.quantity !== undefined ? String(editItem.quantity) : "") ||
        lowStockThreshold !== (editItem.low_stock_threshold !== undefined ? String(editItem.low_stock_threshold) : "5") ||
        status !== (editItem.status === "Inactive" ? "Inactive" : "Active") ||
        imageUrl !== (editItem.image_url || null) ||
        JSON.stringify(selectedTags.sort()) !== JSON.stringify((editItem.tags || []).sort()) ||
        JSON.stringify(availableDays.sort()) !== JSON.stringify((editItem.available_days || DAYS_OF_WEEK).sort()) ||
        hasHoursChanged
      );
    }

    return (
      name !== "" ||
      description !== "" ||
      category !== "" ||
      price !== "" ||
      discountPrice !== "" ||
      quantity !== "" ||
      lowStockThreshold !== "5" ||
      status !== "Active" ||
      imageUrl !== null ||
      selectedTags.length > 0 ||
      availableDays.length !== DAYS_OF_WEEK.length ||
      timeFrom !== "00:00" ||
      timeTo !== "23:59"
    );
  }, [
    name,
    description,
    category,
    price,
    discountPrice,
    quantity,
    lowStockThreshold,
    status,
    imageUrl,
    selectedTags,
    availableDays,
    timeFrom,
    timeTo,
    editItem,
  ]);

  // Compute discount percentage
  const discountPercentage = useMemo(() => {
    const p = parseFloat(price);
    const d = parseFloat(discountPrice);
    if (!isNaN(p) && !isNaN(d) && p > 0 && d > 0 && d < p) {
      const percent = ((p - d) / p) * 100;
      return Math.round(percent);
    }
    return null;
  }, [price, discountPrice]);

  // ─── Inline Form Validations ───
  const validateField = (field: string, value: string): string => {
    switch (field) {
      case "name":
        if (!value.trim()) return "Item name is required";
        if (value.trim().length < 2) return "Name must be at least 2 characters";
        if (value.trim().length > 100) return "Name cannot exceed 100 characters";
        return "";
      case "description":
        if (value.length > 500) return "Description cannot exceed 500 characters";
        return "";
      case "category":
        if (!value) return "Category is required";
        return "";
      case "price": {
        if (!value) return "Price is required";
        const p = parseFloat(value);
        if (isNaN(p) || p < 0) return "Price must be a valid positive number";
        return "";
      }
      case "discountPrice": {
        if (!value) return "";
        const dp = parseFloat(value);
        const p = parseFloat(price);
        if (isNaN(dp) || dp < 0) return "Discount price must be a valid positive number";
        if (!isNaN(p) && dp >= p) return "Discount price must be less than base price";
        return "";
      }
      case "quantity": {
        if (!value) return "Quantity is required";
        const q = parseInt(value, 10);
        if (isNaN(q) || q < 0) return "Quantity must be 0 or greater";
        return "";
      }
      case "lowStockThreshold": {
        if (!value) return "";
        const l = parseInt(value, 10);
        if (isNaN(l) || l < 0) return "Low stock threshold must be 0 or greater";
        return "";
      }
      default:
        return "";
    }
  };

  const handleBlur = (field: string, value: string) => {
    const errorMsg = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: errorMsg }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {
      name: validateField("name", name),
      description: validateField("description", description),
      category: validateField("category", category),
      price: validateField("price", price),
      discountPrice: validateField("discountPrice", discountPrice),
      quantity: validateField("quantity", quantity),
      lowStockThreshold: validateField("lowStockThreshold", lowStockThreshold),
    };

    // Clean up empty error values
    const finalErrors: Record<string, string> = {};
    Object.keys(newErrors).forEach((key) => {
      if (newErrors[key]) finalErrors[key] = newErrors[key];
    });

    setErrors(finalErrors);
    return Object.keys(finalErrors).length === 0;
  };

  const handleCancelClick = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  const handleConfirmDiscard = () => {
    setShowDiscardConfirm(false);
    onClose();
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please correct the form errors before saving");
      return;
    }

    setIsSubmitting(true);
    try {
      const computedStatus = parseInt(quantity, 10) <= 0 ? "Out of Stock" : status;

      const payload: Partial<MenuItem> = {
        name: name.trim(),
        description: description.trim(),
        category: category,
        price: parseFloat(price),
        discount_price: discountPrice ? parseFloat(discountPrice) : null,
        is_veg: selectedTags.includes("Veg") ? true : !selectedTags.includes("Non-Veg"),
        image_url: imageUrl,
        tags: selectedTags,
        quantity: parseInt(quantity, 10),
        low_stock_threshold: parseInt(lowStockThreshold, 10) || 5,
        status: computedStatus as any,
        available_days: availableDays,
        available_hours: {
          from: timeFrom,
          to: timeTo,
        },
      };

      await onSubmit(payload);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Searchable Combobox Category Handlers ───
  const filteredCategories = useMemo(() => {
    return categories.filter((c) =>
      c.name.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categories, categorySearch]);

  const handleSelectCategory = (catName: string) => {
    setCategory(catName);
    setErrors((prev) => ({ ...prev, category: "" }));
    setIsCategoryDropdownOpen(false);
  };

  const handleAddNewCategorySubmit = async () => {
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) {
      toast.error("Category name cannot be empty");
      return;
    }
    if (categories.some((c) => c.name.toLowerCase() === trimmedName.toLowerCase())) {
      toast.error("Category already exists");
      return;
    }

    try {
      const created = await onAddCategory(trimmedName);
      setCategory(created.name);
      setErrors((prev) => ({ ...prev, category: "" }));
      setIsAddingNewCategory(false);
      setNewCategoryName("");
      setIsCategoryDropdownOpen(false);
    } catch (err) {
      // toast alerts handled in useMenu
    }
  };

  // ─── Tag Multi-select Badges ───
  const handleTagToggle = (tag: string) => {
    // If selecting Veg, automatically deselect Non-Veg and vice versa
    setSelectedTags((prev) => {
      let next = prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag];
      if (tag === "Veg" && next.includes("Veg")) {
        next = next.filter((t) => t !== "Non-Veg");
      } else if (tag === "Non-Veg" && next.includes("Non-Veg")) {
        next = next.filter((t) => t !== "Veg");
      }
      return next;
    });
  };

  // ─── Available Days Badges ───
  const handleDayToggle = (day: string) => {
    setAvailableDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const selectAllDays = () => setAvailableDays(DAYS_OF_WEEK);
  const deselectAllDays = () => setAvailableDays([]);

  const footer = (
    <>
      <Button variant="secondary" onClick={handleCancelClick} disabled={isSubmitting}>
        Cancel
      </Button>
      <Button variant="success" onClick={handleFormSubmit} loading={isSubmitting}>
        {editItem ? "Update Item" : "Save Item"}
      </Button>
    </>
  );

  return (
    <>
      <Modal
        open={isOpen}
        onClose={handleCancelClick}
        title={editItem ? "Edit Menu Item" : "Add Menu Item"}
        description={editItem ? "Modify the properties of your menu item." : "Create a new dish or beverage for your menu."}
        footer={footer}
        size="lg"
        closeOnOverlayClick={false}
      >
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-[var(--color-text-muted)] font-semibold border-b border-[var(--color-border)] pb-2 mb-4">
              Basic Information
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Item Name *"
                placeholder="e.g. Garlic Herb Chicken"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                }}
                onBlur={() => handleBlur("name", name)}
                error={errors.name}
                required
              />

              {/* Searchable Combobox Category Selector */}
              <div className="relative flex flex-col" ref={categorySelectorRef}>
                <span className="text-[length:var(--text-sm)] font-medium text-[var(--color-text-secondary)] mb-2">
                  Category *
                </span>
                <div
                  onClick={() => setIsCategoryDropdownOpen((prev) => !prev)}
                  className={`h-10 w-full rounded-md border bg-[var(--color-bg-tertiary)] px-4 flex items-center justify-between cursor-pointer text-[length:var(--text-base)] text-[var(--color-text-primary)] transition duration-150 ${
                    errors.category ? "border-[var(--color-danger)]" : "border-[var(--color-border)]"
                  }`}
                >
                  <span className={category ? "" : "text-[var(--color-text-muted)]"}>
                    {category || "Select a category"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-[var(--color-text-muted)]" strokeWidth={1.5} />
                </div>
                {errors.category && (
                  <p className="mt-2 text-[length:var(--text-sm)] text-[var(--color-danger)]">
                    {errors.category}
                  </p>
                )}

                {/* Combobox Dropdown Panel */}
                {isCategoryDropdownOpen && (
                  <div className="absolute top-[72px] left-0 w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg shadow-lg z-50 p-2 max-h-60 overflow-y-auto flex flex-col gap-2">
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-8 w-full border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] rounded-md px-3 text-xs text-[var(--color-text-primary)] focus:outline-none"
                    />

                    <div className="flex flex-col gap-1 overflow-y-auto max-h-36">
                      {filteredCategories.length === 0 ? (
                        <p className="text-[10px] text-[var(--color-text-muted)] p-2 text-center">
                          No matching categories
                        </p>
                      ) : (
                        filteredCategories.map((cat) => (
                          <div
                            key={cat.id}
                            onClick={() => handleSelectCategory(cat.name)}
                            className="h-8 px-3 rounded-md hover:bg-[var(--color-bg-tertiary)] flex items-center justify-between text-xs text-[var(--color-text-primary)] cursor-pointer"
                          >
                            <span>{cat.name}</span>
                            {category === cat.name && (
                              <Check className="h-3.5 w-3.5 text-[var(--color-accent-green)]" strokeWidth={1.5} />
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    <div className="border-t border-[var(--color-border)] pt-2 mt-1">
                      {isAddingNewCategory ? (
                        <div className="flex gap-1.5 items-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            placeholder="New category name..."
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            className="h-8 flex-1 border border-[var(--color-border)] rounded-md px-2.5 text-xs text-[var(--color-text-primary)] focus:outline-none"
                          />
                          <Button size="sm" variant="success" onClick={handleAddNewCategorySubmit}>
                            Add
                          </Button>
                          <button
                            type="button"
                            onClick={() => setIsAddingNewCategory(false)}
                            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                          >
                            <X className="h-4 w-4" strokeWidth={1.5} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsAddingNewCategory(true);
                          }}
                          className="w-full h-8 flex items-center justify-center gap-1.5 hover:bg-[var(--color-bg-tertiary)] text-xs text-[var(--color-accent-green)] font-semibold rounded-md"
                        >
                          <Plus className="h-4 w-4" strokeWidth={1.5} />
                          Add new category
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="relative">
              <Textarea
                label="Description"
                placeholder="Give your dish a mouth-watering description..."
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors((prev) => ({ ...prev, description: "" }));
                }}
                onBlur={() => handleBlur("description", description)}
                error={errors.description}
              />
              <div className="absolute right-2 bottom-[-18px] text-[10px] text-[var(--color-text-muted)] font-medium">
                {description.length}/500 chars
              </div>
            </div>
            <div className="h-2" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Base Price ($) *"
                placeholder="0.00"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  if (errors.price) setErrors((prev) => ({ ...prev, price: "" }));
                }}
                onBlur={() => handleBlur("price", price)}
                error={errors.price}
                required
              />

              <div className="flex flex-col gap-1 relative">
                <Input
                  label="Discount Price ($)"
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                  min="0"
                  value={discountPrice}
                  onChange={(e) => {
                    setDiscountPrice(e.target.value);
                    if (errors.discountPrice) setErrors((prev) => ({ ...prev, discountPrice: "" }));
                  }}
                  onBlur={() => handleBlur("discountPrice", discountPrice)}
                  error={errors.discountPrice}
                />
                {discountPercentage !== null && (
                  <span className="absolute right-4 top-2 text-[10px] font-semibold text-[var(--color-accent-green)] bg-[var(--color-accent-green-subtle)] px-2 py-0.5 rounded-full uppercase leading-none">
                    Save {discountPercentage}%
                  </span>
                )}
              </div>
            </div>

            {/* Interactive multi-select toggle pills for tags */}
            <div className="flex flex-col gap-2.5">
              <span className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-semibold">
                Product Tags
              </span>
              <div className="flex flex-wrap gap-2.5">
                {AVAILABLE_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className={`h-8 px-4 rounded-full text-xs font-semibold uppercase tracking-wider transition-smooth cursor-pointer border ${
                        isSelected
                          ? "bg-[var(--color-accent-green-subtle)] text-[var(--color-accent-green)] border-[var(--color-accent-green)] shadow-sm"
                          : "bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-border-hover)]"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 2: Inventory */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-[var(--color-text-muted)] font-semibold border-b border-[var(--color-border)] pb-2 mb-4">
              Inventory & Control
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="In Stock Quantity *"
                placeholder="0"
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => {
                  setQuantity(e.target.value);
                  if (errors.quantity) setErrors((prev) => ({ ...prev, quantity: "" }));
                }}
                onBlur={() => handleBlur("quantity", quantity)}
                error={errors.quantity}
                required
              />

              <Input
                label="Low Stock Threshold"
                placeholder="5"
                type="number"
                min="0"
                value={lowStockThreshold}
                onChange={(e) => {
                  setLowStockThreshold(e.target.value);
                  if (errors.lowStockThreshold) setErrors((prev) => ({ ...prev, lowStockThreshold: "" }));
                }}
                onBlur={() => handleBlur("lowStockThreshold", lowStockThreshold)}
                error={errors.lowStockThreshold}
              />

              <div className="flex flex-col gap-2">
                <span className="text-[length:var(--text-sm)] font-medium text-[var(--color-text-secondary)] mb-1">
                  Availability Status
                </span>
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={status === "Active"}
                      onChange={(e) => setStatus(e.target.checked ? "Active" : "Inactive")}
                      className="peer sr-only"
                    />
                    <div className="h-6 w-11 rounded-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] peer-checked:bg-[var(--color-accent-green)] peer-checked:border-[var(--color-accent-green-active)] transition-smooth" />
                    <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-smooth peer-checked:translate-x-5" />
                  </label>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-primary)]">
                    {status === "Active" ? "Active / Visible" : "Hidden"}
                  </span>
                </div>
              </div>
            </div>

            {/* Drag and Drop Image Upload Component */}
            <ImageUploadZone value={imageUrl} onChange={setImageUrl} />
          </div>

          {/* Section 3: Availability */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest text-[var(--color-text-muted)] font-semibold border-b border-[var(--color-border)] pb-2 mb-4">
              Availability Schedules
            </h4>

            {/* Available Days Checkboxes */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-semibold">
                  Available Days
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={selectAllDays}
                    className="text-[10px] uppercase font-semibold text-[var(--color-accent-green)] hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-[10px] text-[var(--color-border-strong)]">|</span>
                  <button
                    type="button"
                    onClick={deselectAllDays}
                    className="text-[10px] uppercase font-semibold text-[var(--color-danger)] hover:underline"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => {
                  const isSelected = availableDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayToggle(day)}
                      className={`h-8 px-4 rounded-lg text-xs font-semibold transition-smooth cursor-pointer border ${
                        isSelected
                          ? "bg-[var(--color-accent-green-subtle)] text-[var(--color-accent-green)] border-[var(--color-accent-green)]"
                          : "bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-border-hover)]"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time range selection inputs */}
            <div className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-semibold">
                Serving Time Window
              </span>
              <div className="grid grid-cols-2 gap-4 items-center max-w-sm">
                <Input
                  label="From Time"
                  type="time"
                  value={timeFrom}
                  onChange={(e) => setTimeFrom(e.target.value)}
                  className="w-full"
                />
                <Input
                  label="To Time"
                  type="time"
                  value={timeTo}
                  onChange={(e) => setTimeTo(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* Discard Confirmation dialog */}
      <Modal
        open={showDiscardConfirm}
        onClose={() => setShowDiscardConfirm(false)}
        title="Discard changes?"
        description="You have unsaved changes in this form. If you close now, all modifications will be permanently lost."
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDiscardConfirm(false)}>
              Keep Editing
            </Button>
            <Button variant="danger" onClick={handleConfirmDiscard}>
              Discard Changes
            </Button>
          </>
        }
        size="md"
      >
        <div className="flex items-center gap-3 text-[var(--color-warning)] p-1">
          <AlertTriangle className="h-6 w-6 shrink-0" strokeWidth={1.5} />
          <span className="text-sm font-semibold text-[var(--color-text-primary)]">
            Are you sure you want to discard your changes?
          </span>
        </div>
      </Modal>
    </>
  );
}
