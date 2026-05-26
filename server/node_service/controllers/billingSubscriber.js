import { createClient } from 'redis';
import { prisma } from '../config/db.js';

const subscriber = createClient({ url: process.env.REDIS_URL });
await subscriber.connect();

subscriber.subscribe('bill-generated', async (message) => {
  const bill = JSON.parse(message);
  console.log(`Bill generated for order: ${bill.orderId}, amount: ${bill.amount}`);

  try {
    // Example: log analytics entry
    await prisma.analytics.create({
      data: {
        type: 'bill',
        referenceId: bill.id,
        amount: bill.amount,
        createdAt: new Date()
      }
    });

    console.log(`Analytics updated for bill: ${bill.id}`);
  } catch (err) {
    console.error('Error updating analytics:', err.message);
  }
});
