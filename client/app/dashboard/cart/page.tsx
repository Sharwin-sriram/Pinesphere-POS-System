"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ChevronRight,
  MapPin,
  CreditCard,
  Bike,
  Clock,
  LogIn,
} from "lucide-react";
import { useCart } from "../../components/dashboard/CartContext";
import { settingsApi } from "@/lib/settingsApi";
import authService, { httpClient } from "../../lib/authService";

const DELIVERY_FEE = 29;
const FREE_DELIVERY_THRESHOLD = 499;

type DeliveryMode = "delivery" | "pickup";

interface TaxRate {
  id: string;
  name: string;
  percentage: number;
  applies_to: string;
  compound?: boolean;
}

function QuantityStepper({
  quantity,
  onDecrement,
  onIncrement,
}: {
  quantity: number;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] p-0.5">
      <button
        onClick={onDecrement}
        className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-danger)] transition-smooth"
        aria-label="Decrease quantity"
      >
        <Minus className="h-3 w-3" strokeWidth={2} />
      </button>
      <span className="w-6 text-center text-sm font-semibold text-[var(--color-text-primary)]">
        {quantity}
      </span>
      <button
        onClick={onIncrement}
        className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-blue)] transition-smooth"
        aria-label="Increase quantity"
      >
        <Plus className="h-3 w-3" strokeWidth={2} />
      </button>
    </div>
  );
}

