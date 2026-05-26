import { createClient } from 'redis';

const publisher = createClient({ url: process.env.REDIS_URL });
await publisher.connect();

export const placeOrder = async (req, res) => {
  const order = req.body;

  // Save order to DB if needed
  // await prisma.order.create({ data: order });

  // Publish event to Redis
  await publisher.publish('order-placed', JSON.stringify(order));

  res.json({ success: true, order });
};


export const updateOrderStatus = async (req, res) => {
  const { orderId, status, customerName } = req.body;
  await publisher.publish('order-status', JSON.stringify({ orderId, customerName, status }));
  res.json({ success: true, message: `Order ${orderId} ${status}` });
};

export const markOrderOnTheWay = async (req, res) => {
  const { orderId, customerName, eta } = req.body;
  await publisher.publish('order-on-the-way', JSON.stringify({ orderId, customerName, eta }));
  res.json({ success: true, message: `Order ${orderId} on the way` });
};
