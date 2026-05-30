import React, { useState, useEffect } from "react";
import Modal from "../../../../components/ui/Modal";
import Button from "../../../../components/ui/Button";
import { Table } from "../types";
import { Trash2 } from "lucide-react";

interface RemoveTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tableId: string, tableNumber: number) => Promise<boolean>;
  tables: Table[];
}

export default function RemoveTableModal({
  isOpen,
  onClose,
  onSubmit,
  tables,
}: RemoveTableModalProps) {
  const [selectedId, setSelectedId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedId("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const selectedTable = tables.find((t) => t.id === selectedId);

  const handleConfirm = async () => {
    if (!selectedId || !selectedTable) return;
    setIsSubmitting(true);
    const success = await onSubmit(selectedId, selectedTable.number);
    setIsSubmitting(false);
    if (success) {
      onClose();
    }
  };

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
        Cancel
      </Button>
      <Button
        variant="danger"
        onClick={handleConfirm}
        disabled={!selectedId || isSubmitting}
        loading={isSubmitting}
      >
        Remove Table
      </Button>
    </>
  );

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Remove Dining Table"
      description="Select a table from the dining area to permanently remove from the floor grid."
      footer={footer}
      size="md"
      closeOnOverlayClick={false}
    >
      <div className="space-y-5">
        {/* Table Selection Dropdown */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[length:var(--text-sm)] font-medium text-[var(--color-text-secondary)]">
            Select Table *
          </label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-4 text-[length:var(--text-base)] text-[var(--color-text-primary)] focus:outline-none"
          >
            <option value="">-- Choose a table to delete --</option>
            {tables.map((t) => {
              const isDisabled = t.status === "Occupied" || t.status === "Reserved";
              const label = isDisabled
                ? `Table ${t.number} (${t.status}) - Disabled`
                : `Table ${t.number} (${t.status})`;
              return (
                <option key={t.id} value={t.id} disabled={isDisabled}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>

        {/* Selected Table Summary Card */}
        {selectedTable && (
          <div className="bg-[var(--color-bg-tertiary)] rounded-xl border border-[var(--color-border)] p-5 flex flex-col gap-3">
            <h4 className="text-sm font-bold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2 uppercase tracking-wide">
              Selected Table Summary
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
              <div>
                <p className="text-[var(--color-text-secondary)]">Table Number</p>
                <p className="text-[var(--color-text-primary)] text-sm font-bold mt-0.5">
                  Table {selectedTable.number}
                </p>
              </div>
              <div>
                <p className="text-[var(--color-text-secondary)]">Seating Capacity</p>
                <p className="text-[var(--color-text-primary)] text-sm font-bold mt-0.5">
                  {selectedTable.capacity} Seats
                </p>
              </div>
              <div>
                <p className="text-[var(--color-text-secondary)]">Section Zone</p>
                <p className="text-[var(--color-text-primary)] text-sm font-bold mt-0.5">
                  {selectedTable.section}
                </p>
              </div>
              <div>
                <p className="text-[var(--color-text-secondary)]">Current Status</p>
                <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider bg-[var(--color-success-subtle)] text-[var(--color-success)] px-2 py-0.5 rounded-full">
                  {selectedTable.status}
                </span>
              </div>
            </div>
            {selectedTable.notes && (
              <div className="text-xs pt-1">
                <p className="text-[var(--color-text-secondary)] font-semibold">Table Notes</p>
                <p className="text-[var(--color-text-primary)] italic mt-0.5">
                  "{selectedTable.notes}"
                </p>
              </div>
            )}
            <div className="flex gap-2.5 items-center bg-red-50 dark:bg-red-950/20 text-[var(--color-danger)] p-3 rounded-lg border border-red-200 mt-2 text-xs">
              <Trash2 className="h-5 w-5 shrink-0 animate-bounce" />
              <span>
                <strong>Warning:</strong> Deleting this table is absolute and cannot be undone. Its ordering layout history will be permanently cleared.
              </span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
