"use client";

import React, { useState } from "react";
import { Edit2, Trash2, X, Plus, Check } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Category } from "../types";
import { toast } from "react-hot-toast";

interface CategoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAddCategory: (name: string) => Promise<any>;
  onRenameCategory: (catId: string, newName: string) => Promise<any>;
  onDeleteCategory: (catId: string) => Promise<any>;
}

export default function CategoryPanel({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
}: CategoryPanelProps) {
  // Creating State
  const [newCatName, setNewCatName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Renaming State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) {
      toast.error("Category name cannot be empty");
      return;
    }
    if (categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("Category name already exists");
      return;
    }

    setIsAdding(true);
    try {
      await onAddCategory(trimmed);
      setNewCatName("");
    } catch (err) {
      // Error toast handled in hook
    } finally {
      setIsAdding(false);
    }
  };

  const handleStartRename = (cat: Category) => {
    setEditingId(cat.id);
    setEditingValue(cat.name);
  };

  const handleCancelRename = () => {
    setEditingId(null);
    setEditingValue("");
  };

  const handleSaveRename = async (catId: string) => {
    const trimmed = editingValue.trim();
    if (!trimmed) {
      toast.error("Category name cannot be empty");
      return;
    }

    // Check if name is unchanged
    const original = categories.find((c) => c.id === catId);
    if (original && original.name === trimmed) {
      handleCancelRename();
      return;
    }

    // Check if duplicate name
    if (categories.some((c) => c.id !== catId && c.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("Another category already has this name");
      return;
    }

    try {
      await onRenameCategory(catId, trimmed);
      setEditingId(null);
    } catch (err) {
      // handled in hook
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, catId: string) => {
    if (e.key === "Enter") {
      handleSaveRename(catId);
    } else if (e.key === "Escape") {
      handleCancelRename();
    }
  };

  const handleDeleteClick = async (cat: Category) => {
    if (confirm(`Are you sure you want to delete the category "${cat.name}"? Menu items matching this category will remain, but will lose their category mapping.`)) {
      await onDeleteCategory(cat.id);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Manage Categories"
      description="Create, rename, or delete menu categories. Renames will automatically update all matching items."
      size="md"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="flex flex-col gap-6 py-1">
        {/* Categories List Container */}
        <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1">
          {categories.length === 0 ? (
            <div className="text-center py-8 text-xs text-[var(--color-text-muted)] font-medium">
              No categories registered yet. Create your first one below!
            </div>
          ) : (
            categories.map((cat) => {
              const isEditing = editingId === cat.id;

              return (
                <div
                  key={cat.id}
                  className="flex items-center justify-between gap-4 h-12 px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-border-hover)] transition-smooth"
                >
                  {isEditing ? (
                    // Inline Rename Textbox
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, cat.id)}
                        className="flex-1 h-8 rounded-md border border-[var(--color-accent-green)] bg-[var(--color-bg-tertiary)] px-3 text-xs text-[var(--color-text-primary)] focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveRename(cat.id)}
                        className="p-2 rounded-lg bg-[var(--color-accent-green-subtle)] text-[var(--color-accent-green)] hover:bg-[var(--color-accent-green)] hover:text-white transition-smooth"
                        title="Save rename"
                      >
                        <Check className="h-3.5 w-3.5" strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelRename}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-[var(--color-text-secondary)] transition-smooth"
                        title="Cancel rename"
                      >
                        <X className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </button>
                    </div>
                  ) : (
                    // Default Row View
                    <>
                      <span className="text-xs font-semibold text-[var(--color-text-primary)] tracking-wide">
                        {cat.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleStartRename(cat)}
                          className="p-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)] transition-smooth flex items-center justify-center shrink-0"
                          title="Rename Category"
                        >
                          <Edit2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(cat)}
                          className="p-2 rounded-lg border border-[var(--color-border)] text-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)] hover:border-red-200 transition-smooth flex items-center justify-center shrink-0"
                          title="Delete Category"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Quick Create Footer Input */}
        <form onSubmit={handleCreateCategory} className="border-t border-[var(--color-border)] pt-4 mt-1 flex gap-2 items-end">
          <Input
            label="Create New Category"
            placeholder="e.g. Seafood Entrées"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="flex-1"
          />
          <Button
            type="submit"
            variant="success"
            loading={isAdding}
            leftIcon={<Plus className="h-4 w-4" strokeWidth={1.5} />}
          >
            Create
          </Button>
        </form>
      </div>
    </Modal>
  );
}
