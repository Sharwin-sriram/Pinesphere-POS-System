"use client";
import { useEffect, useState } from "react";

interface MenuItem {
  id: string | number;
  name: string;
  price: number | string;
  quantity: number;
}

export default function WaiterPortal() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== "undefined" ? localStorage.getItem("waiter_token") : null;

  useEffect(() => {
    if (!token) return;
    fetch("/api/waiter/menu/", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setItems(data.results || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const take = async (it: MenuItem) => {
    const token = localStorage.getItem("waiter_token");
    const res = await fetch("/api/waiter/orders/", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ items: [{ menu_item_id: it.id, quantity: 1, name: it.name, unit_price: it.price }] }),
    });
    if (res.ok) alert("Order created");
    else alert("Failed");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Waiter Portal</h1>
      {loading ? <p>Loading menu...</p> : (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <div key={it.id} className="p-3 border rounded">
              <div className="flex justify-between">
                <div>
                  <div className="font-medium">{it.name}</div>
                  <div className="text-sm text-gray-500">Qty: {it.quantity}</div>
                </div>
                <div>
                  <div className="font-semibold">₹{it.price}</div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => take(it)} className="px-3 py-1 rounded bg-[var(--color-accent)] text-white">Take</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
