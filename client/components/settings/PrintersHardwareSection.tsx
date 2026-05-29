"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Plug, Pencil, Plus, TestTube2, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { SectionFrame } from "./SectionFrame";
import { SimpleToggle } from "./shared";
import { printerSchema, type PrinterFormValues } from "@/lib/validators/settings";
import { useCreateSettingsPrinter, useDeleteSettingsPrinter, useSettingsPrinters, useTestSettingsPrinter, useUpdateSettingsPrinter } from "@/hooks/useSettingsPrinters";

const emptyPrinter: PrinterFormValues = {
  name: "",
  label: "",
  printer_type: "thermal",
  connection_type: "lan",
  printer_address: "",
  port_number: 9100,
  is_active: true,
  is_default: false,
  paper_width: 80,
  paper_size: "80mm",
  encoding: "UTF-8",
  auto_cut: true,
  cash_drawer_enabled: false,
  assigned_order_types: [],
};

export default function PrintersHardwareSection() {
  const { data, isLoading } = useSettingsPrinters();
  const createMutation = useCreateSettingsPrinter();
  const updateMutation = useUpdateSettingsPrinter();
  const deleteMutation = useDeleteSettingsPrinter();
  const testMutation = useTestSettingsPrinter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const form = useForm<PrinterFormValues>({ resolver: zodResolver(printerSchema), defaultValues: emptyPrinter });

  const openCreate = () => {
    setEditingId(null);
    setOpen(true);
    form.reset(emptyPrinter);
  };

  const openEdit = (printer: Record<string, unknown>) => {
    setEditingId(String(printer.id || ""));
    setOpen(true);
    form.reset({
      id: String(printer.id || ""),
      name: String(printer.name || ""),
      label: String(printer.label || ""),
      printer_type: (printer.printer_type as PrinterFormValues["printer_type"]) || "thermal",
      connection_type: (printer.connection_type as PrinterFormValues["connection_type"]) || "lan",
      printer_address: String(printer.printer_address || ""),
      port_number: Number(printer.port_number || 9100),
      is_active: Boolean(printer.is_active),
      is_default: Boolean(printer.is_default),
      paper_width: Number(printer.paper_width || 80),
      paper_size: String(printer.paper_size || "80mm"),
      encoding: String(printer.encoding || "UTF-8"),
      auto_cut: Boolean(printer.auto_cut),
      cash_drawer_enabled: Boolean(printer.cash_drawer_enabled),
      assigned_order_types: (printer.assigned_order_types as string[]) || [],
    });
  };

  const submit = form.handleSubmit(async (values) => {
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ printerId: editingId, payload: values });
      } else {
        await createMutation.mutateAsync(values);
      }
      toast.success("Printer saved");
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save printer");
    }
  });

  const deletePrinter = async (id: string) => {
    if (!window.confirm("Delete this printer?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Printer deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete printer");
    }
  };

  const testPrinter = async (id: string) => {
    try {
      await testMutation.mutateAsync(id);
      toast.success("Test print sent");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Test print failed");
    }
  };

  return (
    <SectionFrame title="Printers & Hardware" description="Register receipt, kitchen, and label printers plus hardware behavior." actions={<Button leftIcon={<Plus size={16} />} onClick={openCreate}>Add printer</Button>}>
      {isLoading ? (
        <div className="h-56 animate-pulse rounded-lg bg-[var(--color-bg-tertiary)]" />
      ) : (
        <div className="space-y-3">
          {(data || []).map((printer) => (
            <div key={String(printer.id)} className="flex items-center justify-between gap-4 rounded-lg border border-[var(--color-border)] px-4 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-[var(--color-text-primary)]">{String(printer.name)}</p>
                  <Badge variant={Boolean(printer.is_default) ? "accent" : "default"}>{String(printer.printer_type)}</Badge>
                </div>
                <p className="text-xs text-[var(--color-text-muted)]">{String(printer.printer_address)}:{String(printer.port_number)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" leftIcon={<TestTube2 size={14} />} onClick={() => testPrinter(String(printer.id))}>Test</Button>
                <Button variant="secondary" size="sm" leftIcon={<Pencil size={14} />} onClick={() => openEdit(printer as Record<string, unknown>)}>Edit</Button>
                <Button variant="danger" size="sm" leftIcon={<Trash2 size={14} />} onClick={() => deletePrinter(String(printer.id))}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editingId ? "Edit printer" : "Register printer"}
        description="Configure printer details, paper size, encoding, and hardware options."
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit} loading={createMutation.isPending || updateMutation.isPending}>Save printer</Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={submit}>
          <Input label="Printer name" {...form.register("name")} />
          <Input label="Display label" {...form.register("label")} />
          <div className="grid gap-4 md:grid-cols-2">
            <Select label="Type" {...form.register("printer_type")}>
              <option value="thermal">Receipt / Thermal</option>
              <option value="inkjet">Inkjet</option>
              <option value="laser">Laser</option>
            </Select>
            <Select label="Connection" {...form.register("connection_type")}>
              <option value="lan">LAN</option>
              <option value="wifi">WiFi</option>
              <option value="usb">USB</option>
              <option value="bluetooth">Bluetooth</option>
              <option value="serial">Serial</option>
            </Select>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="IP address" {...form.register("printer_address")} />
            <Input label="Port" type="number" min="1" max="65535" {...form.register("port_number", { valueAsNumber: true })} />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Input label="Paper size" {...form.register("paper_size")} />
            <Input label="Encoding" {...form.register("encoding")} />
            <Input label="Paper width" type="number" min="58" max="112" {...form.register("paper_width", { valueAsNumber: true })} />
          </div>
          <SimpleToggle label="Auto cut" checked={form.watch("auto_cut")} onChange={(value) => form.setValue("auto_cut", value, { shouldDirty: true })} />
          <SimpleToggle label="Cash drawer enabled" checked={form.watch("cash_drawer_enabled")} onChange={(value) => form.setValue("cash_drawer_enabled", value, { shouldDirty: true })} />
          <SimpleToggle label="Default printer" checked={form.watch("is_default")} onChange={(value) => form.setValue("is_default", value, { shouldDirty: true })} />
        </form>
      </Modal>
    </SectionFrame>
  );
}
