"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Tag,
  ChevronRight,
  MapPin,
  CreditCard,
  Bike,
  Clock,
  CheckCircle2,
  Star,
  Sparkles,
} from "lucide-react";
import { useCart } from "../../components/dashboard/CartContext";
import { useRouter } from "next/navigation";
import authService from "../../lib/authService";

const DELIVERY_FEE = 29;
const TAX_RATE = 0.05;
const FREE_DELIVERY_THRESHOLD = 499;

type DeliveryMode = "delivery" | "pickup";

const RECOMMENDED = [
  {
    id: "rec-1",
    name: "Classic Cheeseburger",
    restaurant: "Burger King",
    rating: 4.5,
    price: 199,
    tag: "Bestseller",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "rec-2",
    name: "Margherita Pizza",
    restaurant: "Domino's Pizza",
    rating: 4.2,
    price: 249,
    tag: "Popular",
    imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "rec-3",
    name: "Chicken Biryani",
    restaurant: "Behrouz Biryani",
    rating: 4.8,
    price: 349,
    tag: "Top rated",
    imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "rec-4",
    name: "Chocolate Truffle Cake",
    restaurant: "Theobroma",
    rating: 4.7,
    price: 550,
    tag: "Must try",
    imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "rec-5",
    name: "Paneer Tikka",
    restaurant: "Punjab Grill",
    rating: 4.4,
    price: 279,
    tag: "Trending",
    imageUrl: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "rec-6",
    name: "Masala Dosa",
    restaurant: "Saravana Bhavan",
    rating: 4.6,
    price: 129,
    tag: "Value pick",
    imageUrl: "https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=400&q=80",
  },
];

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

