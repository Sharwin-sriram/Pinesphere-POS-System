"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { SectionFrame } from "./SectionFrame";
import { ColorSwatchPicker } from "./shared";
import { kdsStationSchema, type KdsStationFormValues } from "@/lib/validators/settings";
import { useCreateSettingsKdsStation, useDeleteSettingsKdsStation, useReorderSettingsKdsStations, useSettingsKdsStations, useUpdateSettingsKdsStation } from "@/hooks/useSettingsKdsStations";
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

const emptyStation: KdsStationFormValues = {
  name: "",
  label: "",
  color: "#334155",
  type: "PREP",
  printer: null,
  alert_seconds: 300,
  critical_seconds: 600,
  sound_enabled: true,
  layout: "grid",
  menu_category_ids: [],
  is_active: true,
  sort_order: 0,
};

export default function KdsStationsSection() {
  const { data, isLoading } = useSettingsKdsStations();
  const createMutation = useCreateSettingsKdsStation();
  const updateMutation = useUpdateSettingsKdsStation();
  const deleteMutation = useDeleteSettingsKdsStation();
  const reorderMutation = useReorderSettingsKdsStations();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [draftOrder, setDraftOrder] = useState<string[]>([]);

  const form = useForm<KdsStationFormValues>({ resolver: zodResolver(kdsStationSchema), defaultValues: emptyStation });

  useEffect(() => {
    setDraftOrder((data || []).map((s) => String(s.id)));
  }, [data]);

  const openCreate = () => {
    setEditingId(null);
    setOpen(true);
    form.reset(emptyStation);
  };

  const openEdit = (station: Record<string, unknown>) => {
    setEditingId(String(station.id || ""));
    setOpen(true);
    form.reset({
      id: String(station.id || ""),
      name: String(station.name || ""),
      label: String(station.label || ""),
      color: String(station.color || "#334155"),
      type: (station.type as KdsStationFormValues["type"]) || "PREP",
      printer: station.printer ? String(station.printer) : null,
      alert_seconds: Number(station.alert_seconds || 300),
      critical_seconds: Number(station.critical_seconds || 600),
      sound_enabled: Boolean(station.sound_enabled),
      layout: (station.layout as KdsStationFormValues["layout"]) || "grid",
      menu_category_ids: (station.menu_category_ids as string[]) || [],
      is_active: Boolean(station.is_active),
      sort_order: Number(station.sort_order || 0),
    });
  };

  const submit = form.handleSubmit(async (values) => {
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ stationId: editingId, payload: values });
      } else {
        await createMutation.mutateAsync(values);
      }
      toast.success("KDS station saved");
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save KDS station");
    }
  });

  const deleteStation = async (id: string) => {
    if (!window.confirm("Delete this KDS station?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("KDS station deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete KDS station");
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
      toast.success("Station order updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reorder stations");
    }
  };

  return (
    <SectionFrame title="KDS Stations" description="Configure kitchen display stations, display labels, timers, layout, and routing." actions={<Button leftIcon={<Plus size={16} />} onClick={openCreate}>Add station</Button>}>
      {isLoading ? (
        <div className="h-56 animate-pulse rounded-lg bg-[var(--color-bg-tertiary)]" />
      ) : (
        <div>
          <div className="flex items-center justify-between gap-3 mb-3">
            <p className="text-sm text-[var(--color-text-secondary)]">Drag-and-drop ordering supported.</p>
            <Button variant="secondary" onClick={saveOrder} loading={reorderMutation.isPending}>Save order</Button>
          </div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={draftOrder} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {draftOrder.map((stationId, index) => {
                  const station = (data || []).find((s) => String(s.id) === stationId);
                  if (!station) return null;
                  return (
                    <SortableRow key={String(station.id)} id={String(station.id)}>
                      <div className="flex items-center justify-between gap-4 rounded-lg border border-[var(--color-border)] px-4 py-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-[var(--color-text-primary)]">{String(station.name)}</p>
                            <Badge variant={Boolean(station.is_active) ? "success" : "default"}>{Boolean(station.is_active) ? "Active" : "Inactive"}</Badge>
                          </div>
                          <p className="text-xs text-[var(--color-text-muted)]">{String(station.type)} · {String(station.layout)} · {String(station.alert_seconds)}s / {String(station.critical_seconds)}s</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" leftIcon={<Pencil size={14} />} onClick={() => openEdit(station as Record<string, unknown>)}>Edit</Button>
                          <Button variant="danger" size="sm" leftIcon={<Trash2 size={14} />} onClick={() => deleteStation(String(station.id))}>Delete</Button>
                        </div>
                      </div>
                    </SortableRow>
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editingId ? "Edit KDS station" : "Create KDS station"}
        description="Create the station and set its alert timing, sound, and screen layout."
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit} loading={createMutation.isPending || updateMutation.isPending}>Save station</Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={submit}>
          <Input label="Station name" {...form.register("name")} />
          <Input label="Display label" {...form.register("label")} />
          <Select label="Station type" {...form.register("type")}>
            <option value="PREP">Prep</option>
            <option value="EXPO">Expo</option>
            <option value="BAR">Bar</option>
            <option value="PASS">Pass</option>
          </Select>
          <Controller control={form.control} name="color" render={({ field }) => <ColorSwatchPicker value={field.value} onChange={field.onChange} />} />
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Alert after (seconds)" type="number" min="0" {...form.register("alert_seconds", { valueAsNumber: true })} />
            <Input label="Critical after (seconds)" type="number" min="0" {...form.register("critical_seconds", { valueAsNumber: true })} />
          </div>
          <Select label="Layout" {...form.register("layout")}>
            <option value="grid">Grid</option>
            <option value="list">List</option>
            <option value="ticket">Ticket</option>
          </Select>
          <Input label="Printer ID" {...form.register("printer")} />
        </form>
      </Modal>
    </SectionFrame>
  );
}
