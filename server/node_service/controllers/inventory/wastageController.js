// Wastage Controller - Handles wastage tracking endpoints

class WastageController {
  constructor(inventoryService) {
    this.inventoryService = inventoryService;
  }

  /**
   * Report wastage
   * POST /api/inventory/wastage
   */
  async reportWastage(req, res) {
    try {
      const { restaurantId, branchId, itemId, quantity, reason, notes } =
        req.body;
      const userId = req.user?.id;

      if (!restaurantId || !branchId || !itemId || !quantity || !reason) {
        return res.status(400).json({
          error:
            'Restaurant ID, Branch ID, Item ID, quantity, and reason are required',
        });
      }

      const wastage = await this.inventoryService.reportWastage(
        restaurantId,
        branchId,
        { itemId, quantity, reason, notes },
        userId
      );

      res.status(201).json({
        success: true,
        message: 'Wastage reported successfully',
        data: wastage,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Approve wastage
   * PUT /api/inventory/wastage/:wastageId/approve
   */
  async approveWastage(req, res) {
    try {
      const { wastageId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const waste = await this.inventoryService.approveWastage(wastageId, userId);

      if (!waste) {
        return res.status(404).json({
          success: false,
          error: 'Wastage record not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Wastage approved and stock deducted',
        data: waste,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get wastage reports
   * GET /api/inventory/wastage
   */
  async getWastageReports(req, res) {
    try {
      const { restaurantId, branchId, status } = req.query;

      if (!restaurantId || !branchId) {
        return res
          .status(400)
          .json({ error: 'Restaurant ID and Branch ID are required' });
      }

      const wastageReports = await this.inventoryService.getWastageReports(
        restaurantId,
        branchId,
        status
      );

      res.status(200).json({
        success: true,
        count: wastageReports.length,
        data: wastageReports,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = WastageController;
