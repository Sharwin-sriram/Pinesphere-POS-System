// Supplier Routes - Endpoints for supplier management

const express = require('express');
const router = express.Router();

const SupplierController = require('../../controllers/inventory/supplierController');

module.exports = (inventoryService) => {
  const supplierController = new SupplierController(inventoryService);

  // Create supplier
  router.post('/', (req, res) => supplierController.createSupplier(req, res));

  // Get all suppliers
  router.get('/', (req, res) => supplierController.getSuppliers(req, res));

  // Update supplier
  router.put('/:supplierId', (req, res) =>
    supplierController.updateSupplier(req, res)
  );

  return router;
};
