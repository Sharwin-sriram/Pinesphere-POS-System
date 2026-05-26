import { createClient } from 'redis';
import axios from 'axios';
import { prisma } from '../config/db.js';

const subscriber = createClient({ url: process.env.REDIS_URL });
await subscriber.connect();

// Orders
subscriber.subscribe('order-placed', async (message) => {
  const order = JSON.parse(message);
  await sendNotification(order.userId, `Order #${order.id} placed for ${order.customerName}`, order.channel);
});

// Menu
subscriber.subscribe('menu-updated', async (message) => {
  const item = JSON.parse(message);
  await sendNotification(null, `Menu updated: ${item.name}`, 'email');
});

// Billing
subscriber.subscribe('bill-generated', async (message) => {
  const bill = JSON.parse(message);
  await sendNotification(bill.orderId, `Bill generated: ₹${bill.amount}`, 'sms');
});

// Reports
subscriber.subscribe('report-generated', async (message) => {
  const report = JSON.parse(message);
  await sendNotification(null, `Report ready: Sales ₹${report.totalSales}`, 'email');
});

// Helper function
async function sendNotification(userId, message, channel) {
  await prisma.notification.create({
    data: { userId, channel: 'in-app', message, status: 'unread' }
  });

}


subscriber.subscribe('table-ready', async (message) => {
  const table = JSON.parse(message);
  await sendNotification(null, `Table #${table.tableId} is ready for ${table.customerName}`, 'in-app');
});

subscriber.subscribe('order-status', async (message) => {
  const order = JSON.parse(message);
  await sendNotification(order.orderId, `Order #${order.orderId} has been ${order.status}`, 'in-app');
});

subscriber.subscribe('order-on-the-way', async (message) => {
  const order = JSON.parse(message);
  await sendNotification(order.orderId, `Order #${order.orderId} is on the way (ETA: ${order.eta})`, 'in-app');
});

