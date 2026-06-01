"use client";
import { useState } from "react";
import InputField from "../components/InputField";
import AuthShell from "../components/auth/AuthShell";
import { useRouter } from "next/navigation";

export default function WaiterLogin() {
  const [restaurantId, setRestaurantId] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/waiter/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurant_id: restaurantId, pin }),
      });
      if (!res.ok) throw res;
      const data = await res.json();
      localStorage.setItem("waiter_token", data.token);
      router.push("/waiter/portal");
    } catch (err) {
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Waiter Sign in" subtitle="Enter your restaurant ID and PIN">
      <form onSubmit={submit} className="space-y-4">
        <InputField type="text" name="restaurant_id" placeholder="Restaurant ID" value={restaurantId} onChange={(e) => setRestaurantId(e.target.value)} />
        <InputField type="password" name="pin" placeholder="4-digit PIN" value={pin} onChange={(e) => setPin(e.target.value)} />
        <button className="inline-flex h-10 w-full items-center justify-center rounded-md bg-[var(--color-accent)] text-[var(--color-text-inverse)]" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
      </form>
    </AuthShell>
  );
}
