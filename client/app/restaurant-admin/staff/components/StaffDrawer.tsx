"use client";

import React, { useState } from "react";
import { X, Copy, Check, Eye, EyeOff, Calendar, Clock, DollarSign, Award, ClipboardList } from "lucide-react";
import { StaffMember, Role, Shift } from "../types";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import Link from "next/link";
import toast from "react-hot-toast";

interface StaffDrawerProps {
  member: StaffMember | null;
  roles: Role[];
  shifts: Shift[];
  onClose: () => void;
  onEdit: (member: StaffMember) => void;
  onStatusChange: (staffId: string, status: "Active" | "Inactive" | "On Leave") => void;
}

export default function StaffDrawer({
  member,
  roles,
  shifts,
  onClose,
  onEdit,
  onStatusChange,
}: StaffDrawerProps) {
  const [showSalary, setShowSalary] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Confirmations dialogs
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [confirmDeactivateOpen, setConfirmDeactivateOpen] = useState(false);

  if (!member) return null;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} copied to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getAvatarBg = (name: string) => {
    const colors = [
      "bg-[var(--color-blue-subtle)] text-[var(--color-blue)] border border-[var(--color-blue)]/20",
      "bg-[var(--color-accent-green-subtle)] text-[var(--color-accent-green)] border border-[var(--color-accent-green)]/20",
      "bg-[var(--color-warning-subtle)] text-[var(--color-warning)] border border-[var(--color-warning)]/20",
      "bg-[var(--color-danger-subtle)] text-[var(--color-danger)] border border-[var(--color-danger)]/20",
      "bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border border-[var(--color-accent)]/20",
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    return colors[sum % colors.length];
  };

  const getInitials = (first = "", last = "") => {
    return `${first[0] || ""}${last[0] || ""}`.toUpperCase() || "?";
  };

  const getRoleColor = (roleName: string) => {
    const match = roles.find((r) => r.name.toLowerCase() === roleName.toLowerCase());
    if (!match) return "default";
    const clr = match.color.toLowerCase();
    if (clr === "blue") return "blue";
    if (clr === "success" || clr === "green") return "success";
    if (clr === "warning" || clr === "orange" || clr === "amber") return "warning";
    if (clr === "danger" || clr === "red") return "danger";
    if (clr === "accent") return "accent";
    return "default";
  };

  const getShiftDetail = (shiftId: string) => {
    return shifts.find((s) => s.id === shiftId) || null;
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(val);
  };

  const getFullImageUrl = (url?: string | null) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
    return `${backendUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const shiftInfo = getShiftDetail(member.assigned_shift);
  const initials = getInitials(member.first_name, member.last_name);
  const avatarBg = getAvatarBg(`${member.first_name} ${member.last_name}`);

  return (
    <>
      {/* Drawer Overlay for Mobile/Tablet */}
      <div
        className="fixed inset-0 bg-[var(--color-bg-overlay)] z-30 lg:hidden transition-opacity"
        onClick={onClose}
      />

      <aside
        className="fixed top-0 right-0 h-full bg-[var(--color-bg-secondary)] border-l border-[var(--color-border)] shadow-2xl z-40 transition-transform duration-300 transform w-full max-sm:bottom-0 max-sm:top-auto max-sm:h-[90vh] max-sm:rounded-t-3xl max-sm:border-t lg:w-[420px] flex flex-col translate-x-0"
        style={{ zIndex: 100 }}
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            {member.profile_photo ? (
              <div className="h-12 w-12 rounded-full border border-[var(--color-border)] overflow-hidden bg-[var(--color-bg-tertiary)] flex items-center justify-center shrink-0">
                <ImageWithFallback
                  src={getFullImageUrl(member.profile_photo)}
                  alt={`${member.first_name} ${member.last_name}`}
                  width={48}
                  height={48}
                  className="object-cover h-full w-full"
                />
              </div>
            ) : (
              <div
                aria-label={`${member.first_name} ${member.last_name}`}
                className={`h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold shadow-inner ${avatarBg}`}
              >
                {initials}
              </div>
            )}
            <div>
              <h3 className="text-[length:var(--text-lg)] font-bold text-[var(--color-text-primary)]">
                {member.first_name} {member.last_name}
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                <Badge variant={getRoleColor(member.role)}>{member.role}</Badge>
                <Badge
                  variant={
                    member.status === "Active"
                      ? "success"
                      : member.status === "On Leave"
                      ? "warning"
                      : "default"
                  }
                >
                  {member.status}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(member)}
              className="text-xs font-bold text-[var(--color-accent-green)] hover:underline mr-2"
            >
              Edit Profile
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] transition-colors"
              aria-label="Close details panel"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable details content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Contact Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest flex items-center gap-1.5 border-b border-[var(--color-border)] pb-2 select-none">
              <ClipboardList className="h-4 w-4" />
              Contact Information
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 hover:bg-[var(--color-bg-tertiary)] rounded-md transition-colors">
                <div>
                  <p className="text-[var(--color-text-secondary)] font-semibold mb-0.5">Email</p>
                  <p className="font-bold text-[var(--color-text-primary)]">{member.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(member.email, "Email")}
                  className="p-1 rounded text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"
                  title="Copy email"
                >
                  {copiedField === "Email" ? (
                    <Check className="h-4 w-4 text-[var(--color-success)]" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between p-2 hover:bg-[var(--color-bg-tertiary)] rounded-md transition-colors">
                <div>
                  <p className="text-[var(--color-text-secondary)] font-semibold mb-0.5">Phone Number</p>
                  <p className="font-bold text-[var(--color-text-primary)]">{member.phone}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(member.phone, "Phone")}
                  className="p-1 rounded text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"
                  title="Copy phone"
                >
                  {copiedField === "Phone" ? (
                    <Check className="h-4 w-4 text-[var(--color-success)]" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Employment Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest flex items-center gap-1.5 border-b border-[var(--color-border)] pb-2 select-none">
              <DollarSign className="h-4 w-4" />
              Employment Details
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs p-2">
              <div>
                <p className="text-[var(--color-text-secondary)] font-semibold mb-0.5">Type</p>
                <p className="font-bold text-[var(--color-text-primary)]">{member.employment_type}</p>
              </div>
              <div>
                <p className="text-[var(--color-text-secondary)] font-semibold mb-0.5">Joined</p>
                <p className="font-bold text-[var(--color-text-primary)]">
                  {new Date(member.date_joined).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-[var(--color-text-secondary)] font-semibold mb-0.5 flex items-center gap-1">
                  Salary / Compensation
                  <button
                    type="button"
                    onClick={() => setShowSalary(!showSalary)}
                    className="p-0.5 hover:bg-[var(--color-bg-tertiary)] rounded inline-flex"
                    title={showSalary ? "Hide salary" : "Show salary"}
                  >
                    {showSalary ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </p>
                <p className="font-bold text-[var(--color-text-primary)]">
                  {showSalary ? formatCurrency(member.salary_rate) : "••••••"}
                </p>
              </div>
              <div>
                <p className="text-[var(--color-text-secondary)] font-semibold mb-0.5">Access PIN</p>
                <p className="font-bold text-[var(--color-text-primary)] font-mono">
                  {member.pin ? "••••" : "Not Set"}
                </p>
              </div>
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest flex items-center gap-1.5 border-b border-[var(--color-border)] pb-2 select-none">
              <Clock className="h-4 w-4" />
              Today's Schedule
            </h4>
            <div className="bg-[var(--color-bg-tertiary)] p-4 rounded-xl space-y-3 text-xs border border-[var(--color-border)]">
              <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-2">
                <div>
                  <p className="font-bold text-[var(--color-text-primary)]">
                    {shiftInfo ? shiftInfo.name : "Off Duty"}
                  </p>
                  <p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">
                    {shiftInfo
                      ? `${shiftInfo.start_time} - ${shiftInfo.end_time} • Break: ${shiftInfo.break_duration}`
                      : "No shift assigned today"}
                  </p>
                </div>
                {shiftInfo && (
                  <Badge variant="blue" className="normal-case">
                    Assigned
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div>
                  <p className="text-[10px] text-[var(--color-text-secondary)] mb-0.5 font-semibold">Clock-In</p>
                  <p className="font-bold text-[var(--color-text-primary)] text-sm">
                    {member.today_schedule?.clock_in || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--color-text-secondary)] mb-0.5 font-semibold">Clock-Out</p>
                  <p className="font-bold text-[var(--color-text-primary)] text-sm">
                    {member.today_schedule?.clock_out || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--color-text-secondary)] mb-0.5 font-semibold">Worked</p>
                  <p className="font-bold text-[var(--color-text-primary)] text-sm">
                    {member.today_schedule?.total_hours ? `${member.today_schedule.total_hours}h` : "0.0h"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Tables */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest flex items-center gap-1.5 border-b border-[var(--color-border)] pb-2 select-none">
              <Calendar className="h-4 w-4" />
              Assigned Tables
            </h4>
            <div className="p-2">
              {member.tables && member.tables.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {member.tables.map((tbl) => (
                    <Link
                      key={tbl}
                      href={`/restaurant-admin/table?table=${tbl}`}
                      className="px-3 py-1 bg-[var(--color-blue-subtle)] text-[var(--color-blue)] font-bold text-xs rounded-full border border-[var(--color-blue)]/20 hover:bg-[var(--color-blue)] hover:text-white transition duration-150"
                    >
                      Table {tbl}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[var(--color-text-muted)] italic font-semibold">
                  No tables assigned today
                </p>
              )}
            </div>
          </div>

          {/* Performance Overview (Read-Only) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest flex items-center gap-1.5 border-b border-[var(--color-border)] pb-2 select-none">
              <Award className="h-4 w-4" />
              Performance Today
            </h4>
            <div className="grid grid-cols-2 gap-4 p-2 text-xs">
              <div className="bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl p-3 text-center">
                <p className="text-[10px] text-[var(--color-text-muted)] font-semibold mb-1 uppercase tracking-wide">
                  Orders Handled
                </p>
                <p className="text-xl font-bold text-[var(--color-text-primary)]">
                  {member.performance?.orders_today || 0}
                </p>
                <p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">
                  Wk: {member.performance?.orders_week || 0} • Mo: {member.performance?.orders_month || 0}
                </p>
              </div>

              <div className="bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl p-3 text-center flex flex-col justify-between">
                <p className="text-[10px] text-[var(--color-text-muted)] font-semibold mb-1 uppercase tracking-wide">
                  Avg Order Value
                </p>
                <p className="text-xl font-bold text-[var(--color-accent-green)]">
                  {formatCurrency(member.performance?.avg_value || 0)}
                </p>
                <p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">
                  Performance Metric
                </p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest flex items-center gap-1.5 border-b border-[var(--color-border)] pb-2 select-none">
              <Clock className="h-4 w-4" />
              Recent Activity
            </h4>
            <div className="p-2 space-y-3 text-xs">
              {member.recent_activity && member.recent_activity.length > 0 ? (
                member.recent_activity.slice(0, 5).map((act, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <span className="text-[var(--color-text-primary)] font-semibold">{act.action}</span>
                    <span className="text-[10px] text-[var(--color-text-muted)] font-medium shrink-0 ml-3">
                      {act.time}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[var(--color-text-muted)] italic font-semibold">
                  No registered activities today
                </p>
              )}
              <div className="pt-2">
                <span className="text-xs font-bold text-[var(--color-accent-green)] hover:underline cursor-pointer">
                  View full history
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Actions Footer */}
        <div className="p-6 border-t border-[var(--color-border)] grid grid-cols-2 gap-4 bg-[var(--color-bg-secondary)] shrink-0">
          <Button
            variant="secondary"
            onClick={() => setConfirmLeaveOpen(true)}
            disabled={member.status !== "Active"}
            className="w-full h-11"
          >
            Mark On Leave
          </Button>
          <Button
            variant="danger"
            onClick={() => setConfirmDeactivateOpen(true)}
            disabled={member.status === "Inactive"}
            className="w-full h-11 border border-[var(--color-danger)]"
          >
            Deactivate
          </Button>
        </div>
      </aside>

      {/* Confirmation Modal: Mark On Leave */}
      <Modal
        open={confirmLeaveOpen}
        onClose={() => setConfirmLeaveOpen(false)}
        title={`Mark ${member.first_name} ${member.last_name} On Leave?`}
        description={`This will clear their scheduled hours for today and mark their status as "On Leave".`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmLeaveOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={() => {
                onStatusChange(member.id, "On Leave");
                setConfirmLeaveOpen(false);
              }}
            >
              Confirm
            </Button>
          </>
        }
        size="md"
      />

      {/* Confirmation Modal: Deactivate */}
      <Modal
        open={confirmDeactivateOpen}
        onClose={() => setConfirmDeactivateOpen(false)}
        title={`Deactivate ${member.first_name} ${member.last_name}?`}
        description={`Are you sure you want to deactivate this staff member? This will revoke all active credentials and block order access.`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDeactivateOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                onStatusChange(member.id, "Inactive");
                setConfirmDeactivateOpen(false);
              }}
            >
              Deactivate
            </Button>
          </>
        }
        size="md"
      />
    </>
  );
}
