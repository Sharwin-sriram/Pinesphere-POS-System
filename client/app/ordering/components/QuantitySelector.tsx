// components/QuantitySelector.tsx

"use client";

interface Props {
  quantity?: number;
  onIncrease?: () => void;
  onDecrease?: () => void;
}

export default function QuantitySelector({
  quantity = 1,
  onIncrease,
  onDecrease,
}: Props) {
  return (
    <div className="flex items-center gap-4 bg-gray-100 rounded-2xl px-4 py-2 w-fit">
      <button
        onClick={onDecrease}
        className="text-2xl font-bold"
      >
        -
      </button>

      <span className="text-xl font-bold">
        {quantity}
      </span>

      <button
        onClick={onIncrease}
        className="text-2xl font-bold"
      >
        +
      </button>
    </div>
  );
}