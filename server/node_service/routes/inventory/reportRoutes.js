// Report Routes - Endpoints for inventory reports

const express = require('express');
const router = express.Router();

const ReportController = require('../../controllers/inventory/reportController');

module.exports = (inventoryService) => {
  const reportController = new ReportController(inventoryService);

  // Get stock transactions
  router.get('/transactions', (req, res) =>
    reportController.getStockTransactions(req, res)
  );

  // Get inventory valuation
  router.get('/valuation', (req, res) =>
    reportController.getInventoryValuation(req, res)
  );

  // Get consumption report
  router.get('/consumption', (req, res) =>
    reportController.getConsumptionReport(req, res)
  );

  // Get variance report
  router.get('/variance', (req, res) =>
    reportController.getVarianceReport(req, res)
  );

  return router;
};
