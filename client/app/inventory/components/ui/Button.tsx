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
  const styles = {
    primary:
      "bg-blue-600 hover:bg-blue-700 text-white",

    secondary:
      "bg-gray-200 hover:bg-gray-300 text-gray-800",

    danger:
      "bg-red-500 hover:bg-red-600 text-white",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-5 py-3 rounded-xl font-semibold transition ${styles[variant]}`}
    >
      {text}
    </button>
  );
}