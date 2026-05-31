import { z } from "zod";

const timeStringSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM format");
const hexColorSchema = z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Use a valid hex color");

export const permissionMatrixSchema = z.record(z.boolean());

export const operatingHourSchema = z.object({
  day: z.number().int().min(0).max(6),
  closed: z.boolean(),
  open: timeStringSchema.nullable().optional(),
  close: timeStringSchema.nullable().optional(),
});

export const restaurantProfileSchema = z.object({
  name: z.string().min(1, "Restaurant name is required"),
  address: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  tax_id: z.string().optional().default(""),
  default_timezone: z.string().min(1),
  currency: z.string().min(1),
  language: z.string().min(1),
  locale: z.string().min(1),
  operating_hours: z.array(operatingHourSchema).length(7),
  table_count: z.number().int().min(0),
  floor_capacity: z.number().int().min(0),
});

export const roleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Role name is required"),
  color: z.string().min(1),
  icon: z.string().optional().default(""),
  permissions: permissionMatrixSchema.optional().default({}),
  sort_order: z.number().int().min(0).optional().default(0),
  is_system: z.boolean().optional(),
});

export const menuCategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional().default(""),
  emoji: z.string().optional().default(""),
  color: z.string().min(1),
  is_active: z.boolean(),
  start_time: timeStringSchema.nullable().optional(),
  end_time: timeStringSchema.nullable().optional(),
  kds_station_id: z.string().optional().default(""),
  parent_id: z.string().optional().default(""),
  sort_order: z.number().int().min(0).optional().default(0),
});

export const kdsStationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  label: z.string().optional().default(""),
  color: z.string().min(1),
  type: z.enum(["PREP", "EXPO", "BAR", "PASS"]),
  printer: z.string().optional().nullable(),
  alert_seconds: z.number().int().min(0),
  critical_seconds: z.number().int().min(0),
  sound_enabled: z.boolean(),
  layout: z.enum(["grid", "list", "ticket"]),
  menu_category_ids: z.array(z.string()).default([]),
  is_active: z.boolean(),
  sort_order: z.number().int().min(0).default(0),
});

export const shiftTemplateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  start_time: timeStringSchema,
  end_time: timeStringSchema,
  days_of_week: z.array(z.number().int().min(0).max(6)).default([]),
  role_ids: z.array(z.string()).default([]),
  min_staff: z.number().int().min(0),
  staff_assignments: z.array(z.object({
    id: z.string(),
    userId: z.string(),
    roleId: z.string().optional().default(""),
  })).default([]),
  overtime_threshold_hours: z.number().int().min(0),
  allow_swaps: z.boolean(),
  sort_order: z.number().int().min(0).default(0),
});

export const printerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  label: z.string().optional().default(""),
  printer_type: z.enum(["thermal", "inkjet", "laser"]),
  connection_type: z.enum(["usb", "bluetooth", "lan", "wifi", "serial"]),
  printer_address: z.string().min(1),
  port_number: z.number().int().min(1).max(65535),
  is_active: z.boolean(),
  is_default: z.boolean(),
  paper_width: z.number().int().min(58).max(112),
  paper_size: z.string().min(1),
  encoding: z.string().min(1),
  auto_cut: z.boolean(),
  cash_drawer_enabled: z.boolean(),
  assigned_order_types: z.array(z.string()).default([]),
});

export const paymentRateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  percentage: z.number().min(0),
  applies_to: z.enum(["all", "dine-in", "takeout", "delivery"]),
  compound: z.boolean().default(false),
});

export const paymentSettingsSchema = z.object({
  accepted_payment_methods: z.object({
    cash: z.boolean(),
    card: z.boolean(),
    tap: z.boolean(),
    qr: z.boolean(),
  }),
  tax_rates: z.array(paymentRateSchema),
  service_charge: z.object({
    type: z.enum(["percentage", "flat"]),
    value: z.number().min(0),
    auto_apply: z.boolean(),
    applies_to: z.enum(["all", "dine-in", "takeout", "delivery"]),
  }),
  tip_presets: z.array(z.union([z.number(), z.literal("custom")])),
  rounding_rule: z.enum(["0.01", "0.05", "0.10"]),
  terminal_ids: z.object({
    stripe: z.string(),
    square: z.string(),
  }),
});

export const notificationSettingsSchema = z.object({
  email: z.object({
    new_order: z.boolean(),
    low_inventory: z.boolean(),
    shift_reminder: z.boolean(),
    daily_report: z.boolean(),
  }),
  sms: z.object({
    new_order: z.boolean(),
    low_inventory: z.boolean(),
    shift_reminder: z.boolean(),
    daily_report: z.boolean(),
  }),
  sms_phone: z.string().optional().default(""),
  role_preferences: z.record(z.boolean()),
  escalation_minutes: z.number().int().min(0),
  summary_schedule: z.string().min(1),
});

export const securitySettingsSchema = z.object({
  session_timeout: z.number().int().min(5),
  pin_login_enabled: z.boolean(),
  totp_enabled: z.boolean(),
  ip_allowlist: z.array(z.string()),
  audit_log_retention_days: z.number().int().min(1),
  password_policy: z.object({
    min_length: z.number().int().min(6),
    uppercase: z.boolean(),
    number: z.boolean(),
    symbol: z.boolean(),
  }),
});

export const integrationEntrySchema = z.object({
  connected: z.boolean().optional(),
  enabled: z.boolean().optional(),
  api_key: z.string().optional().default(""),
  connected_at: z.string().optional(),
});

export const integrationSettingsSchema = z.record(z.any());

export const colorSwatches = [
  "#0f172a",
  "#334155",
  "#475569",
  "#64748b",
  "#0f766e",
  "#15803d",
  "#1d4ed8",
  "#7c3aed",
  "#b45309",
  "#be123c",
  "#dc2626",
  "#ea580c",
] as const;

export type RestaurantProfileFormValues = z.infer<typeof restaurantProfileSchema>;
export type RoleFormValues = z.infer<typeof roleSchema>;
export type MenuCategoryFormValues = z.infer<typeof menuCategorySchema>;
export type KdsStationFormValues = z.infer<typeof kdsStationSchema>;
export type ShiftTemplateFormValues = z.infer<typeof shiftTemplateSchema>;
export type PrinterFormValues = z.infer<typeof printerSchema>;
export type PaymentSettingsFormValues = z.infer<typeof paymentSettingsSchema>;
export type NotificationSettingsFormValues = z.infer<typeof notificationSettingsSchema>;
export type SecuritySettingsFormValues = z.infer<typeof securitySettingsSchema>;
export type PaymentRateFormValues = z.infer<typeof paymentRateSchema>;
export type IntegrationSettingsFormValues = z.infer<typeof integrationSettingsSchema>;
