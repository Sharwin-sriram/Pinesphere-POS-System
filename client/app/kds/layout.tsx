"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { authService } from "../lib/authService";

const RESTAURANT_LOGIN_PATH = "/restaurant/login?next=%2Fkds";
const ALLOWED_ROLES = new Set(["ORGANIZATION_OWNER", "restaurant", "restaurant-admin"]);

export default function KDSLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const hasSession = authService.isAuthenticated();
    const role = authService.getUserRole();

    if (!hasSession || !role || !ALLOWED_ROLES.has(role)) {
      router.replace(RESTAURANT_LOGIN_PATH);
      return;
    }

    setIsAuthorized(true);
  }, [router]);

  if (!isAuthorized) {
    return null;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg-primary)",
        color: "var(--color-text-primary)",
        fontFamily: "var(--font-ui)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "var(--color-bg-secondary)",
            color: "var(--color-text-primary)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            fontSize: "var(--text-sm)",
          },
        }}
      />
      {children}
    </div>
  );
}
