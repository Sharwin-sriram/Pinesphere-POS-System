// Supplier Controller - Handles supplier management endpoints

class SupplierController {
  constructor(inventoryService) {
    this.inventoryService = inventoryService;
  }

  /**
   * Create new supplier
   * POST /api/inventory/suppliers
   */
  async createSupplier(req, res) {
    try {
      const { restaurantId, ...supplierData } = req.body;

      if (!restaurantId) {
        return res.status(400).json({ error: 'Restaurant ID is required' });
      }

      if (!supplierData.name || !supplierData.contactPerson) {
        return res.status(400).json({
          error: 'Supplier name and contact person are required',
        });
      }

      const supplier = await this.inventoryService.createSupplier(
        restaurantId,
        supplierData
      );

      res.status(201).json({
        success: true,
        message: 'Supplier created successfully',
        data: supplier,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get all suppliers
   * GET /api/inventory/suppliers
   */
  async getSuppliers(req, res) {
    try {
      const { restaurantId } = req.query;

      if (!restaurantId) {
        return res.status(400).json({ error: 'Restaurant ID is required' });
      }

      const suppliers = await this.inventoryService.getSuppliers(restaurantId);

      res.status(200).json({
        success: true,
        count: suppliers.length,
        data: suppliers,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Update supplier
   * PUT /api/inventory/suppliers/:supplierId
   */
  async updateSupplier(req, res) {
    try {
      const { supplierId } = req.params;
      const updateData = req.body;

      const updatedSupplier = await this.inventoryService.updateSupplier(
        supplierId,
        updateData
      );

      if (!updatedSupplier) {
        return res.status(404).json({
          success: false,
          error: 'Supplier not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Supplier updated successfully',
        data: updatedSupplier,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = SupplierController;
