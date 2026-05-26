import express from 'express';
import { placeOrder, updateOrderStatus, markOrderOnTheWay } from '../controllers/orderController.js';

const router = express.Router();

// Existing order placement
router.post('/place', placeOrder);

// New: order accept/reject
router.post('/status', updateOrderStatus);

// New: order on the way
router.post('/on-the-way', markOrderOnTheWay);

export default router;
