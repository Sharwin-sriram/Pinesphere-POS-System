"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Pencil, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableRow({ id, children }: { id: string; children: any }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style: any = {
    transform: CSS.Transform.toString(transform) || undefined,
    transition,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Modal from "@/components/ui/Modal";
import { SectionFrame } from "./SectionFrame";
import { ColorSwatchPicker } from "./shared";
import { menuCategorySchema, type MenuCategoryFormValues } from "@/lib/validators/settings";
import { useCreateSettingsMenuCategory, useDeleteSettingsMenuCategory, useReorderSettingsMenuCategories, useSettingsMenuCategories, useUpdateSettingsMenuCategory } from "@/hooks/useSettingsMenuCategories";

const emptyCategory: MenuCategoryFormValues = {
  name: "",
  description: "",
  emoji: "",
  color: "#334155",
  is_active: true,
  start_time: "",
  end_time: "",
  kds_station_id: "",
  parent_id: "",
  sort_order: 0,
};

export default function MenuCategoriesSection() {
  const { data, isLoading } = useSettingsMenuCategories();
  const createMutation = useCreateSettingsMenuCategory();
  const updateMutation = useUpdateSettingsMenuCategory();
  const deleteMutation = useDeleteSettingsMenuCategory();
  const reorderMutation = useReorderSettingsMenuCategories();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftOrder, setDraftOrder] = useState<string[]>([]);

  const categories = useMemo(() => data || [], [data]);
  const form = useForm<MenuCategoryFormValues>({ resolver: zodResolver(menuCategorySchema), defaultValues: emptyCategory });

  useEffect(() => {
    setDraftOrder(categories.map((category) => String(category.id)));
  }, [categories]);

  const openCreate = () => {
    setEditingId(null);
    form.reset(emptyCategory);
  };

  const openEdit = (category: Record<string, unknown>) => {
    setEditingId(String(category.id || ""));
    form.reset({
      id: String(category.id || ""),
      name: String(category.name || ""),
      description: String(category.description || ""),
      emoji: String(category.emoji || ""),
      color: String(category.color || "#334155"),
      is_active: Boolean(category.is_active),
      start_time: (category.start_time as string) || "",
      end_time: (category.end_time as string) || "",
      kds_station_id: String(category.kds_station_id || ""),
      parent_id: String(category.parent_id || ""),
      sort_order: Number(category.sort_order || 0),
    });
  };

  const submit = form.handleSubmit(async (values) => {
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ categoryId: editingId, payload: values });
      } else {
        await createMutation.mutateAsync(values);
      }
      toast.success("Category saved");
      setEditingId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save category");
    }
  });

  const deleteCategory = async (id: string) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Category deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete category");
    }
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= draftOrder.length) return;
    const next = [...draftOrder];
    const [item] = next.splice(index, 1);
    next.splice(nextIndex, 0, item);
    setDraftOrder(next);
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) return;
    const oldIndex = draftOrder.indexOf(String(active.id));
    const newIndex = draftOrder.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    if (oldIndex === newIndex) return;
    setDraftOrder((prev) => arrayMove(prev, oldIndex, newIndex));
  };

  const saveOrder = async () => {
    try {
      await reorderMutation.mutateAsync(draftOrder);
      toast.success("Category order updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reorder categories");
    }
  };

  return (
    <SectionFrame title="Menu Categories" description="Create categories, assign station routing, set availability windows, and reorder the menu." actions={<Button leftIcon={<Plus size={16} />} onClick={openCreate}>Add category</Button>}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-[var(--color-text-secondary)]">Drag-and-drop style ordering is supported via the reorder controls below.</p>
        <Button variant="secondary" onClick={saveOrder} loading={reorderMutation.isPending}>Save order</Button>
      </div>

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-lg bg-[var(--color-bg-tertiary)]" />
      ) : categories.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-bg-tertiary)] p-8 text-center text-sm text-[var(--color-text-secondary)]">
          No menu categories yet. Create your first category to start routing items to KDS stations.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={draftOrder} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {draftOrder.map((categoryId, index) => {
                const category = categories.find((entry) => String(entry.id) === categoryId);
                if (!category) return null;
                return (
                  <SortableRow key={String(category.id)} id={String(category.id)}>
                    <div className="flex items-center justify-between gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span className="cursor-grab rounded-md border border-[var(--color-border)] px-2 py-2 text-xs text-[var(--color-text-muted)]">⠿</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-[var(--color-text-primary)]">{String(category.name)}</p>
                            <Badge variant={Boolean(category.is_active) ? "success" : "default"}>{Boolean(category.is_active) ? "Active" : "Inactive"}</Badge>
                          </div>
                          <p className="text-xs text-[var(--color-text-muted)]">{String(category.description || "No description")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" leftIcon={<ArrowUp size={14} />} onClick={() => moveItem(index, -1)} />
                        <Button variant="ghost" size="sm" leftIcon={<ArrowDown size={14} />} onClick={() => moveItem(index, 1)} />
                        <Button variant="secondary" size="sm" leftIcon={<Pencil size={14} />} onClick={() => openEdit(category as Record<string, unknown>)}>Edit</Button>
                        <Button variant="danger" size="sm" leftIcon={<Trash2 size={14} />} onClick={() => deleteCategory(String(category.id))}>Delete</Button>
                      </div>
                    </div>
                  </SortableRow>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <Modal
        open={Boolean(form.formState.isDirty || editingId !== null)}
        onClose={() => setEditingId(null)}
        title={editingId ? "Edit category" : "Create category"}
        description="Configure menu category metadata and KDS routing."
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
            <Button onClick={submit} loading={createMutation.isPending || updateMutation.isPending}>Save category</Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={submit}>
          <Input label="Category name" {...form.register("name")} error={form.formState.errors.name?.message} />
          <Textarea label="Description" {...form.register("description")} />
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Emoji" placeholder="🍔" {...form.register("emoji")} />
            <Input label="KDS station ID" {...form.register("kds_station_id")} />
          </div>
          <Controller control={form.control} name="color" render={({ field }) => <ColorSwatchPicker value={field.value} onChange={field.onChange} />} />
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Available from" type="time" {...form.register("start_time")} />
            <Input label="Available until" type="time" {...form.register("end_time")} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Select label="Display status" {...form.register("is_active") as never}>
              <option value={String(true)}>Active</option>
              <option value={String(false)}>Inactive</option>
            </Select>
            <Input label="Parent category ID" {...form.register("parent_id")} />
          </div>
        </form>
      </Modal>
    </SectionFrame>
  );
}
