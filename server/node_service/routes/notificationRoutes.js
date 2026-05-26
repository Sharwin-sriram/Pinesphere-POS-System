import express from 'express';
import { getNotifications, markNotificationRead, markAllRead } from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', getNotifications);
router.patch('/:id', markNotificationRead);
router.patch('/mark-all', markAllRead);

export default router;
