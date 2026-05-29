"use client";

// ─── KDS Type Definitions ───────────────────────────────────────────────────

export type KDSTicketStatus = "pending" | "printed" | "recalled" | "bumped" | "held";
export type KDSCourse = "starter" | "main" | "side" | "dessert";
export type KDSOrderType = "dine_in" | "takeaway" | "delivery";
export type KDSUrgency = "normal" | "warning" | "critical";

export interface KDSItemDetail {
  id: string;
  name: string;
  quantity: number;
  special_instructions: string;
}

export interface KDSTicket {
  id: string;
  kot_number: string;
  order: string;
  order_number: string | null;
  table_number: string | null;
  kitchen: string;
  department: string | null;
  status: KDSTicketStatus;
  course: KDSCourse;
  order_type: KDSOrderType;
  items: string[];
  item_details: KDSItemDetail[];
  special_instructions: string | null;
  allergy_flags: string[];
  hold: boolean;
  bumped_at: string | null;
  bumped_by: string | null;
  bumped_by_name: string | null;
  recalled_at: string | null;
  created_at: string;
  updated_at: string;
  elapsed_seconds: number;
}

export interface KDSStats {
  active_count: number;
  overdue_count: number;
  bumped_today: number;
  avg_prep_seconds: number;
}

export interface KDSTicketsResponse {
  results: KDSTicket[];
  count: number;
}

export interface KDSStation {
  id: string;
  name: string;
  kitchen_type: string;
}

export type KDSFilterStatus = "active" | "bumped" | "held";
