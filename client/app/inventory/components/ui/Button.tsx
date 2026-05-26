"use client";

type Props = {
  text: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  type?: "button" | "submit";
};

export default function Button({
  text,
  onClick,
  variant = "primary",
  type = "button",
}: Props) {
  // DS: color — align inventory button with shared primary/secondary/danger tokens
  const styles = {
    primary:
      "bg-[var(--color-accent)] text-[var(--color-text-inverse)] hover:bg-[var(--color-accent-hover)] active:bg-[var(--color-accent-active)] border-0",
    secondary:
      "bg-transparent text-[var(--color-text-primary)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)]",
    danger:
      "bg-transparent text-[var(--color-danger)] border border-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)]",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md px-5 text-[length:var(--text-base)] font-semibold transition duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 ${styles[variant]}`}
    >
      {text}
    </button>
  );
}
