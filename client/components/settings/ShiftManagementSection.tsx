"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { SectionFrame } from "./SectionFrame";
import { WeekdayMultiSelect, SimpleToggle } from "./shared";
import { shiftTemplateSchema, type ShiftTemplateFormValues } from "@/lib/validators/settings";
import { useCreateSettingsShift, useDeleteSettingsShift, useSettingsShiftCoverage, useSettingsShifts, useUpdateSettingsShift } from "@/hooks/useSettingsShifts";

const emptyShift: ShiftTemplateFormValues = {
  name: "",
  start_time: "09:00",
  end_time: "17:00",
  days_of_week: [],
  role_ids: [],
  min_staff: 0,
  staff_assignments: [],
  overtime_threshold_hours: 40,
  allow_swaps: true,
  sort_order: 0,
};

export default function ShiftManagementSection() {
  const { data, isLoading } = useSettingsShifts();
  const { data: coverage } = useSettingsShiftCoverage();
  const createMutation = useCreateSettingsShift();
  const updateMutation = useUpdateSettingsShift();
  const deleteMutation = useDeleteSettingsShift();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const form = useForm<ShiftTemplateFormValues>({ resolver: zodResolver(shiftTemplateSchema), defaultValues: emptyShift });

  const openCreate = () => {
    setEditingId(null);
    setOpen(true);
    form.reset(emptyShift);
  };

  const openEdit = (shift: Record<string, unknown>) => {
    setEditingId(String(shift.id || ""));
    setOpen(true);
    form.reset({
      id: String(shift.id || ""),
      name: String(shift.name || ""),
      start_time: String(shift.start_time || "09:00"),
      end_time: String(shift.end_time || "17:00"),
      days_of_week: (shift.days_of_week as number[]) || [],
      role_ids: (shift.role_ids as string[]) || [],
      min_staff: Number(shift.min_staff || 0),
      staff_assignments: (shift.staff_assignments as ShiftTemplateFormValues["staff_assignments"]) || [],
      overtime_threshold_hours: Number(shift.overtime_threshold_hours || 40),
      allow_swaps: Boolean(shift.allow_swaps),
      sort_order: Number(shift.sort_order || 0),
    });
  };

  const submit = form.handleSubmit(async (values) => {
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ shiftId: editingId, payload: values });
      } else {
        await createMutation.mutateAsync(values);
      }
      toast.success("Shift template saved");
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save shift template");
    }
  });

  const deleteShift = async (id: string) => {
    if (!window.confirm("Delete this shift template?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Shift template deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete shift template");
    }
  };

  return (
    <SectionFrame title="Shift Management" description="Define shift templates, staffing thresholds, and coverage previews." actions={<Button leftIcon={<Plus size={16} />} onClick={openCreate}>Add shift</Button>}>
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] p-4 text-sm text-[var(--color-text-secondary)]">
        Weekly coverage preview: {coverage ? `${coverage.shifts?.length || 0} templates loaded` : "loading"}
      </div>

      {isLoading ? (
        <div className="h-56 animate-pulse rounded-lg bg-[var(--color-bg-tertiary)]" />
      ) : (
        <div className="space-y-3">
          {(data || []).map((shift) => (
            <div key={String(shift.id)} className="flex items-center justify-between gap-4 rounded-lg border border-[var(--color-border)] px-4 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-[var(--color-text-primary)]">{String(shift.name)}</p>
                  <Badge variant="default">{String(shift.start_time)} - {String(shift.end_time)}</Badge>
                </div>
                <p className="text-xs text-[var(--color-text-muted)]">{(shift.days_of_week as number[] || []).join(", ")} · min {String(shift.min_staff)} staff</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" leftIcon={<Pencil size={14} />} onClick={() => openEdit(shift as Record<string, unknown>)}>Edit</Button>
                <Button variant="danger" size="sm" leftIcon={<Trash2 size={14} />} onClick={() => deleteShift(String(shift.id))}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editingId ? "Edit shift template" : "Create shift template"}
        description="Set coverage windows, days of the week, and staffing minimums."
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit} loading={createMutation.isPending || updateMutation.isPending}>Save shift</Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={submit}>
          <Input label="Shift name" {...form.register("name")} />
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Start time" type="time" {...form.register("start_time")} />
            <Input label="End time" type="time" {...form.register("end_time")} />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-[var(--color-text-secondary)]">Days of week</p>
            <WeekdayMultiSelect value={form.watch("days_of_week")} onChange={(value) => form.setValue("days_of_week", value, { shouldDirty: true })} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Minimum staff" type="number" min="0" {...form.register("min_staff", { valueAsNumber: true })} />
            <Input label="Overtime threshold (hours/week)" type="number" min="0" {...form.register("overtime_threshold_hours", { valueAsNumber: true })} />
          </div>
          <SimpleToggle label="Allow staff-initiated swaps" checked={form.watch("allow_swaps")} onChange={(value) => form.setValue("allow_swaps", value, { shouldDirty: true })} />
        </form>
      </Modal>
    </SectionFrame>
  );
}
