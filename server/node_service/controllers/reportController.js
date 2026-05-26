import { prisma } from '../config/db.js';
import { publisher } from '../config/redis.js';

export const salesReport = async (req, res) => {
  const report = await prisma.bill.aggregate({
    _sum: { amount: true },
    _count: { id: true }
  });

  // 🔔 Publish report-generated event
  await publisher.publish('report-generated', JSON.stringify({
    totalSales: report._sum.amount,
    totalBills: report._count.id
  }));

  res.json({ totalSales: report._sum.amount, totalBills: report._count.id });
};

export const notificationReport = async (req, res) => {
  const report = await prisma.notification.groupBy({
    by: ['channel'],
    _count: { id: true }
  });
  res.json(report);
};
