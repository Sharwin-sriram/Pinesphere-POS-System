import { publisher } from '../config/redis.js';

export const tableReady = async (req, res) => {
  const { tableId, customerName } = req.body;
  await publisher.publish('table-ready', JSON.stringify({ tableId, customerName, status: 'ready' }));
  res.json({ success: true, message: `Table ${tableId} ready for ${customerName}` });
};
