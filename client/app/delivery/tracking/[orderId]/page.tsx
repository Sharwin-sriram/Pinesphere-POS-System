"use client";

import { useParams } from "next/navigation";
import DeliveryTimeline from "../../components/DeliveryTimeline";

export default function OrderTrackingDetailsPage() {
  const params = useParams();

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      {/* Header */}
      <div className="card-light !p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Order Tracking Details</h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">Tracking ID: {params.orderId}</p>
          </div>
          <span className="bg-[var(--color-success-subtle)] text-[var(--color-success)] px-4 py-2 rounded-full text-xs font-semibold">
            Out for Delivery
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
          <div className="bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl p-5">
            <p className="text-sm text-[var(--color-text-secondary)] font-medium">Assigned Rider</p>
            <h2 className="text-2xl font-bold mt-2 text-[var(--color-text-primary)]">Arjun</h2>
          </div>

          <div className="bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl p-5">
            <p className="text-sm text-[var(--color-text-secondary)] font-medium">Estimated Arrival</p>
            <h2 className="text-2xl font-bold mt-2 text-[var(--color-accent)]">18 mins</h2>
          </div>

          <div className="bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl p-5">
            <p className="text-sm text-[var(--color-text-secondary)] font-medium">Payment Method</p>
            <h2 className="text-2xl font-bold mt-2 text-[var(--color-text-primary)]">UPI</h2>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <DeliveryTimeline />

      {/* Customer & Delivery Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="card-light !p-5">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Customer Details</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Name</span>
              <span className="font-semibold text-[var(--color-text-primary)]">Rahul Sharma</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Address</span>
              <span className="font-semibold text-[var(--color-text-primary)]">RS Puram, Coimbatore</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Phone</span>
              <span className="font-semibold text-[var(--color-text-primary)]">+91 9876543210</span>
            </div>
          </div>
        </div>

        <div className="card-light !p-5">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Delivery Notes</h2>
          <div className="space-y-3 text-sm text-[var(--color-text-secondary)]">
            <div className="flex items-start gap-2">
              <span className="text-[var(--color-accent)]">•</span>
              <p>Leave order at the front gate</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[var(--color-accent)]">•</span>
              <p>Call customer before arrival</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[var(--color-accent)]">•</span>
              <p>Delivery proof image placeholder</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}