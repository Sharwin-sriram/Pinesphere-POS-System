"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { SectionFrame } from "./SectionFrame";
import { SimpleToggle } from "./shared";
import { paymentRateSchema, paymentSettingsSchema, type PaymentRateFormValues, type PaymentSettingsFormValues } from "@/lib/validators/settings";
import { useCreateSettingsTaxRate, useDeleteSettingsTaxRate, useSettingsPayment, useSettingsTaxRates, useUpdateSettingsPayment, useUpdateSettingsTaxRate } from "@/hooks/useSettingsPayment";

const emptyRate: PaymentRateFormValues = { name: "", percentage: 0, applies_to: "all", compound: false };

export default function PaymentTaxSection() {
  const { data: payment, isLoading } = useSettingsPayment();
  const { data: taxRates } = useSettingsTaxRates();
  const updatePaymentMutation = useUpdateSettingsPayment();
  const createTaxRateMutation = useCreateSettingsTaxRate();
  const updateTaxRateMutation = useUpdateSettingsTaxRate();
  const deleteTaxRateMutation = useDeleteSettingsTaxRate();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const form = useForm<PaymentSettingsFormValues>({
    resolver: zodResolver(paymentSettingsSchema),
    defaultValues: payment || undefined,
  });
  const rateForm = useForm<PaymentRateFormValues>({ resolver: zodResolver(paymentRateSchema), defaultValues: emptyRate });

  const savePayment = form.handleSubmit(async (values) => {
    try {
      await updatePaymentMutation.mutateAsync(values);
      toast.success("Payment settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save payment settings");
    }
  });

  const openCreateRate = () => {
    setEditingId(null);
    rateForm.reset(emptyRate);
    setOpen(true);
  };

  const openEditRate = (rate: Record<string, unknown>) => {
    setEditingId(String(rate.id || ""));
    rateForm.reset({
      id: String(rate.id || ""),
      name: String(rate.name || ""),
      percentage: Number(rate.percentage || 0),
      applies_to: (rate.applies_to as PaymentRateFormValues["applies_to"]) || "all",
      compound: Boolean(rate.compound),
    });
    setOpen(true);
  };

  const saveRate = rateForm.handleSubmit(async (values) => {
    try {
      if (editingId) {
        await updateTaxRateMutation.mutateAsync({ taxRateId: editingId, payload: values });
      } else {
        await createTaxRateMutation.mutateAsync(values);
      }
      toast.success("Tax rate saved");
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save tax rate");
    }
  });

  const deleteRate = async (id: string) => {
    if (!window.confirm("Delete this tax rate?")) return;
    try {
      await deleteTaxRateMutation.mutateAsync(id);
      toast.success("Tax rate deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete tax rate");
    }
  };

  return (
    <SectionFrame title="Payment & Tax" description="Configure payment methods, tax rates, tips, and terminal IDs." actions={<Button variant="secondary" onClick={savePayment} loading={updatePaymentMutation.isPending}>Save section</Button>}>
      {isLoading ? (
        <div className="h-56 animate-pulse rounded-lg bg-[var(--color-bg-tertiary)]" />
      ) : (
        <form className="space-y-6" onSubmit={savePayment}>
          <div className="grid gap-3 md:grid-cols-4">
            <SimpleToggle label="Cash" checked={Boolean(form.watch("accepted_payment_methods.cash"))} onChange={(value) => form.setValue("accepted_payment_methods.cash", value, { shouldDirty: true })} />
            <SimpleToggle label="Card" checked={Boolean(form.watch("accepted_payment_methods.card"))} onChange={(value) => form.setValue("accepted_payment_methods.card", value, { shouldDirty: true })} />
            <SimpleToggle label="Tap" checked={Boolean(form.watch("accepted_payment_methods.tap"))} onChange={(value) => form.setValue("accepted_payment_methods.tap", value, { shouldDirty: true })} />
            <SimpleToggle label="QR / Wallet" checked={Boolean(form.watch("accepted_payment_methods.qr"))} onChange={(value) => form.setValue("accepted_payment_methods.qr", value, { shouldDirty: true })} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Tax rates</h3>
              <Button variant="secondary" size="sm" leftIcon={<Plus size={14} />} onClick={openCreateRate}>Add tax rate</Button>
            </div>
            <div className="space-y-3">
              {(taxRates || []).map((rate) => (
                <div key={String(rate.id)} className="flex items-center justify-between gap-4 rounded-lg border border-[var(--color-border)] px-4 py-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-[var(--color-text-primary)]">{String(rate.name)}</p>
                      <Badge variant="accent">{String(rate.percentage)}%</Badge>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)]">Applies to {String(rate.applies_to)} · {Boolean(rate.compound) ? "compound" : "simple"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" leftIcon={<Pencil size={14} />} onClick={() => openEditRate(rate as Record<string, unknown>)}>Edit</Button>
                    <Button variant="danger" size="sm" leftIcon={<Trash2 size={14} />} onClick={() => deleteRate(String(rate.id))}>Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Select label="Rounding rule" {...form.register("rounding_rule") as never}>
              <option value="0.01">Nearest 0.01</option>
              <option value="0.05">Nearest 0.05</option>
              <option value="0.10">Nearest 0.10</option>
            </Select>
            <Input label="Stripe terminal ID" {...form.register("terminal_ids.stripe") as never} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Square device ID" {...form.register("terminal_ids.square") as never} />
            <Input label="Tip presets" {...form.register("tip_presets.0" as never)} />
          </div>
        </form>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editingId ? "Edit tax rate" : "Add tax rate"}
        description="Create or update a tax rule for specific order types."
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={saveRate} loading={createTaxRateMutation.isPending || updateTaxRateMutation.isPending}>Save tax rate</Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={saveRate}>
          <Input label="Tax name" {...rateForm.register("name")} />
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Percentage" type="number" step="0.01" {...rateForm.register("percentage", { valueAsNumber: true })} />
            <Select label="Applies to" {...rateForm.register("applies_to")}>
              <option value="all">All</option>
              <option value="dine-in">Dine-in</option>
              <option value="takeout">Takeout</option>
              <option value="delivery">Delivery</option>
            </Select>
          </div>
          <SimpleToggle label="Compound tax" checked={Boolean(rateForm.watch("compound"))} onChange={(value) => rateForm.setValue("compound", value, { shouldDirty: true })} />
        </form>
      </Modal>
    </SectionFrame>
  );
}
