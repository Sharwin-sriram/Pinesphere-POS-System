// Report Controller - Handles inventory reports and analytics

class ReportController {
  constructor(inventoryService) {
    this.inventoryService = inventoryService;
  }

  /**
   * Get stock transactions
   * GET /api/inventory/reports/transactions
   */
  async getStockTransactions(req, res) {
    try {
      const { restaurantId, branchId, itemId } = req.query;

      if (!restaurantId || !branchId) {
        return res
          .status(400)
          .json({ error: 'Restaurant ID and Branch ID are required' });
      }

      const transactions = await this.inventoryService.getStockTransactions(
        restaurantId,
        branchId,
        itemId
      );

      res.status(200).json({
        success: true,
        count: transactions.length,
        data: transactions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get inventory valuation
   * GET /api/inventory/reports/valuation
   */
  async getInventoryValuation(req, res) {
    try {
      const { restaurantId, branchId } = req.query;

      if (!restaurantId) {
        return res.status(400).json({ error: 'Restaurant ID is required' });
      }

      const valuation = await this.inventoryService.getInventoryValuation(
        restaurantId,
        branchId
      );

      res.status(200).json({
        success: true,
        data: valuation,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get consumption report
   * GET /api/inventory/reports/consumption
   */
  async getConsumptionReport(req, res) {
    try {
      const { restaurantId, branchId, startDate, endDate } = req.query;

      if (!restaurantId || !branchId || !startDate || !endDate) {
        return res.status(400).json({
          error:
            'Restaurant ID, Branch ID, start date, and end date are required',
        });
      }

      const report = await this.inventoryService.getConsumptionReport(
        restaurantId,
        branchId,
        startDate,
        endDate
      );

      res.status(200).json({
        success: true,
        count: report.length,
        data: report,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get variance report (expected vs actual)
   * GET /api/inventory/reports/variance
   */
  async getVarianceReport(req, res) {
    try {
      const { restaurantId, branchId } = req.query;

      if (!restaurantId || !branchId) {
        return res
          .status(400)
          .json({ error: 'Restaurant ID and Branch ID are required' });
      }

      // Variance calculation logic to be implemented
      res.status(200).json({
        success: true,
        message: 'Variance report feature coming soon',
        data: [],
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = ReportController;
