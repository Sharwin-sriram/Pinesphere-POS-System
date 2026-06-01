interface Props {
  status: string;
}

export default function RiderStatusBadge({ status }: Props) {
  const colors: Record<string, string> = {
    Online:     "bg-[var(--color-success-subtle)] text-[var(--color-success)]",
    Offline:    "bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]",
    Delivering: "bg-[var(--color-accent-subtle)] text-[var(--color-accent)]",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status] ?? colors.Offline}`}>
      {status}
    </span>
  );
}