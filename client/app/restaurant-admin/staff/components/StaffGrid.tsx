"use client";

import React, { useState } from "react";
import { Edit2, Eye, Trash2, MoreVertical, Mail, Phone, Clock } from "lucide-react";
import { StaffMember, Role, Shift } from "../types";
import Badge from "@/components/ui/Badge";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import Skeleton from "@/components/ui/Skeleton";

interface StaffGridProps {
  staff: StaffMember[];
  roles: Role[];
  shifts: Shift[];
  loading: boolean;
  onEdit: (member: StaffMember) => void;
  onView: (member: StaffMember) => void;
  onDelete: (member: StaffMember) => void;
}

export default function StaffGrid({
  staff,
  roles,
  shifts,
  loading,
  onEdit,
  onView,
  onDelete,
}: StaffGridProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="card-light !p-6 flex flex-col items-center relative animate-pulse">
            <Skeleton className="h-20 w-20 rounded-full mb-4" />
            <Skeleton className="h-5 w-32 rounded mb-2" />
            <Skeleton className="h-4 w-20 rounded mb-4" />
            <Skeleton className="h-4 w-40 rounded mb-2" />
            <Skeleton className="h-4 w-32 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {staff.map((member) => {
        const initials = getInitials(member.first_name, member.last_name);
        const avatarBg = getAvatarBg(`${member.first_name} ${member.last_name}`);
        const isMenuOpen = activeMenuId === member.id;
        const isClockedIn =
          member.status === "Active" &&
          member.today_schedule?.clock_out === "Still on shift";

        return (
          <div
            key={member.id}
            className="card-light !p-6 flex flex-col items-center relative transition-smooth hover:shadow-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
          >
            {/* Top Badge Indicators */}
            <div className="absolute top-4 left-4">
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

            {/* Three Dot Action Button Menu */}
            <div className="absolute top-4 right-4 z-10">
              <button
                type="button"
                onClick={() => setActiveMenuId(isMenuOpen ? null : member.id)}
                className="p-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] transition duration-150 h-8 w-8 flex items-center justify-center cursor-pointer"
                title="Actions"
                aria-label={`Action menu for ${member.first_name}`}
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {isMenuOpen && (
                <>
                  {/* Backdrop listener to close menu click-outside */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setActiveMenuId(null)}
                  />
                  <div className="absolute right-0 mt-1.5 w-32 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg shadow-lg py-1 z-20">
                    <button
                      type="button"
                      onClick={() => {
                        onView(member);
                        setActiveMenuId(null);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] flex items-center gap-2"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>View</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onEdit(member);
                        setActiveMenuId(null);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] flex items-center gap-2"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!isClockedIn) {
                          onDelete(member);
                        }
                        setActiveMenuId(null);
                      }}
                      disabled={isClockedIn}
                      className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center gap-2 ${
                        isClockedIn
                          ? "text-[var(--color-text-disabled)] cursor-not-allowed opacity-50"
                          : "text-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)]"
                      }`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Profile Avatar */}
            <div className="mt-4 mb-4">
              {member.profile_photo ? (
                <div className="h-20 w-20 rounded-full border border-[var(--color-border)] overflow-hidden bg-[var(--color-bg-tertiary)] flex items-center justify-center shadow-inner">
                  <ImageWithFallback
                    src={getFullImageUrl(member.profile_photo)}
                    alt={`${member.first_name} ${member.last_name}`}
                    width={80}
                    height={80}
                    className="object-cover h-full w-full"
                  />
                </div>
              ) : (
                <div
                  aria-label={`${member.first_name} ${member.last_name}`}
                  className={`h-20 w-20 rounded-full flex items-center justify-center text-lg font-bold shadow-inner ${avatarBg}`}
                >
                  {initials}
                </div>
              )}
            </div>

            {/* Name and Role */}
            <h3 className="font-bold text-[var(--color-text-primary)] text-md text-center max-w-full truncate">
              {member.first_name} {member.last_name}
            </h3>
            <div className="mt-1.5 mb-4">
              <Badge variant={getRoleColor(member.role)}>{member.role}</Badge>
            </div>

            <div className="w-full border-t border-[var(--color-border)] pt-4 space-y-2.5 text-xs text-[var(--color-text-secondary)]">
              {/* Shift */}
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-[var(--color-text-muted)] shrink-0" />
                <span className="truncate" title={getShiftTimeRange(member.assigned_shift)}>
                  {getShiftTimeRange(member.assigned_shift)}
                </span>
                {isClockedIn && (
                  <span className="h-2 w-2 rounded-full bg-[var(--color-success)] shrink-0 animate-pulse" title="Clocked In" />
                )}
              </div>

              {/* Contact Information */}
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-[var(--color-text-muted)] shrink-0" />
                <span className="truncate" title={member.email}>
                  {member.email}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-[var(--color-text-muted)] shrink-0" />
                <span className="truncate">{member.phone}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
