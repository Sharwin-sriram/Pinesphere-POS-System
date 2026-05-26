type Props = {
  label: string;
  placeholder?: string;
  type?: string;
};

export default function Input({
  label,
  placeholder,
  type = "text",
}: Props) {
  return (
    <div>
      <label className="text-sm font-medium">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        className="w-full border rounded-xl px-4 py-3 mt-2 outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}