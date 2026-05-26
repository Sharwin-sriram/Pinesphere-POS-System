import { prisma } from '../config/db.js';
import { publisher } from '../config/redis.js';

export const createMenuItem = async (req, res) => {
  try {
    const menuItem = await prisma.menu.create({
      data: req.body,
    });

    // Publish event for notification
    await publisher.publish('menu-updated', JSON.stringify(menuItem));

    res.json({ success: true, menuItem });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addMenuItem = async (req, res) => {
  const item = req.body;
  const newItem = await prisma.menu.create({ data: item });
  res.json({ success: true, item: newItem });
};

export const getMenu = async (req, res) => {
  const items = await prisma.menu.findMany();
  res.json(items);
};

export const updateMenuItem = async (req, res) => {
  try {
    const menuItem = await prisma.menu.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });

    await publisher.publish('menu-updated', JSON.stringify(menuItem));

    res.json({ success: true, menuItem });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};