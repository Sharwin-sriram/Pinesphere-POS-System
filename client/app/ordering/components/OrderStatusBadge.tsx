"use client";

interface OrderStatusBadgeProps {
  status:
    | "DRAFT"
    | "CONFIRMED"
    | "PREPARING"
    | "READY"
    | "SERVED"
    | "PAID"
    | "CANCELLED";
}

export default function OrderStatusBadge({
  status,
}: OrderStatusBadgeProps) {
  const styles: Record<
    string,
    string
  > = {
    DRAFT:
      "bg-gray-100 text-gray-700",

    CONFIRMED:
      "bg-blue-100 text-blue-700",

    PREPARING:
      "bg-yellow-100 text-yellow-700",

    READY:
      "bg-green-100 text-green-700",

    SERVED:
      "bg-purple-100 text-purple-700",

    PAID:
      "bg-emerald-100 text-emerald-700",

    CANCELLED:
      "bg-red-100 text-red-700",
  };

  return (
    <div
      className={`px-4 py-2 rounded-2xl text-sm font-semibold w-fit ${styles[status]}`}
    >
      {status}
    </div>
  );
}