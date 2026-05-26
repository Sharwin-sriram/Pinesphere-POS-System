import { prisma } from '../config/db.js';
import { publisher } from '../config/redis.js';

export const generateBill = async (req, res) => {
  const { orderId, amount } = req.body;
  const bill = await prisma.bill.create({
    data: { orderId, amount, status: 'generated' }
  });

  // Publish event for reporting/notifications
  await publisher.publish('bill-generated', JSON.stringify(bill));

  res.json({ success: true, bill });
};
