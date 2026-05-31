// Item Routes - Endpoints for item management

const express = require('express');
const router = express.Router();

const ItemController = require('../../controllers/inventory/itemController');

module.exports = (inventoryService) => {
  const itemController = new ItemController(inventoryService);

  // Create item
  router.post('/', (req, res) => itemController.createItem(req, res));

  // Low stock items must be declared before the dynamic :itemId route.
  router.get('/stock/low-stock', (req, res) =>
    itemController.getLowStockItems(req, res)
  );

  // Backwards-compatible alias used by the frontend inventory module.
  router.get('/low-stock', (req, res) =>
    itemController.getLowStockItems(req, res)
  );

  // Deduct stock
  router.post('/:itemId/deduct', (req, res) =>
    itemController.deductStock(req, res)
  );

  router.post('/:itemId/deduct-stock', (req, res) =>
    itemController.deductStock(req, res)
  );

  // Add stock
  router.post('/:itemId/add', (req, res) => itemController.addStock(req, res));

  router.post('/:itemId/add-stock', (req, res) =>
    itemController.addStock(req, res)
  );

  // Get all items
  router.get('/', (req, res) => itemController.getItems(req, res));

  // Get item by ID
  router.get('/:itemId', (req, res) => itemController.getItemById(req, res));

  // Update item
  router.put('/:itemId', (req, res) => itemController.updateItem(req, res));

  return router;
};
