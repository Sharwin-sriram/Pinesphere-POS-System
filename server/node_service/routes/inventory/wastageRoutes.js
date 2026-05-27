// Wastage Routes - Endpoints for wastage tracking

const express = require('express');
const router = express.Router();

const WastageController = require('../../controllers/inventory/wastageController');

module.exports = (inventoryService) => {
  const wastageController = new WastageController(inventoryService);

  // Report wastage
  router.post('/', (req, res) => wastageController.reportWastage(req, res));

  // Approve wastage
  router.put('/:wastageId/approve', (req, res) =>
    wastageController.approveWastage(req, res)
  );

  // Get wastage reports
  router.get('/', (req, res) =>
    wastageController.getWastageReports(req, res)
  );

  return router;
};
