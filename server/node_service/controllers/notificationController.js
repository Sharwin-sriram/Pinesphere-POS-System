// controllers/notificationController.js
import { prisma } from '../config/db.js';

export const getNotifications = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: parseInt(userId),
        channel: 'in-app'   // ✅ only in-app
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { status: 'read' }
    });
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const markAllRead = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // ✅ Use updateMany for bulk update
    const result = await prisma.notification.updateMany({
      where: {
        userId: parseInt(userId),
        status: 'unread'
      },
      data: { status: 'read' }
    });

    res.json({
      success: true,
      count: result.count,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
