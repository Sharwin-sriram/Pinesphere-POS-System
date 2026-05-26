import express from 'express';
import { salesReport, notificationReport } from '../controllers/reportController.js';

const router = express.Router();
router.get('/sales', salesReport);
router.get('/notifications', notificationReport);

export default router;