function EmptyCart({ isAuthenticated }: { isAuthenticated: boolean }) {
  const title = isAuthenticated ? "Your cart is empty" : "Login to access the cart";
  const description = isAuthenticated
    ? "Add items from a restaurant to get started."
    : "Sign in to view your cart, update items, and place an order.";
  const ctaLabel = isAuthenticated ? "Browse restaurants" : "Login";
  const ctaHref = isAuthenticated ? "/dashboard" : "/login?next=%2Fdashboard%2Fcart";
  const Icon = isAuthenticated ? ShoppingBag : LogIn;

  return (
    <div className="flex min-h-[55vh] flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-bg-tertiary)]">
        <Icon className="h-7 w-7 text-[var(--color-text-muted)]" strokeWidth={1.75} />
      </div>
      <p className="text-lg font-semibold text-[var(--color-text-primary)]">{title}</p>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">{description}</p>
      <Link
        href={ctaHref}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)] transition-smooth"
      >
        {ctaLabel}
        <ChevronRight className="h-4 w-4" strokeWidth={2} />
      </Link>
    </div>
  );
}

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, restaurantId: cartRestaurantId } = useCart();
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("delivery");
  const [address, setAddress] = useState("");
  const [editingAddress, setEditingAddress] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [loadingTaxes, setLoadingTaxes] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const loadSavedAddress = async () => {
      try {
        const response = await httpClient.get("/api/addresses/");
        const responseData = response?.data?.results ?? response?.data?.data ?? response?.data ?? [];
        const addresses = Array.isArray(responseData) ? responseData : [];
        const preferredAddress = addresses.find((item) => item.is_default) ?? addresses[0];

        if (!preferredAddress) {
          setAddress("");
          return;
        }

        setAddress(
          preferredAddress.full_address ||
            [
              preferredAddress.street_address,
              preferredAddress.apartment_suite,
              preferredAddress.city,
              preferredAddress.state,
              preferredAddress.postal_code,
            ]
              .filter(Boolean)
              .join(", ")
        );
      } catch (error) {
        console.error("Failed to load saved address:", error);
        setAddress("");
      }
    };

    if (isMounted) {
      loadSavedAddress();
    }
  }, [isMounted]);

  useEffect(() => {
    const fetchTaxRates = async () => {
      try {
        setLoadingTaxes(true);
        const restaurantId = cartRestaurantId || cartItems[0]?.restaurant;
        if (!restaurantId) {
          setTaxRates([]);
          setLoadingTaxes(false);
          return;
        }

        const rates = await settingsApi.getTaxRates(restaurantId);
        setTaxRates(Array.isArray(rates) ? rates : []);
      } catch (error) {
        console.error("Failed to fetch tax rates:", error);
        setTaxRates([]);
      } finally {
        setLoadingTaxes(false);
      }
    };

    if (isMounted && cartItems.length > 0) {
      fetchTaxRates();
    }
  }, [cartItems, isMounted]);

  const getOriginalUnitPrice = (item: { original_price?: number; price: number }) => item.original_price ?? item.price;
  const getEffectiveUnitPrice = (item: { discounted_price?: number | null; effective_price?: number; price: number }) =>
    item.discounted_price ?? item.effective_price ?? item.price;

  if (!isMounted) {
    return <div className="min-h-[65vh]" aria-hidden="true" />;
  }

  const isAuthenticated = authService.isAuthenticated() || !!authService.getCurrentUser();

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center py-10 animate-fade-in-up">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-bg-tertiary)]">
            <ShoppingBag className="h-7 w-7 text-[var(--color-text-muted)]" strokeWidth={1.25} />
          </div>
          <p className="text-base font-semibold text-[var(--color-text-primary)]">Login required</p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)] max-w-md">
            You need to be signed in to view your cart, update items, and place an order.
          </p>
          <Link
            href="/login?next=%2Fdashboard%2Fcart"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)] transition-smooth"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  // Calculate tax based on restaurant settings
  const calculateTax = (subtotal: number): number => {
    if (taxRates.length === 0) return 0;

    const effectiveOrderType = deliveryMode === "pickup" ? "takeout" : "delivery";
    let totalTax = 0;
    let taxBase = subtotal;

    for (const rate of taxRates) {
      if (rate.applies_to !== "all" && rate.applies_to !== effectiveOrderType) {
        continue;
      }

      const rateTax = (taxBase * rate.percentage) / 100;
      totalTax += rateTax;

      if (rate.compound) {
        taxBase += rateTax;
      }
    }

    return Math.round(totalTax * 100) / 100;
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + getOriginalUnitPrice(item) * item.quantity,
    0
  );
  const discountedSubtotal = cartItems.reduce(
    (sum, item) => sum + getEffectiveUnitPrice(item) * item.quantity,
    0
  );
  const discount = Math.max(subtotal - discountedSubtotal, 0);
  const deliveryFee = deliveryMode === "pickup" ? 0 : discountedSubtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const tax = calculateTax(discountedSubtotal);
  const total = discountedSubtotal + deliveryFee + tax;
  const savings = (deliveryMode === "delivery" && discountedSubtotal >= FREE_DELIVERY_THRESHOLD ? DELIVERY_FEE : 0) + discount;
  const canPlaceOrder = deliveryMode !== "delivery" || Boolean(address.trim());

  const handlePlaceOrder = async () => {
    if (isPlacingOrder || cartItems.length === 0) {
      return;
    }

    if (deliveryMode === "delivery" && !address.trim()) {
      toast.error("Add a delivery address before placing the order.");
      return;
    }

    setIsPlacingOrder(true);

    try {
      const currentUser = authService.getCurrentUser();
      // Ensure restaurant_id is always set - try multiple sources in order of priority
      const restaurantId = currentUser?.restaurant_id || cartRestaurantId || cartItems[0]?.restaurantId || cartItems[0]?.restaurant;
      
      if (!restaurantId) {
        toast.error("Unable to determine restaurant. Please refresh and try again.");
        setIsPlacingOrder(false);
        return;
      }
      
      const branchId = currentUser?.branch_id || null;
      const orderPayload = {
        restaurant_id: restaurantId,
        branch_id: branchId,
        source: "web",
        delivery_type: deliveryMode,
        customer_id: currentUser?.id || null,
        external_id: `razorpay_${Date.now()}`,
        customer_name:
          currentUser?.name || [currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(" "),
        customer_phone: currentUser?.mobile || "",
        delivery_address: deliveryMode === "delivery" ? address : null,
        metadata: {
          order_type: deliveryMode,
          delivery_address: deliveryMode === "delivery" ? address : null,
          customer_name: currentUser?.name || [currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(" "),
        },
        notes: [
          deliveryMode === "delivery" ? `Delivery address: ${address}` : "Pickup order",
          instructions.trim() ? `Instructions: ${instructions.trim()}` : "",
        ]
          .filter(Boolean)
          .join(" | "),
        items: cartItems.map((item) => ({
          menu_item_id: item.menu_item_id ?? item.id,
          name: item.name,
          quantity: item.quantity,
          unit_price: getEffectiveUnitPrice(item),
        })),
      };

      // Import Razorpay service
      const { razorpayService } = await import("../../../lib/razorpayService");

      // Create Razorpay order
      const razorpayOrder = await razorpayService.createOrder({
        amount: total,
        currency: "INR",
        receipt: `order_${Date.now()}`,
        customer_name: orderPayload.customer_name,
        customer_email: currentUser?.email || "",
        customer_phone: orderPayload.customer_phone,
        notes: {
          order_type: deliveryMode,
          delivery_address: address,
          customer_name: orderPayload.customer_name,
        },
      });

      // Open Razorpay payment modal
      await razorpayService.openPaymentModal(razorpayOrder, {
        onSuccess: async (paymentResponse) => {
          try {
            // Process payment and create order
            const result = await razorpayService.processPayment(paymentResponse, orderPayload);
            
            try {
              await clearCart();
            } catch (clearError) {
              console.error("Order created but cart could not be cleared", clearError);
            }

            toast.success(`Payment successful! Order placed.`);
            // Redirect to order confirmation page
            window.location.href = `/dashboard/orders/${result.order_id}`;
          } catch (error: any) {
            const message = error?.message || "Failed to process payment";
            toast.error(message);
            setIsPlacingOrder(false);
          }
        },
        onError: (error) => {
          toast.error("Payment failed. Please try again.");
          setIsPlacingOrder(false);
        },
        onDismiss: () => {
          setIsPlacingOrder(false);
        },
      });
    } catch (error: any) {
      const message = error?.message || "Failed to initiate payment";
      toast.error(message);
      setIsPlacingOrder(false);
    }
  };

  const buildOrderPayload = () => {
    const currentUser = authService.getCurrentUser();
    const restaurantId = currentUser?.restaurant_id || cartRestaurantId || cartItems[0]?.restaurantId || cartItems[0]?.restaurant || null;
    const branchId = currentUser?.branch_id || null;

    return {
      restaurant_id: restaurantId,
      branch_id: branchId,
      source: "web",
      delivery_type: deliveryMode,
      customer_id: currentUser?.id || null,
      external_id: `razorpay_${Date.now()}`,
      customer_name:
        currentUser?.name || [currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(" "),
      customer_phone: currentUser?.mobile || "",
      delivery_address: deliveryMode === "delivery" ? address : null,
      metadata: {
        order_type: deliveryMode,
        delivery_address: deliveryMode === "delivery" ? address : null,
        customer_name: currentUser?.name || [currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(" "),
      },
      notes: [
        deliveryMode === "delivery" ? `Delivery address: ${address}` : "Pickup order",
        instructions.trim() ? `Instructions: ${instructions.trim()}` : "",
      ]
        .filter(Boolean)
        .join(" | "),
      items: cartItems.map((item) => ({
        menu_item_id: item.menu_item_id ?? item.id,
        name: item.name,
        quantity: item.quantity,
        unit_price: getEffectiveUnitPrice(item),
      })),
    };
  };

  const simulateSuccessfulOrderPlacement = async () => {
    if (isPlacingOrder || cartItems.length === 0) {
      return;
    }

    if (deliveryMode === "delivery" && !address.trim()) {
      toast.error("Add a delivery address before placing the order.");
      return;
    }

    setIsPlacingOrder(true);

    try {
      const orderPayload = buildOrderPayload();
      const response = await httpClient.post("/api/v1/orders/", orderPayload);
      const orderId = response.data?.data?.id || response.data?.id;

      try {
        await clearCart();
      } catch (clearError) {
        console.error("Order created but cart could not be cleared", clearError);
      }

      toast.success("Test order placed successfully.");
      window.location.href = `/dashboard/orders/${orderId}`;
    } catch (error: any) {
      const message = error?.response?.data?.detail || error?.message || "Failed to simulate order placement";
      toast.error(message);
      setIsPlacingOrder(false);
    }
  };
  return (
    <div className="animate-fade-in-up space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)] transition-smooth"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          </Link>
          <div>
            <h1 className="text-[length:var(--text-xl)] font-semibold text-[var(--color-text-primary)]">Your Cart</h1>
            <p className="text-[length:var(--text-sm)] text-[var(--color-text-secondary)]">
              {cartItems.reduce((t, i) => t + i.quantity, 0)} item{cartItems.reduce((t, i) => t + i.quantity, 0) !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        {cartItems.length > 0 && (
          <button
            onClick={clearCart}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs font-medium text-[var(--color-danger)] hover:border-red-200 hover:bg-red-50 transition-smooth"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            Clear cart
          </button>
        )}
      </div>

      {/* Cart content */}
      {cartItems.length === 0 ? (
        <EmptyCart isAuthenticated={isAuthenticated} />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">

          {/* Left column */}
          <div className="space-y-4">

            {/* Fulfillment */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">Fulfillment</p>
              <div className="grid grid-cols-2 gap-2">
                {(["delivery", "pickup"] as DeliveryMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setDeliveryMode(mode)}
                    className={[
                      "flex items-center justify-center gap-2 rounded-lg border py-3 text-sm font-semibold transition-smooth",
                      deliveryMode === mode
                        ? "border-[var(--color-blue)] bg-blue-50 text-[var(--color-blue)]"
                        : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)]",
                    ].join(" ")}
                  >
                    {mode === "delivery" ? <Bike className="h-4 w-4" strokeWidth={1.75} /> : <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />}
                    {mode === "delivery" ? "Delivery" : "Pickup"}
                  </button>
                ))}
              </div>
              {deliveryMode === "delivery" && (
                <div className="mt-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-text-muted)]" strokeWidth={1.5} />
                      {editingAddress ? (
                        <input
                          autoFocus
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          onBlur={() => setEditingAddress(false)}
                          className="w-full bg-transparent text-sm text-[var(--color-text-primary)] outline-none"
                        />
                      ) : (
                        <p className={`text-sm truncate ${address ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)]"}`}>
                          {address || "Add an address"}
                        </p>
                      )}
                    </div>
                    <Link href="/dashboard/account" className="shrink-0 text-xs font-medium text-[var(--color-blue)] hover:underline">
                      {address ? "Change" : "Add address"}
                    </Link>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                    <Clock className="h-3 w-3" strokeWidth={1.75} />
                    {address ? "Estimated delivery: 25–35 min" : "Add an address to continue with delivery"}
                  </div>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] overflow-hidden">
              <div className="border-b border-[var(--color-border)] px-5 py-3.5">
                <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">Items</p>
              </div>
              <ul className="divide-y divide-[var(--color-border)]">
                {cartItems.map((item) => (
                  <li key={item.id} className="flex items-center gap-4 px-5 py-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] overflow-hidden">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} width={56} height={56} className="h-full w-full object-cover" />
                      ) : (
                        <ShoppingBag className="h-5 w-5" strokeWidth={1.25} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{item.name}</p>
                      {item.restaurant && <p className="text-xs text-[var(--color-text-muted)] truncate">{item.restaurant}</p>}
                      {getEffectiveUnitPrice(item) < getOriginalUnitPrice(item) ? (
                        <div className="mt-0.5 flex flex-col gap-0.5">
                          <p className="text-sm font-medium text-[var(--color-accent)]">₹{getEffectiveUnitPrice(item).toFixed(2)}</p>
                          <p className="text-xs font-medium text-[var(--color-text-muted)] line-through">₹{getOriginalUnitPrice(item).toFixed(2)}</p>
                        </div>
                      ) : (
                        <p className="mt-0.5 text-sm font-medium text-[var(--color-text-secondary)]">₹{getOriginalUnitPrice(item).toFixed(2)}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <QuantityStepper
                        quantity={item.quantity}
                        onDecrement={() => updateQuantity(item.id, item.quantity - 1)}
                        onIncrement={() => updateQuantity(item.id, item.quantity + 1)}
                      />
                      <p className="w-16 text-right text-sm font-semibold text-[var(--color-text-primary)]">
                        ₹{(getEffectiveUnitPrice(item) * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:bg-red-50 hover:text-[var(--color-danger)] transition-smooth"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Special instructions */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5">
              <label htmlFor="instructions" className="mb-2 block text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
                Special instructions
              </label>
              <textarea
                id="instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="E.g. no onions, extra spicy, ring the bell…"
                rows={3}
                className="field-shell w-full resize-none p-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none"
              />
            </div>
          </div>

            {/* Right column: order summary */}
          <div className="space-y-4">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5 lg:sticky lg:top-24">
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">Order summary</p>

              {discount > 0 && (
                <div className="flex justify-between text-sm font-medium text-[var(--color-success)]">
                  <span>Item discount</span><span>−₹{discount.toFixed(2)}</span>
                </div>
              )}

              {deliveryMode === "delivery" && discountedSubtotal < FREE_DELIVERY_THRESHOLD && (
                <div className="mt-4 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2.5">
                  <p className="text-xs font-medium text-amber-700">
                    Add ₹{(FREE_DELIVERY_THRESHOLD - discountedSubtotal).toFixed(0)} more for free delivery
                  </p>
                  <div className="mt-1.5 h-1.5 w-full rounded-full bg-amber-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all duration-500"
                      style={{ width: `${Math.min((discountedSubtotal / FREE_DELIVERY_THRESHOLD) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="mt-4 space-y-2.5">
                <div className="flex justify-between text-sm text-[var(--color-text-secondary)]">
                  <span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-[var(--color-text-secondary)]">
                  <span>Delivery fee</span>
                  <span className={deliveryFee === 0 ? "text-[var(--color-success)] font-medium" : ""}>
                    {deliveryFee === 0 ? (deliveryMode === "pickup" ? "Free (Pickup)" : "Free") : `₹${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                {taxRates.length > 0 && (
                  <div className="flex justify-between text-sm text-[var(--color-text-secondary)]">
                    <span>Tax ({taxRates.map(r => r.percentage).join('% + ')}%)</span><span>₹{tax.toFixed(2)}</span>
                  </div>
                )}
                {savings > 0 && (
                  <div className="flex justify-between text-sm font-medium text-[var(--color-success)]">
                    <span>You save</span><span>−₹{savings.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-[var(--color-border)] pt-2.5 text-base font-semibold text-[var(--color-text-primary)]">
                  <span>Total</span><span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-3 py-2.5">
                <CreditCard className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" strokeWidth={1.5} />
                <p className="text-xs text-[var(--color-text-secondary)]">Payment collected at checkout</p>
              </div>

              <Button
                onClick={handlePlaceOrder}
                loading={isPlacingOrder}
                className="mt-4 w-full"
                variant="success"
                size="lg"
                disabled={!canPlaceOrder}
              >
                <span className="block w-full text-center text-sm md:text-base font-semibold">
                  Place order · ₹{total.toFixed(2)}
                </span>
              </Button>

              <button
                onClick={simulateSuccessfulOrderPlacement}
                disabled={isPlacingOrder}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[var(--color-blue)] bg-blue-50 py-2.5 text-sm font-semibold text-[var(--color-blue)] hover:bg-blue-100 transition-smooth disabled:cursor-not-allowed disabled:opacity-60"
              >
                Simulate successful order placement
              </button>

              <Link
                href="/dashboard"
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--color-border)] py-2.5 text-sm font-medium text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)] transition-smooth"
              >
                <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
