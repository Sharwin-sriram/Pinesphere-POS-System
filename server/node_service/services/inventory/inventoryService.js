/**
 * Inventory Service - Core Business Logic for Module 7
 * Fully aligned with Django models and MySQL database
 * 
 * Uses: inventory_items, suppliers, purchase_orders, grn, wastage, stock_transactions
 */

const { executeQuery, executeTransaction } = require('../../config/database');

class InventoryService {
  // ============================================================================
  // INVENTORY ITEM OPERATIONS
  // ============================================================================

  /**
   * Create a new inventory item
   * @param {number} branchId - Branch ID
   * @param {number} supplierId - Supplier ID (optional)
   * @param {object} itemData - Item details
   * @returns {object} Created item with ID
   */
  async createItem(branchId, supplierId, itemData) {
    try {
      const query = `
        INSERT INTO inventory_items (
          branch_id, supplier_id, name, sku, category, unit_type,
          current_stock, reorder_level, purchase_price, expiry_date, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await executeQuery(query, [
        branchId,
        supplierId || null,
        itemData.name,
        itemData.sku,
        itemData.category,
        itemData.unitType,
        itemData.currentStock || 0,
        itemData.reorderLevel || 0,
        itemData.purchasePrice,
        itemData.expiryDate || null,
        1,
      ]);

      return { id: result.insertId, branchId, ...itemData };
    } catch (error) {
      throw new Error(`❌ Error creating item: ${error.message}`);
    }
  }

  /**
   * Get all items for a branch
   * @param {number} branchId - Branch ID
   * @returns {array} List of items
   */
  async getItems(branchId) {
    try {
      const query = `
        SELECT 
          ii.*,
          s.name as supplier_name,
          s.contact_person,
          s.mobile
        FROM inventory_items ii
        LEFT JOIN suppliers s ON ii.supplier_id = s.id
        WHERE ii.branch_id = ? AND ii.is_active = TRUE
        ORDER BY ii.name ASC
      `;

      const items = await executeQuery(query, [branchId]);
      return items || [];
    } catch (error) {
      throw new Error(`❌ Error fetching items: ${error.message}`);
    }
  }

  /**
   * Get item by ID
   * @param {number} itemId - Item ID
   * @returns {object} Item details
   */
  async getItemById(itemId) {
    try {
      const query = `
        SELECT 
          ii.*,
          s.name as supplier_name,
          s.contact_person,
          s.email as supplier_email,
          s.mobile as supplier_mobile
        FROM inventory_items ii
        LEFT JOIN suppliers s ON ii.supplier_id = s.id
        WHERE ii.id = ? AND ii.is_active = TRUE
      `;

      const items = await executeQuery(query, [itemId]);
      return items?.[0] || null;
    } catch (error) {
      throw new Error(`❌ Error fetching item: ${error.message}`);
    }
  }


  /**
   * Update item
   * @param {number} itemId - Item ID
   * @param {object} updateData - Fields to update
   * @returns {object} Updated item
   */
  async updateItem(itemId, updateData) {
    try {
      const fields = [];
      const values = [];

      // Build dynamic update query
      for (const [key, value] of Object.entries(updateData)) {
        const snakeKey = this.camelToSnake(key);
        fields.push(`${snakeKey} = ?`);
        values.push(value);
      }

      values.push(itemId);
      fields.push('updated_at = NOW()');

      const query = `UPDATE inventory_items SET ${fields.join(', ')} WHERE id = ?`;

      await executeQuery(query, values);
      return this.getItemById(itemId);
    } catch (error) {
      throw new Error(`❌ Error updating item: ${error.message}`);
    }
  }

  /**
   * Get low stock items
   * @param {number} branchId - Branch ID
   * @returns {array} Items below reorder level
   */
  async getLowStockItems(branchId) {
    try {
      const query = `
        SELECT 
          ii.*,
          s.name as supplier_name,
          s.mobile as supplier_mobile,
          (ii.reorder_level - ii.current_stock) as qty_to_order
        FROM inventory_items ii
        LEFT JOIN suppliers s ON ii.supplier_id = s.id
        WHERE ii.branch_id = ? 
          AND ii.current_stock <= ii.reorder_level
          AND ii.is_active = TRUE
        ORDER BY ii.current_stock ASC
      `;

      return await executeQuery(query, [branchId]);
    } catch (error) {
      throw new Error(`❌ Error fetching low stock items: ${error.message}`);
    }
  }

  /**
   * Deduct stock (sale/use)
   * @param {number} itemId - Item ID
   * @param {number} quantity - Quantity to deduct
   * @param {string} reference - Reference (order/GRN ID)
   * @param {number} userId - User ID
   * @returns {object} Transaction result
   */
  async deductStock(itemId, quantity, reference, userId) {
    try {
      const item = await this.getItemById(itemId);
      if (!item) throw new Error('Item not found');

      if (item.current_stock < quantity) {
        throw new Error(`Insufficient stock. Available: ${item.current_stock}`);
      }

      const previousStock = item.current_stock;
      const newStock = previousStock - quantity;

      // Deduct stock
      await this.updateItem(itemId, { current_stock: newStock });

      // Record transaction
      await this.recordTransaction(
        item.branch_id,
        itemId,
        'SALE',
        quantity,
        previousStock,
        newStock,
        reference,
        userId
      );

      return { success: true, newStock };
    } catch (error) {
      throw new Error(`❌ Error deducting stock: ${error.message}`);
    }
  }

  /**
   * Add stock (purchase/adjustment)
   * @param {number} itemId - Item ID
   * @param {number} quantity - Quantity to add
   * @param {string} type - Transaction type
   * @param {string} reference - Reference ID
   * @param {number} userId - User ID
   * @returns {object} Transaction result
   */
  async addStock(itemId, quantity, type, reference, userId) {
    try {
      const item = await this.getItemById(itemId);
      if (!item) throw new Error('Item not found');

      const previousStock = item.current_stock;
      const newStock = previousStock + quantity;

      // Add stock
      await this.updateItem(itemId, { current_stock: newStock });

      // Record transaction
      await this.recordTransaction(
        item.branch_id,
        itemId,
        type,
        quantity,
        previousStock,
        newStock,
        reference,
        userId
      );

      return { success: true, newStock };
    } catch (error) {
      throw new Error(`❌ Error adding stock: ${error.message}`);
    }
  }

  // ============================================================================
  // SUPPLIER OPERATIONS
  // ============================================================================

  /**
   * Create supplier
   * @param {number} branchId - Branch ID
   * @param {object} supplierData - Supplier details
   * @returns {object} Created supplier
   */
  async createSupplier(branchId, supplierData) {
    try {
      const query = `
        INSERT INTO suppliers (
          branch_id, name, contact_person, mobile, email, gst_number, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await executeQuery(query, [
        branchId,
        supplierData.name,
        supplierData.contactPerson,
        supplierData.mobile,
        supplierData.email,
        supplierData.gstNumber || null,
        1,
      ]);

      return { id: result.insertId, ...supplierData };
    } catch (error) {
      throw new Error(`❌ Error creating supplier: ${error.message}`);
    }
  }

  /**
   * Get suppliers for branch
   * @param {number} branchId - Branch ID
   * @returns {array} Suppliers list
   */
  async getSuppliers(branchId) {
    try {
      const query = `
        SELECT * FROM suppliers
        WHERE branch_id = ? AND is_active = TRUE
        ORDER BY name ASC
      `;

      return await executeQuery(query, [branchId]);
    } catch (error) {
      throw new Error(`❌ Error fetching suppliers: ${error.message}`);
    }
  }

  /**
   * Get supplier by ID
   * @param {number} supplierId - Supplier ID
   * @returns {object} Supplier details
   */
  async getSupplierById(supplierId) {
    try {
      const query = `
        SELECT * FROM suppliers
        WHERE id = ? AND is_active = TRUE
      `;

      const suppliers = await executeQuery(query, [supplierId]);
      return suppliers?.[0] || null;
    } catch (error) {
      throw new Error(`❌ Error fetching supplier: ${error.message}`);
    }
  }

  /**
   * Update supplier
   * @param {number} supplierId - Supplier ID
   * @param {object} updateData - Fields to update
   * @returns {object} Updated supplier
   */
  async updateSupplier(supplierId, updateData) {
    try {
      const fields = [];
      const values = [];

      for (const [key, value] of Object.entries(updateData)) {
        const snakeKey = this.camelToSnake(key);
        fields.push(`${snakeKey} = ?`);
        values.push(value);
      }

      values.push(supplierId);

      const query = `UPDATE suppliers SET ${fields.join(', ')} WHERE id = ?`;

      await executeQuery(query, values);
      return this.getSupplierById(supplierId);
    } catch (error) {
      throw new Error(`❌ Error updating supplier: ${error.message}`);
    }
  }

  // ============================================================================
  // STOCK TRANSACTION TRACKING
  // ============================================================================

  /**
   * Record stock transaction
   * @param {number} branchId - Branch ID
   * @param {number} itemId - Item ID
   * @param {string} type - Transaction type
   * @param {number} qty - Quantity
   * @param {number} prevStock - Stock before
   * @param {number} newStock - Stock after
   * @param {string} reference - Reference ID
   * @param {number} userId - User ID
   */
  async recordTransaction(branchId, itemId, type, qty, prevStock, newStock, reference, userId) {
    try {
      const query = `
        INSERT INTO stock_transactions (
          branch_id, inventory_item_id, transaction_type, quantity,
          previous_stock, new_stock, reference, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      return await executeQuery(query, [
        branchId,
        itemId,
        type,
        qty,
        prevStock,
        newStock,
        reference,
        userId,
      ]);
    } catch (error) {
      throw new Error(`❌ Error recording transaction: ${error.message}`);
    }
  }

  /**
   * Get stock transactions
   * @param {number} branchId - Branch ID
   * @param {number} itemId - Item ID (optional)
   * @returns {array} Transactions
   */
  async getStockTransactions(branchId, itemId = null) {
    try {
      let query = `
        SELECT 
          st.*,
          ii.name as item_name,
          ii.sku
        FROM stock_transactions st
        LEFT JOIN inventory_items ii ON st.inventory_item_id = ii.id
        WHERE st.branch_id = ?
      `;

      const params = [branchId];

      if (itemId) {
        query += ' AND st.inventory_item_id = ?';
        params.push(itemId);
      }

      query += ' ORDER BY st.created_at DESC LIMIT 100';

      return await executeQuery(query, params);
    } catch (error) {
      throw new Error(`❌ Error fetching transactions: ${error.message}`);
    }
  }

  // ============================================================================
  // WASTAGE MANAGEMENT
  // ============================================================================

  /**
   * Report wastage
   * @param {number} branchId - Branch ID
   * @param {number} itemId - Item ID
   * @param {number} quantity - Wastage quantity
   * @param {string} reason - Reason (EXPIRY, DAMAGE, SPOILAGE, etc.)
   * @param {number} reportedBy - User ID
   * @returns {object} Wastage record
   */
  async reportWastage(branchId, itemId, quantity, reason, reportedBy) {
    try {
      const query = `
        INSERT INTO wastage (
          branch_id, inventory_item_id, quantity, reason,
          status, reported_by
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;

      const result = await executeQuery(query, [
        branchId,
        itemId,
        quantity,
        reason,
        'REPORTED',
        reportedBy,
      ]);

      return { id: result.insertId, status: 'REPORTED' };
    } catch (error) {
      throw new Error(`❌ Error reporting wastage: ${error.message}`);
    }
  }

  /**
   * Approve wastage
   * @param {number} wastageId - Wastage ID
   * @param {number} approvedBy - User ID
   */
  async approveWastage(wastageId, approvedBy) {
    try {
      // Get wastage record
      const query = `SELECT * FROM wastage WHERE id = ?`;
      const wastageRecords = await executeQuery(query, [wastageId]);
      const wastage = wastageRecords?.[0];

      if (!wastage) throw new Error('Wastage record not found');

      // Deduct from stock
      await this.deductStock(
        wastage.inventory_item_id,
        wastage.quantity,
        `WASTAGE-${wastageId}`,
        approvedBy
      );

      // Update wastage status
      const updateQuery = `
        UPDATE wastage
        SET status = ?, approved_by = ?, approved_date = NOW()
        WHERE id = ?
      `;

      await executeQuery(updateQuery, ['APPROVED', approvedBy, wastageId]);
      return { success: true };
    } catch (error) {
      throw new Error(`❌ Error approving wastage: ${error.message}`);
    }
  }

  /**
   * Get wastage reports
   * @param {number} branchId - Branch ID
   * @returns {array} Wastage records
   */
  async getWastageReports(branchId) {
    try {
      const query = `
        SELECT 
          w.*,
          ii.name as item_name,
          ii.sku
        FROM wastage w
        LEFT JOIN inventory_items ii ON w.inventory_item_id = ii.id
        WHERE w.branch_id = ?
        ORDER BY w.reported_date DESC LIMIT 100
      `;

      return await executeQuery(query, [branchId]);
    } catch (error) {
      throw new Error(`❌ Error fetching wastage: ${error.message}`);
    }
  }

  // ============================================================================
  // REPORTING
  // ============================================================================

  /**
   * Get inventory valuation
   * @param {number} branchId - Branch ID
   * @returns {array} Valuation data
   */
  async getInventoryValuation(branchId) {
    try {
      const query = `
        SELECT 
          id, sku, name, category, current_stock,
          purchase_price,
          (current_stock * purchase_price) as stock_value
        FROM inventory_items
        WHERE branch_id = ? AND is_active = TRUE
      `;

      return await executeQuery(query, [branchId]);
    } catch (error) {
      throw new Error(`❌ Error generating valuation: ${error.message}`);
    }
  }

  /**
   * Get consumption report
   * @param {number} branchId - Branch ID
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @returns {array} Consumption data
   */
  async getConsumptionReport(branchId, startDate, endDate) {
    try {
      const query = `
        SELECT 
          ii.id, ii.sku, ii.name,
          SUM(CASE WHEN st.transaction_type = 'SALE' THEN st.quantity ELSE 0 END) as sold,
          SUM(CASE WHEN st.transaction_type = 'WASTAGE' THEN st.quantity ELSE 0 END) as wasted,
          SUM(CASE WHEN st.transaction_type IN ('SALE', 'WASTAGE') THEN st.quantity ELSE 0 END) as total_consumed
        FROM inventory_items ii
        LEFT JOIN stock_transactions st ON ii.id = st.inventory_item_id
        WHERE ii.branch_id = ? AND st.created_at BETWEEN ? AND ?
        GROUP BY ii.id
        ORDER BY total_consumed DESC
      `;

      return await executeQuery(query, [branchId, startDate, endDate]);
    } catch (error) {
      throw new Error(`❌ Error generating consumption report: ${error.message}`);
    }
  }

  /**
   * Get variance report
   * @param {number} branchId - Branch ID
   * @returns {array} Variance data
   */
  async getVarianceReport(branchId) {
    try {
      const query = `
        SELECT 
          ii.id, ii.sku, ii.name,
          ii.current_stock,
          COALESCE(SUM(CASE WHEN st.transaction_type = 'PURCHASE' THEN st.quantity ELSE 0 END), 0) as total_purchased,
          COALESCE(SUM(CASE WHEN st.transaction_type IN ('SALE', 'WASTAGE') THEN st.quantity ELSE 0 END), 0) as total_consumed,
          (ii.current_stock - (COALESCE(SUM(CASE WHEN st.transaction_type = 'PURCHASE' THEN st.quantity ELSE 0 END), 0) - COALESCE(SUM(CASE WHEN st.transaction_type IN ('SALE', 'WASTAGE') THEN st.quantity ELSE 0 END), 0))) as variance
        FROM inventory_items ii
        LEFT JOIN stock_transactions st ON ii.id = st.inventory_item_id
        WHERE ii.branch_id = ?
        GROUP BY ii.id
        ORDER BY ABS(variance) DESC
      `;

      return await executeQuery(query, [branchId]);
    } catch (error) {
      throw new Error(`❌ Error generating variance report: ${error.message}`);
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Convert camelCase to snake_case
   */
  camelToSnake(str) {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }
}

module.exports = InventoryService;
