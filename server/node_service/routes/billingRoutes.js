import express from 'express';
import { generateBill } from '../controllers/billingController.js';

const router = express.Router();
router.post('/generate', generateBill);

export default router;
