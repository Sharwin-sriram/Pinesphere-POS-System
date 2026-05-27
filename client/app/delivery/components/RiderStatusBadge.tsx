interface Props {
  status: string;
}

export default function RiderStatusBadge({
  status,
}: Props) {
  const colors: Record<string, string> = {
    Online: "bg-green-100 text-green-600",
    Offline: "bg-gray-100 text-gray-600",
    Delivering: "bg-blue-100 text-blue-600",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm ${colors[status]}`}
    >
      {status}
    </span>
  );
}