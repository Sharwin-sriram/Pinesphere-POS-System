"use client";

import { useEffect, useState } from "react";
import { deliveryApi } from "../services/delivery.service";
import { AlertCircle, CheckCircle2, Clock, MapPin, Navigation, Receipt, Utensils } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RiderSimulatorModal({ isOpen, onClose, onSuccess }: Props) {
  const [orders, setOrders] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [selectedRider, setSelectedRider] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  async function loadData() {
    setLoading(true);
    try {
      const [ordersData, ridersData] = await Promise.all([
        deliveryApi.getOrders(),
        deliveryApi.getRiders()
      ]);
      setOrders(ordersData.filter((o: any) => o.status === "requested" || o.status === "pending"));
      setRiders(ridersData.filter((r: any) => r.status === "available"));
      if (ridersData.length > 0) setSelectedRider(ridersData[0].id);
    } catch (error) {
      console.error("Failed to load data for simulator:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(orderId: string) {
    if (!selectedRider) return;
    setProcessing(true);
    try {
      await deliveryApi.acceptOrder(orderId, selectedRider);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to accept order:", error);
    } finally {
      setProcessing(false);
    }
  }

  async function handleReject(orderId: string) {
    if (!selectedRider) return;
    setProcessing(true);
    try {
      await deliveryApi.rejectOrder(orderId, selectedRider);
      // Remove from list
      setOrders(orders.filter(o => o.id !== orderId));
    } catch (error) {
      console.error("Failed to reject order:", error);
    } finally {
      setProcessing(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] w-full max-w-2xl rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto animate-fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
              <Navigation className="text-[var(--color-accent)]" size={24} />
              Rider App Simulator
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">Test the delivery acceptance flow</p>
          </div>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
            ✕
          </button>
        </div>

        {loading ? (
          <div className="py-10 text-center text-[var(--color-text-secondary)]">Loading requests...</div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-[var(--color-text-primary)]">Simulate as Rider:</label>
              <select 
                value={selectedRider}
                onChange={(e) => setSelectedRider(e.target.value)}
                className="input-light py-2 px-3 flex-1"
              >
                {riders.length === 0 && <option value="">No available riders</option>}
                {riders.map(r => (
                  <option key={r.id} value={r.id}>{r.name} ({r.vehicle_type || 'Unknown Vehicle'})</option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-[var(--color-text-primary)] border-b border-[var(--color-border)] pb-2">
                New Delivery Requests ({orders.length})
              </h3>
              
              {orders.length === 0 ? (
                <div className="bg-[var(--color-bg-tertiary)] rounded-xl p-8 flex flex-col items-center justify-center text-[var(--color-text-muted)]">
                  <AlertCircle size={32} className="mb-2 opacity-50" />
                  <p>No pending delivery requests</p>
                </div>
              ) : (
                orders.map((order: any) => (
                  <div key={order.id} className="bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl p-5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-accent)]"></div>
                    
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="bg-[var(--color-accent-subtle)] text-[var(--color-accent)] text-xs font-bold px-2 py-1 rounded">
                          {order.eta || '15 mins'} away
                        </span>
                        <h4 className="text-lg font-bold text-[var(--color-text-primary)] mt-2">
                          Order #{order.order_details?.order_number || order.order_id}
                        </h4>
                      </div>
                      <div className="text-right">
                        <p className="text-[var(--color-text-secondary)] text-sm">Earnings</p>
                        <p className="text-xl font-bold text-[var(--color-success)]">
                          ₹{(parseFloat(order.order_details?.total_amount || 0) * 0.1).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-5">
                      <div className="flex items-start gap-3 text-sm">
                        <Utensils size={18} className="text-[var(--color-text-muted)] mt-0.5" />
                        <div>
                          <p className="font-medium text-[var(--color-text-primary)]">Dishes</p>
                          <ul className="text-[var(--color-text-secondary)] list-disc pl-4 mt-1">
                            {order.order_details?.items?.map((item: any, idx: number) => (
                              <li key={idx}>{item.quantity}x {item.item_name}</li>
                            )) || <li>No dish details available</li>}
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 text-sm">
                        <MapPin size={18} className="text-[var(--color-text-muted)] mt-0.5" />
                        <div>
                          <p className="font-medium text-[var(--color-text-primary)]">Delivery to</p>
                          <p className="text-[var(--color-text-secondary)] mt-0.5">
                            {order.order_details?.customer_name || 'Guest'} - {order.dropoff_address || 'Address not provided'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 text-sm">
                        <Receipt size={18} className="text-[var(--color-text-muted)] mt-0.5" />
                        <div>
                          <p className="font-medium text-[var(--color-text-primary)]">Bill Total</p>
                          <p className="text-[var(--color-text-secondary)] mt-0.5">₹{order.order_details?.total_amount || "0"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-[var(--color-border)]">
                      <button 
                        onClick={() => handleReject(order.id)}
                        disabled={processing || !selectedRider}
                        className="btn-secondary-light flex-1 py-2 font-medium"
                      >
                        Reject
                      </button>
                      <button 
                        onClick={() => handleAccept(order.id)}
                        disabled={processing || !selectedRider}
                        className="bg-[var(--color-accent)] text-[var(--color-text-inverse)] rounded-xl flex-1 py-2 font-medium flex items-center justify-center gap-2 hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
                      >
                        <CheckCircle2 size={18} />
                        Accept Delivery
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
