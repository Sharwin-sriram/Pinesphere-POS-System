"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, Image, Loader2, Trash2 } from "lucide-react";
import { menuApi } from "../services/menuApi";
import { toast } from "react-hot-toast";
import { resolveMediaUrl } from "@/components/ui/mediaUrl";

interface ImageUploadZoneProps {
  value?: string | null;
  onChange: (url: string | null) => void;
}

export default function ImageUploadZone({ value, onChange }: ImageUploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Validate and upload file
  const processAndUploadFile = async (file: File) => {
    // Format check
    const acceptedFormats = ["image/jpeg", "image/png", "image/webp"];
    if (!acceptedFormats.includes(file.type)) {
      toast.error("Format not supported. Please upload JPG, PNG, or WEBP.");
      return;
    }

    // Size limit (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image too large. Maximum allowed size is 2MB.");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Uploading image...");

    try {
      const response = await menuApi.uploadImage(file);
      onChange(response.url);
      toast.success("Image uploaded successfully!", { id: toastId });
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err?.response?.data?.detail || "Upload failed. Try again.", { id: toastId });
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processAndUploadFile(file);
    }
  };

  const triggerPicker = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-semibold">
        Item Image
      </span>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!value && !isUploading ? triggerPicker : undefined}
        className={`relative h-44 w-full rounded-xl border border-dashed flex flex-col items-center justify-center p-4 transition-smooth cursor-pointer overflow-hidden ${
          value ? "border-[var(--color-border)] cursor-default" : ""
        } ${isDragActive ? "border-[var(--color-accent-green)] bg-[var(--color-accent-green-subtle)]" : "border-[var(--color-border)] bg-[var(--color-bg-tertiary)] hover:border-[var(--color-border-hover)]"}`}
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
          <div className="flex flex-col items-center gap-3 text-[var(--color-text-secondary)]">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent-green)]" strokeWidth={1.5} />
            <span className="text-[length:var(--text-sm)] font-medium">Uploading to server...</span>
          </div>
        ) : value ? (
          // Previews Uploaded Image
          <div className="relative h-full w-full group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolveMediaUrl(value)}
              alt="Uploaded preview"
              className="h-full w-full object-cover rounded-lg"
            />
            {/* Hover Actions Controls overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={triggerPicker}
                className="px-3.5 py-2 rounded-lg bg-white hover:bg-gray-100 text-[var(--color-text-primary)] text-xs font-semibold shadow-sm transition-all"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-3.5 py-2 rounded-lg bg-[var(--color-danger)] hover:bg-[var(--color-danger-hover)] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                Remove
              </button>
            </div>
          </div>
        ) : (
          // Empty / Drag & Drop Upload Zone State
          <div className="flex flex-col items-center text-center gap-3 text-[var(--color-text-secondary)]">
            <div className="p-3 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-sm text-[var(--color-text-muted)] group-hover:text-[var(--color-accent-green)] group-hover:border-[var(--color-accent-green)] transition-colors">
              <UploadCloud className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[length:var(--text-sm)] font-semibold text-[var(--color-text-primary)]">
                Drag and drop image here, or <span className="text-[var(--color-accent-green)] font-bold">browse</span>
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)] tracking-wide">
                Supports JPG, PNG, WEBP up to 2MB
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
