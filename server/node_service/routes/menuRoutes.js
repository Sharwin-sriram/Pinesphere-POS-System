import express from 'express';
import {
  createMenuItem,
  addMenuItem,
  getMenu,
  updateMenuItem
} from '../controllers/menuController.js';

const router = express.Router();

// Create new menu item
router.post('/', createMenuItem);

// Alternative create route if you want
router.post('/add', addMenuItem);

// Get all menu items
router.get('/', getMenu);

// Update existing menu item
router.put('/:id', updateMenuItem);

export default router;
