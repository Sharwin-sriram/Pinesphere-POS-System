"use client";

import { POSProvider } from "./components/shared/POSContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return <POSProvider>{children}</POSProvider>;
}
