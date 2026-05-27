// Inventory Routes - Main router for all inventory endpoints

const express = require('express');
const router = express.Router();

const itemRoutes = require('./itemRoutes');
const supplierRoutes = require('./supplierRoutes');
const wastageRoutes = require('./wastageRoutes');
const reportRoutes = require('./reportRoutes');

module.exports = (inventoryService) => {
  // Mount sub-routes
  router.use('/items', itemRoutes(inventoryService));
  router.use('/suppliers', supplierRoutes(inventoryService));
  router.use('/wastage', wastageRoutes(inventoryService));
  router.use('/reports', reportRoutes(inventoryService));

  return router;
};
