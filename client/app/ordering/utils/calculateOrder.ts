// ordering/utils/calculateOrder.ts

interface CartItem {
  quantity?: number;
  price?: number;
}

export function calculateOrder(
  items: CartItem[]
) {
  const subtotal = items.reduce(
    (acc, item) =>
      acc +
      (item.price || 0) *
        (item.quantity || 0),
    0
  );

  const tax = subtotal * 0.05;

  const total =
    subtotal + tax;

  return {
    subtotal,
    tax,
    total,
  };
}