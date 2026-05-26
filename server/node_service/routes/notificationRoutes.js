import express from 'express';
import { getNotifications, markNotificationRead, markAllRead } from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', getNotifications);
router.patch('/mark-all', markAllRead); //<-- New route to mark all notifications as read (IT MUST BE KEPT HERE ELSE CAUSES ERROR)
router.patch('/:id', markNotificationRead);

export default router;
