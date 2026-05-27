"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { X, UploadCloud, Loader2, Eye, EyeOff, AlertTriangle, Plus, Check } from "lucide-react";
import { StaffMember, Role, Shift } from "../types";
import { staffApi } from "../services/staffApi";
import { menuApi } from "../../menu/services/menuApi"; // Reuses existing upload API
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: Partial<StaffMember>) => Promise<any>;
  editMember: StaffMember | null;
  roles: Role[];
  shifts: Shift[];
  restaurantId: string;
  onAddRole: (name: string, color: string) => Promise<Role>;
}

export default function StaffModal({
  isOpen,
  onClose,
  onSubmit,
  editMember,
  roles,
  shifts,
  restaurantId,
  onAddRole,
}: StaffModalProps) {
  const isEdit = !!editMember;

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  const [role, setRole] = useState("");
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [dateJoined, setDateJoined] = useState("");
  const [salaryRate, setSalaryRate] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive" | "On Leave">("Active");
  const [assignedShift, setAssignedShift] = useState("");
  const [pin, setPin] = useState("");
  const [adminAccess, setAdminAccess] = useState(false);

  // UI state controls
  const [showCompensation, setShowCompensation] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Validation states
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Inline role creation states
  const [showAddRoleInput, setShowAddRoleInput] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [isAddingRole, setIsAddingRole] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize fields on open or change
  useEffect(() => {
    if (isOpen) {
      if (editMember) {
        setFirstName(editMember.first_name || "");
        setLastName(editMember.last_name || "");
        setEmail(editMember.email || "");
        setPhone(editMember.phone || "");
        setDob(editMember.dob || "");
        setProfilePhoto(editMember.profile_photo || null);
        setRole(editMember.role || "");
        setEmploymentType(editMember.employment_type || "Full-time");
        setDateJoined(editMember.date_joined || "");
        setSalaryRate(editMember.salary_rate ? String(editMember.salary_rate) : "");
        setStatus(editMember.status || "Active");
        setAssignedShift(editMember.assigned_shift || "");
        setPin(editMember.pin || "");
        setAdminAccess(editMember.admin_access || false);
      } else {
        setFirstName("");
        setLastName("");
        setEmail("");
        setPhone("");
        setDob("");
        setProfilePhoto(null);
        setRole(roles[0]?.name || "");
        setEmploymentType("Full-time");
        setDateJoined(new Date().toISOString().split("T")[0]);
        setSalaryRate("");
        setStatus("Active");
        setAssignedShift(shifts[0]?.id || "");
        setPin("");
        setAdminAccess(false);
      }
      setErrors({});
      setShowDiscardConfirm(false);
      setShowAddRoleInput(false);
      setNewRoleName("");
    }
  }, [isOpen, editMember, roles, shifts]);

  // Check if form is dirty
  const isDirty = () => {
    if (isEdit && editMember) {
      return (
        firstName !== (editMember.first_name || "") ||
        lastName !== (editMember.last_name || "") ||
        email !== (editMember.email || "") ||
        phone !== (editMember.phone || "") ||
        dob !== (editMember.dob || "") ||
        profilePhoto !== (editMember.profile_photo || null) ||
        role !== (editMember.role || "") ||
        employmentType !== (editMember.employment_type || "Full-time") ||
        dateJoined !== (editMember.date_joined || "") ||
        salaryRate !== (editMember.salary_rate ? String(editMember.salary_rate) : "") ||
        status !== (editMember.status || "Active") ||
        assignedShift !== (editMember.assigned_shift || "") ||
        pin !== (editMember.pin || "") ||
        adminAccess !== (editMember.admin_access || false)
      );
    }
    return (
      firstName !== "" ||
      lastName !== "" ||
      email !== "" ||
      phone !== "" ||
      dob !== "" ||
      profilePhoto !== null ||
      role !== (roles[0]?.name || "") ||
      employmentType !== "Full-time" ||
      dateJoined !== new Date().toISOString().split("T")[0] ||
      salaryRate !== "" ||
      status !== "Active" ||
      assignedShift !== (shifts[0]?.id || "") ||
      pin !== "" ||
      adminAccess !== false
    );
  };

  const handleCloseTrigger = () => {
    if (isDirty()) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  // ─── Validation Helpers ───

  const validateEmail = async (val: string) => {
    if (!val) return "Email address is required";
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(val)) return "Please enter a valid email address";

    // Unique check
    try {
      const res = await staffApi.checkEmail(restaurantId, val, editMember?.id);
      if (!res.is_available) {
        return "Email already registered";
      }
    } catch {
      // Offline fallback
    }
    return "";
  };

  const handleEmailBlur = async () => {
    const err = await validateEmail(email);
    setErrors((prev) => ({ ...prev, email: err }));
  };

  const validatePin = async (val: string) => {
    if (!val) return "";
    const regex = /^\d{4}$/;
    if (!regex.test(val)) return "PIN must be exactly 4 numeric digits";

    try {
      const res = await staffApi.checkPin(restaurantId, val, editMember?.id);
      if (!res.is_available) {
        return "PIN code already assigned to another member";
      }
    } catch {
      // Offline fallback
    }
    return "";
  };

  const handlePinBlur = async () => {
    const err = await validatePin(pin);
    setErrors((prev) => ({ ...prev, pin: err }));
  };

  const validateDob = (val: string) => {
    if (!val) return "";
    const dobDate = new Date(val);
    const eighteenYearsAgo = new Date();
    eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
    if (dobDate > eighteenYearsAgo) {
      return "Staff member must be at least 18 years old";
    }
    return "";
  };

  const handleDobBlur = () => {
    const err = validateDob(dob);
    setErrors((prev) => ({ ...prev, dob: err }));
  };

  // ─── Image Upload Helpers ───

  const processAndUploadFile = async (file: File) => {
    const acceptedFormats = ["image/jpeg", "image/png", "image/webp"];
    if (!acceptedFormats.includes(file.type)) {
      toast.error("Format not supported. Please upload JPG, PNG, or WEBP.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image too large. Maximum allowed size is 2MB.");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Uploading photo...");

    try {
      const response = await menuApi.uploadImage(file);
      setProfilePhoto(response.url);
      toast.success("Photo uploaded successfully!", { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error("Upload failed. Try again.", { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndUploadFile(file);
    }
  };

  // ─── Inline Role Creator ───

  const handleAddRole = async () => {
    const name = newRoleName.trim();
    if (!name) return;

    setIsAddingRole(true);
    try {
      const systemColors = ["blue", "success", "accent", "warning", "danger"];
      const randomColor = systemColors[roles.length % systemColors.length];
      const created = await onAddRole(name, randomColor);
      setRole(created.name);
      setShowAddRoleInput(false);
      setNewRoleName("");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to create role");
    } finally {
      setIsAddingRole(false);
    }
  };

  // ─── Form Submission ───

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setErrors({});

    // Client side checks
    let hasErr = false;
    const tempErrors: Record<string, string> = {};

    if (!firstName.trim() || firstName.length < 2 || firstName.length > 50) {
      tempErrors.firstName = "First name is required (2-50 characters)";
      hasErr = true;
    }
    if (!lastName.trim() || lastName.length < 2 || lastName.length > 50) {
      tempErrors.lastName = "Last name is required (2-50 characters)";
      hasErr = true;
    }
    if (!phone.trim()) {
      tempErrors.phone = "Phone number is required";
      hasErr = true;
    }
    if (!dateJoined) {
      tempErrors.dateJoined = "Date joined is required";
      hasErr = true;
    }

    const emailErr = await validateEmail(email);
    if (emailErr) {
      tempErrors.email = emailErr;
      hasErr = true;
    }

    const dobErr = validateDob(dob);
    if (dobErr) {
      tempErrors.dob = dobErr;
      hasErr = true;
    }

    const pinErr = await validatePin(pin);
    if (pinErr) {
      tempErrors.pin = pinErr;
      hasErr = true;
    }

    if (hasErr) {
      setErrors(tempErrors);
      toast.error("Please resolve the validation errors first.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        dob: dob || undefined,
        profile_photo: profilePhoto || "",
        role: role,
        employment_type: employmentType,
        date_joined: dateJoined,
        salary_rate: salaryRate ? parseFloat(salaryRate) : 0,
        status: status,
        assigned_shift: assignedShift,
        pin: pin || undefined,
        admin_access: adminAccess,
      });
      onClose();
    } catch {
      // Handled in parent
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFullImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
    return `${backendUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const footer = (
    <>
      <Button variant="secondary" onClick={handleCloseTrigger} disabled={isSubmitting}>
        Cancel
      </Button>
      <Button variant="success" onClick={handleSubmit} loading={isSubmitting}>
        {isEdit ? "Save Changes" : "Add Staff Member"}
      </Button>
    </>
  );

  return (
    <>
      <Modal
        open={isOpen}
        onClose={handleCloseTrigger}
        title={isEdit ? "Edit Staff Member" : "Add Staff Member"}
        description={
          isEdit
            ? "Modify profile details, employment configuration, and role credentials."
            : "Register a new team member and configure their access permissions."
        }
        footer={footer}
        size="lg"
        closeOnOverlayClick={false}
        className="max-w-[700px]"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Profile Image Drag Zone */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl">
            <div
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className="h-24 w-24 rounded-full border-2 border-dashed border-[var(--color-border-strong)] flex flex-col items-center justify-center cursor-pointer hover:border-[var(--color-accent-green)] transition overflow-hidden bg-[var(--color-bg-secondary)] shrink-0"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              {isUploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-[var(--color-accent-green)]" />
              ) : profilePhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getFullImageUrl(profilePhoto)}
                  alt="Profile Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center text-center p-1">
                  <UploadCloud className="h-5 w-5 text-[var(--color-text-muted)]" />
                  <span className="text-[9px] font-semibold text-[var(--color-text-muted)] mt-1">Upload</span>
                </div>
              )}
            </div>
            <div>
              <h4 className="text-xs font-bold text-[var(--color-text-primary)]">Profile Photo</h4>
              <p className="text-[10px] text-[var(--color-text-muted)] mt-1 leading-normal">
                Supported formats: JPG, PNG, or WEBP. Max file size: 2MB. Add an avatar to represent them in logs and directories.
              </p>
            </div>
          </div>

          {/* Section 2: Personal Information */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider border-b border-[var(--color-border)] pb-2 select-none">
              Personal Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name *"
                placeholder="e.g. Sarah"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: "" }));
                }}
                error={errors.firstName}
                required
              />
              <Input
                label="Last Name *"
                placeholder="e.g. Jenkins"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (errors.lastName) setErrors((prev) => ({ ...prev, lastName: "" }));
                }}
                error={errors.lastName}
                required
              />
              <Input
                label="Email Address *"
                placeholder="e.g. sarah.j@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                }}
                onBlur={handleEmailBlur}
                error={errors.email}
                required
                disabled={isEdit} // Email is read-only in edit mode as per Task 7 spec
              />
              <Input
                label="Phone Number *"
                placeholder="e.g. +1 (555) 123-4567"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
                }}
                error={errors.phone}
                required
              />
              <Input
                label="Date of Birth"
                type="date"
                value={dob}
                onChange={(e) => {
                  setDob(e.target.value);
                  if (errors.dob) setErrors((prev) => ({ ...prev, dob: "" }));
                }}
                onBlur={handleDobBlur}
                error={errors.dob}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-[length:var(--text-sm)] font-medium text-[var(--color-text-secondary)]">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e: any) => setStatus(e.target.value)}
                  className="h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-4 text-[length:var(--text-base)] text-[var(--color-text-primary)] focus:outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Employment Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider border-b border-[var(--color-border)] pb-2 select-none">
              Employment Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Role Selection with Inline add role input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[length:var(--text-sm)] font-medium text-[var(--color-text-secondary)]">
                  Assigned Role *
                </label>
                {!showAddRoleInput ? (
                  <div className="flex gap-2">
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="h-10 flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-4 text-[length:var(--text-base)] text-[var(--color-text-primary)] focus:outline-none"
                    >
                      {roles.map((r) => (
                        <option key={r.id} value={r.name}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowAddRoleInput(true)}
                      className="h-10 w-10 border border-[var(--color-border)] hover:border-[var(--color-border-hover)] bg-[var(--color-bg-tertiary)] rounded-md flex items-center justify-center cursor-pointer text-[var(--color-text-primary)]"
                      title="Add Custom Role inline"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 animate-fade-in-up">
                    <input
                      type="text"
                      placeholder="Enter new role..."
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      className="h-10 flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 text-[length:var(--text-base)] text-[var(--color-text-primary)] focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleAddRole}
                      disabled={isAddingRole || !newRoleName.trim()}
                      className="h-10 w-10 bg-[var(--color-accent-green)] hover:bg-[var(--color-accent-green-hover)] text-white rounded-md flex items-center justify-center cursor-pointer disabled:opacity-40"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddRoleInput(false)}
                      className="h-10 w-10 border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] rounded-md flex items-center justify-center cursor-pointer text-xs font-bold"
                    >
                      X
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[length:var(--text-sm)] font-medium text-[var(--color-text-secondary)]">
                  Employment Type *
                </label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className="h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-4 text-[length:var(--text-base)] text-[var(--color-text-primary)] focus:outline-none"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>

              <Input
                label="Date Joined *"
                type="date"
                value={dateJoined}
                onChange={(e) => {
                  setDateJoined(e.target.value);
                  if (errors.dateJoined) setErrors((prev) => ({ ...prev, dateJoined: "" }));
                }}
                error={errors.dateJoined}
                required
              />

              {/* Compensation with visibility show compensation toggle */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[length:var(--text-sm)] font-medium text-[var(--color-text-secondary)] flex items-center gap-1.5 justify-between">
                  <span>Salary / Compensation Rate ($)</span>
                  <button
                    type="button"
                    onClick={() => setShowCompensation(!showCompensation)}
                    className="p-1 text-xs text-[var(--color-text-muted)] hover:underline inline-flex items-center gap-1"
                  >
                    {showCompensation ? (
                      <>
                        <EyeOff className="h-3.5 w-3.5" /> Hide compensation
                      </>
                    ) : (
                      <>
                        <Eye className="h-3.5 w-3.5" /> Show compensation
                      </>
                    )}
                  </button>
                </label>
                <input
                  type={showCompensation ? "number" : "password"}
                  step="0.01"
                  placeholder="e.g. 18.50"
                  value={salaryRate}
                  onChange={(e) => setSalaryRate(e.target.value)}
                  className="h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-4 text-[length:var(--text-base)] text-[var(--color-text-primary)] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Shift Assignment */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider border-b border-[var(--color-border)] pb-2 select-none">
              Shift Assignment
            </h4>
            {shifts.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                <label className="text-[length:var(--text-sm)] font-medium text-[var(--color-text-secondary)]">
                  Assigned Shift
                </label>
                <select
                  value={assignedShift}
                  onChange={(e) => setAssignedShift(e.target.value)}
                  className="h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-4 text-[length:var(--text-base)] text-[var(--color-text-primary)] focus:outline-none"
                >
                  <option value="">Off Today</option>
                  {shifts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.start_time} - {s.end_time})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="p-3 bg-[var(--color-danger-subtle)] text-[var(--color-danger)] rounded-lg text-xs font-semibold">
                No shifts configured —{" "}
                <Link href="/restaurant-admin/settings" className="underline font-bold">
                  set them up in Settings
                </Link>
              </div>
            )}
          </div>

          {/* Section 5: Access & Security Credentials */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider border-b border-[var(--color-border)] pb-2 select-none">
              Access & Security Credentials
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[length:var(--text-sm)] font-medium text-[var(--color-text-secondary)] flex items-center justify-between">
                  <span>Terminal Access PIN (4-Digits) *</span>
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="p-1 text-xs text-[var(--color-text-muted)] hover:underline inline-flex items-center gap-1"
                  >
                    {showPin ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </label>
                <input
                  type={showPin ? "text" : "password"}
                  placeholder="e.g. 1234"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value.replace(/\D/g, ""));
                    if (errors.pin) setErrors((prev) => ({ ...prev, pin: "" }));
                  }}
                  onBlur={handlePinBlur}
                  className={`h-10 w-full rounded-md border bg-[var(--color-bg-tertiary)] px-4 text-[length:var(--text-base)] text-[var(--color-text-primary)] focus:outline-none ${
                    errors.pin ? "border-[var(--color-danger)]" : "border-[var(--color-border)]"
                  }`}
                />
                {errors.pin && <p className="text-[10px] text-[var(--color-danger)] font-bold">{errors.pin}</p>}
              </div>

              <div className="flex flex-col gap-2 justify-center">
                <label className="flex items-center gap-3 text-xs font-semibold text-[var(--color-text-primary)] select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adminAccess}
                    onChange={(e) => setAdminAccess(e.target.checked)}
                    className="peer h-4 w-4 rounded border border-[var(--color-border-strong)] text-[var(--color-accent-green)] transition focus:outline-none"
                  />
                  <span>Grants Full Restaurant Admin Access</span>
                </label>
                {adminAccess && (
                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[var(--color-warning-subtle)] border border-amber-200 text-[10px] leading-relaxed text-[var(--color-warning)] font-semibold animate-fade-in-up">
                    <AlertTriangle className="h-4.5 w-4.5 shrink-0" strokeWidth={1.5} />
                    <span>
                      WARNING: This grants full dashboard access to adjust pricing, franchise, table structures, and billing rules.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* Discard Changes Warn Modal */}
      <Modal
        open={showDiscardConfirm}
        onClose={() => setShowDiscardConfirm(false)}
        title="Discard Unsaved Changes?"
        description="Are you sure you want to exit? All changes made in the staff form will be permanently lost."
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDiscardConfirm(false)}>
              Keep Editing
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setShowDiscardConfirm(false);
                onClose();
              }}
            >
              Discard Changes
            </Button>
          </>
        }
        size="md"
      />
    </>
  );
}
