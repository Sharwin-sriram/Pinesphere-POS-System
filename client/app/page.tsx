"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthPage from "./components/AuthPage";
import { authService } from "./lib/authService";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (authService.isAuthenticated()) {
      router.push("/dashboard");
    }
  }, [router]);

  return <AuthPage defaultMode="login" />;
}
