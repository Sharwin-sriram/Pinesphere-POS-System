// DS: color — shared react-hot-toast styles for auth flows
import type { ToastOptions } from "react-hot-toast";

const base: ToastOptions["style"] = {
  background: "var(--color-bg-secondary)",
  color: "var(--color-text-primary)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-lg)",
  fontSize: "var(--text-base)",
  fontWeight: "var(--weight-medium)",
};

export const authToastSuccess: ToastOptions = {
  duration: 3000,
  position: "top-center",
  style: {
    ...base,
    borderLeft: "3px solid var(--color-success)",
  },
};

export const authToastError: ToastOptions = {
  duration: 4000,
  position: "top-center",
  style: {
    ...base,
    borderLeft: "3px solid var(--color-danger)",
  },
};
