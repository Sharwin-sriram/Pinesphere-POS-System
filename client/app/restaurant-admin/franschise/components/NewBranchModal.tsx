"use client";

import React, { useState } from "react";
import { X, Loader } from "lucide-react";
import { CreateBranchPayload } from "../services/branchApi";

interface NewBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateBranchPayload) => Promise<void>;
  isLoading?: boolean;
}

export default function NewBranchModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: NewBranchModalProps) {
  const [formData, setFormData] = useState<CreateBranchPayload>({
    name: "",
    address: "",
    phone: "",
    manager_name: "",
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Branch name is required";
    }
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    if (!formData.manager_name.trim()) {
      newErrors.manager_name = "Manager name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      // Reset form on success
      setFormData({
        name: "",
        address: "",
        phone: "",
        manager_name: "",
        is_active: true,
      });
      onClose();
    } catch (error) {
      // Error is handled by the hook
      console.error("Error submitting form:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-[var(--color-bg-overlay)] z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-[var(--color-bg-secondary)] rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
            <h2 className="text-[length:var(--text-lg)] font-semibold text-[var(--color-text-primary)]">
              Create New Branch
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-[var(--color-bg-tertiary)] rounded-lg transition-colors"
              disabled={isLoading}
            >
              <X size={20} className="text-[var(--color-text-secondary)]" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Branch Name */}
            <div>
              <label className="block text-[length:var(--text-sm)] font-medium text-[var(--color-text-primary)] mb-2">
                Branch Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Downtown Branch"
                className={`w-full px-4 py-2 rounded-lg border text-[length:var(--text-sm)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] transition-colors ${
                  errors.name
                    ? "border-[var(--color-danger)]"
                    : "border-[var(--color-border)] focus:border-[var(--color-accent-green)]"
                } focus:outline-none`}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-[length:var(--text-xs)] text-[var(--color-danger)] mt-1">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-[length:var(--text-sm)] font-medium text-[var(--color-text-primary)] mb-2">
                Address *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g., 123 Main Street, City, State"
                rows={3}
                className={`w-full px-4 py-2 rounded-lg border text-[length:var(--text-sm)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] transition-colors resize-none ${
                  errors.address
                    ? "border-[var(--color-danger)]"
                    : "border-[var(--color-border)] focus:border-[var(--color-accent-green)]"
                } focus:outline-none`}
                disabled={isLoading}
              />
              {errors.address && (
                <p className="text-[length:var(--text-xs)] text-[var(--color-danger)] mt-1">
                  {errors.address}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[length:var(--text-sm)] font-medium text-[var(--color-text-primary)] mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g., +1 (555) 123-4567"
                className={`w-full px-4 py-2 rounded-lg border text-[length:var(--text-sm)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] transition-colors ${
                  errors.phone
                    ? "border-[var(--color-danger)]"
                    : "border-[var(--color-border)] focus:border-[var(--color-accent-green)]"
                } focus:outline-none`}
                disabled={isLoading}
              />
              {errors.phone && (
                <p className="text-[length:var(--text-xs)] text-[var(--color-danger)] mt-1">
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Manager Name */}
            <div>
              <label className="block text-[length:var(--text-sm)] font-medium text-[var(--color-text-primary)] mb-2">
                Manager Name *
              </label>
              <input
                type="text"
                name="manager_name"
                value={formData.manager_name}
                onChange={handleChange}
                placeholder="e.g., John Doe"
                className={`w-full px-4 py-2 rounded-lg border text-[length:var(--text-sm)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] transition-colors ${
                  errors.manager_name
                    ? "border-[var(--color-danger)]"
                    : "border-[var(--color-border)] focus:border-[var(--color-accent-green)]"
                } focus:outline-none`}
                disabled={isLoading}
              />
              {errors.manager_name && (
                <p className="text-[length:var(--text-xs)] text-[var(--color-danger)] mt-1">
                  {errors.manager_name}
                </p>
              )}
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-4 h-4 rounded border-[var(--color-border)] cursor-pointer accent-[var(--color-accent-green)]"
                disabled={isLoading}
              />
              <label
                htmlFor="is_active"
                className="text-[length:var(--text-sm)] font-medium text-[var(--color-text-primary)] cursor-pointer"
              >
                Active Branch
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg border border-[var(--color-border)] text-[length:var(--text-sm)] font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 rounded-lg bg-[var(--color-accent-green)] text-[length:var(--text-sm)] font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading && <Loader size={16} className="animate-spin" />}
                {isLoading ? "Creating..." : "Create Branch"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
