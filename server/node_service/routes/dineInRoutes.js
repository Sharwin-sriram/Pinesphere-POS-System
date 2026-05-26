import express from 'express';
import { tableReady } from '../controllers/dineInController.js';

const router = express.Router();

// Dine-in table ready notification
router.post('/table-ready', tableReady);

export default router;
