const API =
  process.env.NEXT_PUBLIC_API_URL;

export async function fetchOrders() {
  const res = await fetch(
    `${API}/delivery/orders`
  );

  return res.json();
}

export async function fetchRiders() {
  const res = await fetch(
    `${API}/delivery/riders`
  );

  return res.json();
}