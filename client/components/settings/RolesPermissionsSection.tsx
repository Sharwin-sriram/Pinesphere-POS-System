"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { SectionFrame, UnsavedChangesBar } from "./SectionFrame";
import { ColorSwatchPicker } from "./shared";
import { roleSchema, type RoleFormValues } from "@/lib/validators/settings";
import { useCreateSettingsRole, useDeleteSettingsRole, useSettingsPermissions, useSettingsRoles, useUpdateSettingsRole } from "@/hooks/useSettingsRoles";

const emptyRole: RoleFormValues = {
  name: "",
  color: "#334155",
  icon: "",
  permissions: {},
  sort_order: 0,
  is_system: false,
};

export default function RolesPermissionsSection() {
  const { data: roles, isLoading } = useSettingsRoles();
  const { data: permissions } = useSettingsPermissions();
  const createMutation = useCreateSettingsRole();
  const updateMutation = useUpdateSettingsRole();
  const deleteMutation = useDeleteSettingsRole();
  const [activeRole, setActiveRole] = useState<RoleFormValues | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const permissionKeys = useMemo(() => permissions || [], [permissions]);

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: emptyRole,
  });

  useEffect(() => {
    if (activeRole) {
      form.reset(activeRole);
    }
  }, [activeRole, form]);

  const openCreate = () => {
    setEditingId(null);
    setActiveRole(emptyRole);
  };

  const openEdit = (role: Record<string, unknown>) => {
    setEditingId(String(role.id || ""));
    setActiveRole({
      id: String(role.id || ""),
      name: String(role.name || ""),
      color: String(role.color || "#334155"),
      icon: String(role.icon || ""),
      permissions: (role.permissions as any) || {},
      sort_order: Number(role.sort_order || 0),
      is_system: Boolean(role.is_system),
    });
  };

  const submitRole = form.handleSubmit(async (values) => {
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ roleId: editingId, payload: values });
      } else {
        await createMutation.mutateAsync(values);
      }
      toast.success("Role saved");
      setActiveRole(null);
      setEditingId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save role");
    }
  });

  const handleDelete = async (roleId: string, isSystem?: boolean) => {
    if (isSystem) return;
    if (!window.confirm("Delete this role?")) return;
    try {
      await deleteMutation.mutateAsync(roleId);
      toast.success("Role deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete role");
    }
  };

  return (
    <SectionFrame
      title="Roles & Permissions"
      description="Manage staff roles, permission matrices, colors, and icons used throughout the admin panel."
      actions={<Button leftIcon={<Plus size={16} />} onClick={openCreate}>Create role</Button>}
    >
      {form.formState.isDirty ? <UnsavedChangesBar onSave={submitRole} onDiscard={() => setActiveRole(null)} saving={createMutation.isPending || updateMutation.isPending} /> : null}

      {isLoading ? (
        <div className="h-56 animate-pulse rounded-lg bg-[var(--color-bg-tertiary)]" />
      ) : (
        <div className="overflow-hidden rounded-lg border border-[var(--color-border)]">
          <table className="min-w-full divide-y divide-[var(--color-border)] text-left text-sm">
            <thead className="bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]">
              <tr>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Permissions</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] bg-[var(--color-bg-secondary)]">
              {(roles || []).map((role) => (
                <tr key={String(role.id)}>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <span className="h-9 w-9 rounded-full" style={{ backgroundColor: String(role.color || "#334155") }} />
                      <div>
                        <p className="font-medium text-[var(--color-text-primary)]">{String(role.name)}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">{String(role.icon || "") || "No icon"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-[var(--color-text-secondary)]">{Object.values((role.permissions as Record<string, boolean>) || {}).filter(Boolean).length} toggles enabled</td>
                  <td className="px-4 py-4">
                    {Boolean(role.is_system) ? <Badge variant="accent">System</Badge> : <Badge variant="default">Custom</Badge>}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" size="sm" leftIcon={<Pencil size={14} />} onClick={() => openEdit(role as Record<string, unknown>)}>
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        leftIcon={<Trash2 size={14} />}
                        disabled={Boolean(role.is_system)}
                        onClick={() => handleDelete(String(role.id), Boolean(role.is_system))}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={Boolean(activeRole)}
        onClose={() => setActiveRole(null)}
        title={editingId ? "Edit role" : "Create role"}
        description="Adjust the role name, icon, color, and permission matrix."
        footer={
          <>
            <Button variant="secondary" onClick={() => setActiveRole(null)}>Cancel</Button>
            <Button onClick={submitRole} loading={createMutation.isPending || updateMutation.isPending}>Save role</Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={submitRole}>
          <Input label="Role name" {...form.register("name")} error={form.formState.errors.name?.message} />
          <Input label="Icon" placeholder="shield" {...form.register("icon")} />
          <Controller control={form.control} name="color" render={({ field }) => <ColorSwatchPicker value={field.value} onChange={field.onChange} />} />

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">Permission matrix</h4>
            <div className="space-y-4">
              {permissionKeys.map((group) => (
                <div key={group.key} className="rounded-lg border border-[var(--color-border)] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="font-medium text-[var(--color-text-primary)]">{group.label}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{group.actions.join(" / ")}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {group.actions.map((action) => {
                      const fieldName = `${group.key}_${action}`;
                      return (
                        <label key={fieldName} className="flex items-center gap-2 rounded-md border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text-secondary)]">
                          <input type="checkbox" {...form.register(`permissions.${fieldName}` as const)} />
                          {action}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>
      </Modal>
    </SectionFrame>
  );
}
