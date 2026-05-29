"use client";

import React, { useState } from "react";
import { Edit2, Eye, Trash2 } from "lucide-react";
import { StaffMember, Role, Shift } from "../types";
import Badge from "@/components/ui/Badge";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import Skeleton from "@/components/ui/Skeleton";

interface StaffTableProps {
  staff: StaffMember[];
  roles: Role[];
  shifts: Shift[];
  loading: boolean;
  onEdit: (member: StaffMember) => void;
  onView: (member: StaffMember) => void;
  onDelete: (member: StaffMember) => void;
  onStatusChange: (staffId: string, status: "Active" | "Inactive" | "On Leave") => void;
}

export default function StaffTable({
  staff,
  roles,
  shifts,
  loading,
  onEdit,
  onView,
  onDelete,
  onStatusChange,
}: StaffTableProps) {
  const [activeStatusSelect, setActiveStatusSelect] = useState<string | null>(null);

  // Deterministic Avatar Backgrounds mapped to token themes
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
    // Map to valid badge variant
    if (clr === "blue") return "blue";
    if (clr === "success" || clr === "green") return "success";
    if (clr === "warning" || clr === "orange" || clr === "amber") return "warning";
    if (clr === "danger" || clr === "red") return "danger";
    if (clr === "accent") return "accent";
    return "default";
  };

  const getShiftTimeRange = (shiftId: string) => {
    const match = shifts.find((s) => s.id === shiftId);
    return match ? `${match.start_time} - ${match.end_time}` : "Off Today";
  };

  const getFullImageUrl = (url?: string | null) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
    return `${backendUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  if (loading) {
    return (
      <div className="w-full overflow-x-auto rounded-ds-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        <table className="w-full border-collapse text-left text-[length:var(--text-base)]">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] font-semibold text-[length:var(--text-sm)] uppercase tracking-wider">
              <th className="py-4 px-5 w-16">Staff</th>
              <th className="py-4 px-4 min-w-[150px]">Name</th>
              <th className="py-4 px-4">Role</th>
              <th className="py-4 px-4">Contact</th>
              <th className="py-4 px-4">Shift</th>
              <th className="py-4 px-4 text-center">Status</th>
              <th className="py-4 px-4 text-center w-28">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="py-4 px-5">
                  <Skeleton className="h-10 w-10 rounded-full" />
                </td>
                <td className="py-4 px-4">
                  <Skeleton className="h-4 w-28 rounded" />
                </td>
                <td className="py-4 px-4">
                  <Skeleton className="h-5 w-16 rounded" />
                </td>
                <td className="py-4 px-4">
                  <Skeleton className="h-4 w-32 rounded mb-1" />
                  <Skeleton className="h-3.5 w-24 rounded" />
                </td>
                <td className="py-4 px-4">
                  <Skeleton className="h-4 w-24 rounded" />
                </td>
                <td className="py-4 px-4 text-center">
                  <Skeleton className="h-5 w-16 rounded mx-auto" />
                </td>
                <td className="py-4 px-4">
                  <Skeleton className="h-8 w-24 rounded mx-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-ds-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
      <table className="w-full border-collapse text-left text-[length:var(--text-base)]">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] font-semibold text-[length:var(--text-sm)] uppercase tracking-wider select-none">
            <th className="py-4 px-5 w-16">Staff</th>
            <th className="py-4 px-4 min-w-[150px]">Name</th>
            <th className="py-4 px-4">Role</th>
            <th className="py-4 px-4">Contact</th>
            <th className="py-4 px-4">Shift</th>
            <th className="py-4 px-4 text-center">Status</th>
            <th className="py-4 px-4 text-center w-28">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {staff.map((member) => {
            const isSelectedForStatus = activeStatusSelect === member.id;
            const initials = getInitials(member.first_name, member.last_name);
            const avatarBg = getAvatarBg(`${member.first_name} ${member.last_name}`);
            const isClockedIn =
              member.status === "Active" &&
              member.today_schedule?.clock_out === "Still on shift";

            return (
              <tr
                key={member.id}
                className="transition-colors duration-150 hover:bg-[var(--color-bg-primary)] group"
              >
                {/* Avatar Column */}
                <td className="py-4 px-5">
                  {member.profile_photo ? (
                    <div className="h-10 w-10 rounded-full border border-[var(--color-border)] overflow-hidden bg-[var(--color-bg-tertiary)] flex items-center justify-center shrink-0">
                      <ImageWithFallback
                        src={getFullImageUrl(member.profile_photo)}
                        alt={`${member.first_name} ${member.last_name}`}
                        width={40}
                        height={40}
                        className="object-cover h-full w-full"
                      />
                    </div>
                  ) : (
                    <div
                      aria-label={`${member.first_name} ${member.last_name}`}
                      className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarBg}`}
                    >
                      {initials}
                    </div>
                  )}
                </td>

                {/* Name */}
                <td className="py-4 px-4">
                  <div
                    className="font-bold text-[var(--color-text-primary)] max-w-[180px] truncate"
                    title={`${member.first_name} ${member.last_name}`}
                  >
                    {member.first_name} {member.last_name}
                  </div>
                  <div className="text-[10px] text-[var(--color-text-muted)] font-semibold mt-0.5 uppercase tracking-wider">
                    {member.employment_type}
                  </div>
                </td>

                {/* Role */}
                <td className="py-4 px-4">
                  <Badge variant={getRoleColor(member.role)}>{member.role}</Badge>
                </td>

                {/* Contact stacked */}
                <td className="py-4 px-4 text-[length:var(--text-sm)]">
                  <div
                    className="font-medium text-[var(--color-text-primary)] max-w-[180px] truncate"
                    title={member.email}
                  >
                    {member.email}
                  </div>
                  <div className="text-[var(--color-text-secondary)] mt-0.5">{member.phone}</div>
                </td>

                {/* Shift */}
                <td className="py-4 px-4 text-[length:var(--text-sm)]">
                  <div className="font-semibold text-[var(--color-text-primary)]">
                    {getShiftTimeRange(member.assigned_shift)}
                  </div>
                  {isClockedIn && (
                    <span className="text-[9px] font-bold text-[var(--color-success)] uppercase tracking-wider flex items-center gap-1 mt-0.5 leading-none">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)] animate-pulse" />
                      Currently Clocked In
                    </span>
                  )}
                </td>

                {/* Status Toggle Badge */}
                <td className="py-4 px-4 text-center relative">
                  {!isSelectedForStatus ? (
                    <button
                      type="button"
                      onClick={() => setActiveStatusSelect(member.id)}
                      className="focus:outline-none cursor-pointer active:scale-95 transition-transform"
                      aria-label={`Change status for ${member.first_name}. Current status: ${member.status}`}
                    >
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
                    </button>
                  ) : (
                    <div className="inline-flex flex-col bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-md shadow-lg p-1.5 z-20 absolute left-1/2 -translate-x-1/2 top-4 min-w-[110px]">
                      <button
                        type="button"
                        onClick={() => {
                          onStatusChange(member.id, "Active");
                          setActiveStatusSelect(null);
                        }}
                        className="px-2 py-1 text-left text-xs font-semibold hover:bg-[var(--color-bg-tertiary)] rounded text-[var(--color-success)] w-full"
                      >
                        Active
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onStatusChange(member.id, "On Leave");
                          setActiveStatusSelect(null);
                        }}
                        className="px-2 py-1 text-left text-xs font-semibold hover:bg-[var(--color-bg-tertiary)] rounded text-[var(--color-warning)] w-full"
                      >
                        On Leave
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onStatusChange(member.id, "Inactive");
                          setActiveStatusSelect(null);
                        }}
                        className="px-2 py-1 text-left text-xs font-semibold hover:bg-[var(--color-bg-tertiary)] rounded text-[var(--color-text-secondary)] w-full"
                      >
                        Inactive
                      </button>
                      <div className="border-t border-[var(--color-border)] my-1"></div>
                      <button
                        type="button"
                        onClick={() => setActiveStatusSelect(null)}
                        className="px-2 py-0.5 text-center text-[10px] text-[var(--color-text-muted)] hover:underline hover:text-[var(--color-text-primary)] w-full"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </td>

                {/* Action Buttons */}
                <td className="py-4 px-4 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onView(member)}
                      className="p-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-smooth flex items-center justify-center shrink-0 cursor-pointer h-10 w-10"
                      title="View Details"
                    >
                      <Eye className="h-4.5 w-4.5" strokeWidth={1.5} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(member)}
                      className="p-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-smooth flex items-center justify-center shrink-0 cursor-pointer h-10 w-10"
                      title="Edit Staff"
                    >
                      <Edit2 className="h-4.5 w-4.5" strokeWidth={1.5} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(member)}
                      disabled={isClockedIn}
                      className={`p-2 rounded-lg border flex items-center justify-center shrink-0 h-10 w-10 ${
                        isClockedIn
                          ? "border-[var(--color-border)] text-[var(--color-text-disabled)] cursor-not-allowed opacity-50"
                          : "border-[var(--color-border)] text-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)] hover:border-red-200 transition-smooth cursor-pointer"
                      }`}
                      title={isClockedIn ? "Cannot remove staff while on shift" : "Delete Staff"}
                    >
                      <Trash2 className="h-4.5 w-4.5" strokeWidth={1.5} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
