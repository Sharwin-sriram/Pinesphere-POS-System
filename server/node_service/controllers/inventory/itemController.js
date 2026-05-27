// Item Controller - Handles item management endpoints

class ItemController {
  constructor(inventoryService) {
    this.inventoryService = inventoryService;
  }

  /**
   * Create new item
   * POST /api/inventory/items
   */
  async createItem(req, res) {
    try {
      const { restaurantId, branchId, ...itemData } = req.body;

      if (!restaurantId || !branchId) {
        return res
          .status(400)
          .json({ error: 'Restaurant ID and Branch ID are required' });
      }

      if (!itemData.name || !itemData.sku) {
        return res.status(400).json({ error: 'Item name and SKU are required' });
      }

      const item = await this.inventoryService.createItem(
        restaurantId,
        branchId,
        itemData
      );

      res.status(201).json({
        success: true,
        message: 'Item created successfully',
        data: item,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get all items
   * GET /api/inventory/items
   */
  async getItems(req, res) {
    try {
      const { restaurantId, branchId } = req.query;

      if (!restaurantId) {
        return res.status(400).json({ error: 'Restaurant ID is required' });
      }

      const items = await this.inventoryService.getItems(restaurantId, branchId);

      res.status(200).json({
        success: true,
        count: items.length,
        data: items,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get item by ID
   * GET /api/inventory/items/:itemId
   */
  async getItemById(req, res) {
    try {
      const { itemId } = req.params;

      const item = await this.inventoryService.getItemById(itemId);

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Item not found',
        });
      }

      res.status(200).json({
        success: true,
        data: item,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Update item
   * PUT /api/inventory/items/:itemId
   */
  async updateItem(req, res) {
    try {
      const { itemId } = req.params;
      const updateData = req.body;

      const updatedItem = await this.inventoryService.updateItem(
        itemId,
        updateData
      );

      if (!updatedItem) {
        return res.status(404).json({
          success: false,
          error: 'Item not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Item updated successfully',
        data: updatedItem,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get low stock items
   * GET /api/inventory/items/low-stock
   */
  async getLowStockItems(req, res) {
    try {
      const { restaurantId, branchId } = req.query;

      if (!restaurantId) {
        return res.status(400).json({ error: 'Restaurant ID is required' });
      }

      const lowStockItems = await this.inventoryService.getLowStockItems(
        restaurantId,
        branchId
      );

      res.status(200).json({
        success: true,
        count: lowStockItems.length,
        data: lowStockItems,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Deduct stock (on sale)
   * POST /api/inventory/items/:itemId/deduct
   */
  async deductStock(req, res) {
    try {
      const { itemId } = req.params;
      const { quantity, reference, userId } = req.body;

      if (!quantity || !reference || !userId) {
        return res.status(400).json({
          error: 'Quantity, reference, and userId are required',
        });
      }

      const result = await this.inventoryService.deductStock(
        itemId,
        quantity,
        reference,
        userId
      );

      res.status(200).json({
        success: true,
        message: 'Stock deducted successfully',
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Add stock
   * POST /api/inventory/items/:itemId/add
   */
  async addStock(req, res) {
    try {
      const { itemId } = req.params;
      const { quantity, transactionType, reference, userId } = req.body;

      if (!quantity || !transactionType || !reference || !userId) {
        return res.status(400).json({
          error: 'Quantity, transactionType, reference, and userId are required',
        });
      }

      const result = await this.inventoryService.addStock(
        itemId,
        quantity,
        transactionType,
        reference,
        userId
      );

      res.status(200).json({
        success: true,
        message: 'Stock added successfully',
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = ItemController;