function RecommendedCard({ item }: { item: (typeof RECOMMENDED)[number] }) {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const inCart = cartItems.find((c) => c.id === item.id);
  const [isRestaurantUser, setIsRestaurantUser] = useState(false);

  useEffect(() => {
    const role = authService.getUserRole();
    setIsRestaurantUser(["ORGANIZATION_OWNER", "restaurant", "restaurant-admin"].includes(role || ""));
  }, []);

  return (
    <div className="group flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] overflow-hidden hover:border-[var(--color-border-hover)] transition-smooth">
      <div className="relative h-36 w-full overflow-hidden bg-[var(--color-bg-tertiary)]">
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
        <span className="absolute left-2 top-2 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-text-primary)] backdrop-blur-sm">
          {item.tag}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-3">
        <p className="text-sm font-semibold text-[var(--color-text-primary)] line-clamp-1">{item.name}</p>
        <p className="mt-0.5 text-xs text-[var(--color-text-muted)] line-clamp-1">{item.restaurant}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" strokeWidth={0} />
              <span className="text-xs font-medium text-[var(--color-text-secondary)]">{item.rating}</span>
            </div>
            <p className="mt-0.5 text-sm font-semibold text-[var(--color-text-primary)]">₹{item.price}</p>
          </div>
          {!isRestaurantUser ? (
            inCart ? (
              <QuantityStepper
                quantity={inCart.quantity}
                onDecrement={() => updateQuantity(item.id, inCart.quantity - 1)}
                onIncrement={() => updateQuantity(item.id, inCart.quantity + 1)}
              />
            ) : (
              <button
                onClick={() => addToCart({ id: item.id, name: item.name, price: item.price, restaurant: item.restaurant, image: item.imageUrl })}
                className="flex h-8 items-center gap-1 rounded-lg bg-[var(--color-accent)] px-3 text-xs font-semibold text-white hover:bg-[var(--color-accent-hover)] transition-smooth"
              >
                <Plus className="h-3 w-3" strokeWidth={2.5} />
                Add
              </button>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}

function CouponInput() {
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState("");

  const handleApply = () => {
    if (!code.trim()) return;
    if (code.toUpperCase() === "SAVE10") {
      setApplied(true);
      setError("");
    } else {
      setError("Invalid coupon code");
      setApplied(false);
    }
  };

  return (
    <div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-text-muted)]" strokeWidth={1.5} />
          <input
            value={code}
            onChange={(e) => { setCode(e.target.value); setError(""); setApplied(false); }}
            placeholder="Enter coupon code"
            className="field-shell h-10 w-full pl-9 pr-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none"
            aria-label="Coupon code"
          />
        </div>
        <button
          onClick={handleApply}
          disabled={applied}
          className="h-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 text-sm font-semibold text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)] transition-smooth disabled:opacity-50"
        >
          {applied ? "Applied" : "Apply"}
        </button>
      </div>
      {applied && (
        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-[var(--color-success)]">
          <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
          SAVE10 applied — 10% off your order
        </p>
      )}
      {error && <p className="mt-1.5 text-xs text-[var(--color-danger)]">{error}</p>}
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-bg-tertiary)]">
        <ShoppingBag className="h-7 w-7 text-[var(--color-text-muted)]" strokeWidth={1.25} />
      </div>
      <p className="text-base font-semibold text-[var(--color-text-primary)]">Your cart is empty</p>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">Add items from a restaurant to get started.</p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)] transition-smooth"
      >
        Browse restaurants
        <ChevronRight className="h-4 w-4" strokeWidth={2} />
      </Link>
    </div>
  );
}

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
  const router = useRouter();

  useEffect(() => {
    const userRole = authService.getUserRole();
    const isRestaurantUser = ["ORGANIZATION_OWNER", "restaurant", "restaurant-admin"].includes(userRole || "");
    if (isRestaurantUser) {
      router.replace("/dashboard");
    }
  }, [router]);
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("delivery");
  const [address, setAddress] = useState("42 Maple Street, Apt 3B, Chennai 600001");
  const [editingAddress, setEditingAddress] = useState(false);
  const [instructions, setInstructions] = useState("");

  const subtotal = cartTotal;
  const deliveryFee = deliveryMode === "pickup" ? 0 : subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = subtotal + deliveryFee + tax;
  const savings = deliveryMode === "delivery" && subtotal >= FREE_DELIVERY_THRESHOLD ? DELIVERY_FEE : 0;
  const cartIds = new Set(cartItems.map((i) => i.id));
  const suggestions = RECOMMENDED.filter((r) => !cartIds.has(r.id));

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

      {/* Empty state */}
      {cartItems.length === 0 && <EmptyCart />}

      {/* Cart + summary grid */}
      {cartItems.length > 0 && (
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
                        <p className="text-sm text-[var(--color-text-primary)] truncate">{address}</p>
                      )}
                    </div>
                    <button onClick={() => setEditingAddress(true)} className="shrink-0 text-xs font-medium text-[var(--color-blue)] hover:underline">
                      Change
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                    <Clock className="h-3 w-3" strokeWidth={1.75} />
                    Estimated delivery: 25–35 min
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
                      <p className="mt-0.5 text-sm font-medium text-[var(--color-text-secondary)]">₹{item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <QuantityStepper
                        quantity={item.quantity}
                        onDecrement={() => updateQuantity(item.id, item.quantity - 1)}
                        onIncrement={() => updateQuantity(item.id, item.quantity + 1)}
                      />
                      <p className="w-16 text-right text-sm font-semibold text-[var(--color-text-primary)]">
                        ₹{(item.price * item.quantity).toFixed(2)}
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

              <CouponInput />

              {deliveryMode === "delivery" && subtotal < FREE_DELIVERY_THRESHOLD && (
                <div className="mt-4 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2.5">
                  <p className="text-xs font-medium text-amber-700">
                    Add ₹{(FREE_DELIVERY_THRESHOLD - subtotal).toFixed(0)} more for free delivery
                  </p>
                  <div className="mt-1.5 h-1.5 w-full rounded-full bg-amber-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all duration-500"
                      style={{ width: `${Math.min((subtotal / FREE_DELIVERY_THRESHOLD) * 100, 100)}%` }}
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
                <div className="flex justify-between text-sm text-[var(--color-text-secondary)]">
                  <span>Tax (5%)</span><span>₹{tax.toFixed(2)}</span>
                </div>
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

              <Link
                href="/dashboard/orders"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-accent)] py-3 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)] transition-smooth"
              >
                Place order · ₹{total.toFixed(2)}
                <ChevronRight className="h-4 w-4" strokeWidth={2} />
              </Link>

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

      {/* Recommended dishes */}
      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-5">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--color-accent)]" strokeWidth={1.75} />
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
              {cartItems.length === 0 ? "Popular dishes to get you started" : "You might also like"}
            </h2>
          </div>
          <Link href="/dashboard" className="text-xs font-medium text-[var(--color-blue)] hover:underline">
            See all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {(cartItems.length === 0 ? RECOMMENDED : suggestions.slice(0, 6)).map((item) => (
            <RecommendedCard key={item.id} item={item} />
          ))}
          {cartItems.length > 0 && suggestions.length === 0 && (
            <div className="col-span-full py-6 text-center text-sm text-[var(--color-text-muted)]">
              You&apos;ve added all our top picks — nice taste!
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
