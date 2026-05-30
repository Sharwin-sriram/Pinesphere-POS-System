"use client";

import React, { useState } from "react";
import { X, Trash2, Edit2, Check, Plus, AlertCircle } from "lucide-react";
import { Role } from "../types";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  roles: Role[];
  onAddRole: (name: string, color: string) => Promise<any>;
  onRenameRole: (roleId: string, name: string, color: string) => Promise<any>;
  onDeleteRole: (roleId: string) => Promise<any>;
}

const PALETTE = [
  { name: "blue", hex: "#3b82f6", label: "Blue" },
  { name: "success", hex: "#10b981", label: "Green" },
  { name: "accent", hex: "#f59e0b", label: "Amber" },
  { name: "warning", hex: "#f59e0b", label: "Yellow" },
  { name: "danger", hex: "#ef4444", label: "Red" },
];

export default function RoleModal({
  isOpen,
  onClose,
  roles,
  onAddRole,
  onRenameRole,
  onDeleteRole,
}: RoleModalProps) {
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleColor, setNewRoleColor] = useState("blue");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStartEdit = (role: Role) => {
    setEditingRoleId(role.id);
    setEditName(role.name);
    setEditColor(role.color);
  };

  const handleCancelEdit = () => {
    setEditingRoleId(null);
    setEditName("");
    setEditColor("");
  };

  const handleSaveEdit = async (roleId: string) => {
    const name = editName.trim();
    if (!name) return;

    try {
      await onRenameRole(roleId, name, editColor);
      setEditingRoleId(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to update role");
    }
  };

  const handleAddRoleClick = async () => {
    const name = newRoleName.trim();
    if (!name) return;

    setIsSubmitting(true);
    try {
      await onAddRole(name, newRoleColor);
      setNewRoleName("");
      setNewRoleColor("blue");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to add role");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, roleId: string) => {
    if (e.key === "Enter") {
      handleSaveEdit(roleId);
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Manage Staff Roles"
      description="Configure role titles, colors, and permissions. System changes propagate immediately across filters."
      size="md"
      closeOnOverlayClick={true}
    >
      <div className="space-y-6">
        {/* Roles List */}
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {roles.map((r) => {
            const isEditing = editingRoleId === r.id;
            const staffCount = r.staff_count || 0;
            const isAssigned = staffCount > 0;

            return (
              <div
                key={r.id}
                className="flex items-center justify-between p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] gap-4"
              >
                {isEditing ? (
                  /* Editing Mode */
                  <div className="flex-1 flex flex-col gap-2 animate-fade-in-up">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, r.id)}
                      className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 text-xs font-semibold text-[var(--color-text-primary)] focus:outline-none"
                      autoFocus
                    />
                    {/* Color selection row */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-[var(--color-text-muted)]">Badge Color:</span>
                      <div className="flex items-center gap-1.5">
                        {PALETTE.map((color) => (
                          <button
                            key={color.name}
                            type="button"
                            onClick={() => setEditColor(color.name)}
                            className={`h-5 w-5 rounded-full border transition-all flex items-center justify-center shrink-0 ${
                              editColor === color.name
                                ? "border-[var(--color-text-primary)] scale-110"
                                : "border-transparent"
                            }`}
                            style={{ backgroundColor: color.hex }}
                            title={color.label}
                          >
                            {editColor === color.name && (
                              <Check className="h-3 w-3 text-white" strokeWidth={3} />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Standard Mode */
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span
                      className="h-3 w-3 rounded-full border border-black/10 shrink-0"
                      style={{
                        backgroundColor: PALETTE.find((c) => c.name === r.color)?.hex || "#cbd5e1",
                      }}
                    />
                    <div
                      onClick={() => handleStartEdit(r)}
                      className="font-bold text-xs text-[var(--color-text-primary)] truncate cursor-pointer hover:underline flex items-center gap-1.5"
                      title="Click to rename role inline"
                    >
                      <span>{r.name}</span>
                      <Edit2 className="h-3 w-3 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100" />
                    </div>
                  </div>
                )}

                {/* Staff count & actions */}
                <div className="flex items-center gap-3 shrink-0">
                  {isEditing ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(r.id)}
                        disabled={!editName.trim()}
                        className="p-1 rounded bg-[var(--color-accent-green-subtle)] text-[var(--color-accent-green)] hover:bg-[var(--color-accent-green)] hover:text-white transition"
                        title="Save Changes"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="p-1 rounded hover:bg-slate-200 text-[var(--color-text-secondary)] transition text-xs font-bold"
                      >
                        X
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-[10px] font-semibold text-[var(--color-text-muted)] bg-[var(--color-bg-secondary)] px-2 py-0.5 rounded-full border border-[var(--color-border)] select-none">
                        {staffCount} assigned
                      </span>
                      <button
                        type="button"
                        onClick={() => onDeleteRole(r.id)}
                        disabled={isAssigned}
                        className={`p-1.5 rounded-lg border shrink-0 ${
                          isAssigned
                            ? "border-[var(--color-border)] text-[var(--color-text-disabled)] cursor-not-allowed opacity-40"
                            : "border-[var(--color-border)] text-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)] hover:border-red-200 transition-smooth cursor-pointer"
                        }`}
                        title={
                          isAssigned
                            ? "Cannot delete role assigned to staff members"
                            : "Delete Role"
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Role section */}
        <div className="border-t border-[var(--color-border)] pt-4 space-y-4">
          <h4 className="text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-1.5 select-none">
            <Plus className="h-4 w-4" /> Add New Role
          </h4>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="e.g. Hostess"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                className="h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-4 text-xs font-semibold text-[var(--color-text-primary)] focus:outline-none"
              />
            </div>

            {/* Colors picker selection */}
            <div className="flex items-center gap-2 select-none">
              <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Color:</span>
              <div className="flex items-center gap-1.5">
                {PALETTE.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setNewRoleColor(color.name)}
                    className={`h-6 w-6 rounded-full border transition-all flex items-center justify-center shrink-0 ${
                      newRoleColor === color.name
                        ? "border-[var(--color-text-primary)] scale-110"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.label}
                  >
                    {newRoleColor === color.name && (
                      <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="success"
              onClick={handleAddRoleClick}
              disabled={isSubmitting || !newRoleName.trim()}
              className="h-10 px-4 text-xs"
            >
              Add
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
