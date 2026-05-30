import React, { useState, useEffect } from "react";
import Modal from "../../../../components/ui/Modal";
import Input from "../../../../components/ui/Input";
import Textarea from "../../../../components/ui/Textarea";
import Button from "../../../../components/ui/Button";
import { tableApi } from "../services/tableApi";
import toast from "react-hot-toast";

interface AddTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { number: number; capacity: number; section: string; notes?: string }) => Promise<boolean>;
  existingSections: string[];
  restaurantId: string;
}

export default function AddTableModal({
  isOpen,
  onClose,
  onSubmit,
  existingSections,
  restaurantId,
}: AddTableModalProps) {
  const [number, setNumber] = useState("");
  const [capacity, setCapacity] = useState("");
  const [section, setSection] = useState("Indoor");
  const [customSection, setCustomSection] = useState("");
  const [notes, setNotes] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNumber("");
      setCapacity("");
      setSection("Indoor");
      setCustomSection("");
      setNotes("");
      setErrors({});
    }
  }, [isOpen]);

  const validateNumber = async (numVal: string) => {
    if (!numVal) {
      return "Table number is required";
    }
    const num = parseInt(numVal, 10);
    if (isNaN(num) || num <= 0) {
      return "Table number must be a positive integer";
    }
    try {
      const list = await tableApi.getTables(restaurantId);
      if (list.some((t) => t.number === num)) {
        return "Table number already exists";
      }
    } catch {
      // Ignore checks if connection is offline
    }
    return "";
  };

  const handleNumberBlur = async () => {
    const errorMsg = await validateNumber(number);
    setErrors((prev) => ({ ...prev, number: errorMsg }));
  };

  const validateCapacity = (capVal: string) => {
    if (!capVal) {
      return "Seating capacity is required";
    }
    const cap = parseInt(capVal, 10);
    if (isNaN(cap) || cap <= 0) {
      return "Capacity must be a positive integer";
    }
    if (cap > 20) {
      return "Capacity cannot exceed 20 seats";
    }
    return "";
  };

  const handleCapacityBlur = () => {
    const errorMsg = validateCapacity(capacity);
    setErrors((prev) => ({ ...prev, capacity: errorMsg }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numErr = await validateNumber(number);
    const capErr = validateCapacity(capacity);

    if (numErr || capErr) {
      setErrors({
        number: numErr,
        capacity: capErr,
      });
      toast.error("Please resolve the validation errors first.");
      return;
    }

    setIsSubmitting(true);
    const selectedSection = section === "Custom" ? customSection.trim() || "Indoor" : section;

    const success = await onSubmit({
      number: parseInt(number, 10),
      capacity: parseInt(capacity, 10),
      section: selectedSection,
      notes: notes.trim(),
    });

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
      <Button variant="success" onClick={handleSubmit} loading={isSubmitting}>
        Save Table
      </Button>
    </>
  );

  const mergedSections = Array.from(new Set([...existingSections, "Indoor", "Outdoor", "Bar", "Private"]));

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Add New Table"
      description="Register a new table and assign its location details on the dining floor plan."
      footer={footer}
      size="md"
      closeOnOverlayClick={false}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Table Number */}
          <Input
            label="Table Number *"
            type="number"
            placeholder="e.g. 5"
            value={number}
            onChange={(e) => {
              setNumber(e.target.value);
              if (errors.number) setErrors((prev) => ({ ...prev, number: "" }));
            }}
            onBlur={handleNumberBlur}
            error={errors.number}
            required
          />

          {/* Capacity */}
          <Input
            label="Seating Capacity (Max 20) *"
            type="number"
            placeholder="e.g. 4"
            value={capacity}
            onChange={(e) => {
              setCapacity(e.target.value);
              if (errors.capacity) setErrors((prev) => ({ ...prev, capacity: "" }));
            }}
            onBlur={handleCapacityBlur}
            error={errors.capacity}
            required
          />
        </div>

        {/* Section / Zone Selection */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[length:var(--text-sm)] font-medium text-[var(--color-text-secondary)]">
            Section / Zone *
          </label>
          <select
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-4 text-[length:var(--text-base)] text-[var(--color-text-primary)] focus:outline-none"
          >
            {mergedSections.map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
            <option value="Custom">+ Enter Custom Section</option>
          </select>
        </div>

        {section === "Custom" && (
          <Input
            label="Custom Section Name *"
            placeholder="e.g. Balcony"
            value={customSection}
            onChange={(e) => setCustomSection(e.target.value)}
            required
          />
        )}

        {/* Notes */}
        <div>
          <Textarea
            label="Notes"
            placeholder="e.g. Cozy table next to window, wheel-chair accessible..."
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, 200))}
            error={notes.length >= 200 ? "Notes cannot exceed 200 characters" : ""}
          />
          <div className="text-right text-[10px] text-[var(--color-text-muted)] font-semibold mt-1">
            {notes.length}/200 characters
          </div>
        </div>
      </form>
    </Modal>
  );
}
