// Purchase Order Service - Handles purchase order operations

class PurchaseOrderService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Create purchase order
   */
  async createPurchaseOrder(restaurantId, branchId, poData, userId) {
    try {
      const query = `
        INSERT INTO purchase_orders (
          restaurant_id, branch_id, supplier_id, po_number,
          order_date, expected_delivery_date, status, total_amount,
          tax_amount, notes, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, 'draft', $7, $8, $9, $10)
        RETURNING *
      `;

      const values = [
        restaurantId,
        branchId,
        poData.supplierId,
        poData.poNumber,
        new Date(),
        poData.expectedDeliveryDate,
        poData.totalAmount || 0,
        poData.taxAmount || 0,
        poData.notes || '',
        userId,
      ];

      const result = await this.db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating purchase order: ${error.message}`);
    }
  }

  /**
   * Add items to purchase order
   */
  async addPOItem(poId, itemId, quantity, unitPrice) {
    try {
      const totalPrice = quantity * unitPrice;
      const query = `
        INSERT INTO purchase_order_items (
          purchase_order_id, item_id, quantity, unit_price, total_price
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;

      const values = [poId, itemId, quantity, unitPrice, totalPrice];
      const result = await this.db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error adding PO item: ${error.message}`);
    }
  }

  /**
   * Get purchase orders
   */
  async getPurchaseOrders(restaurantId, branchId, status = null) {
    try {
      let query = `
        SELECT * FROM purchase_orders
        WHERE restaurant_id = $1 AND branch_id = $2
      `;
      const values = [restaurantId, branchId];

      if (status) {
        query += ' AND status = $3';
        values.push(status);
      }

      query += ' ORDER BY order_date DESC';
      const result = await this.db.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching purchase orders: ${error.message}`);
    }
  }

  /**
   * Update PO status
   */
  async updatePOStatus(poId, status) {
    try {
      const query = `
        UPDATE purchase_orders
        SET status = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `;

      const result = await this.db.query(query, [status, poId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating PO status: ${error.message}`);
    }
  }

  /**
   * Submit purchase order
   */
  async submitPO(poId) {
    return this.updatePOStatus(poId, 'submitted');
  }

  /**
   * Confirm purchase order
   */
  async confirmPO(poId) {
    return this.updatePOStatus(poId, 'confirmed');
  }

  /**
   * Cancel purchase order
   */
  async cancelPO(poId) {
    return this.updatePOStatus(poId, 'cancelled');
  }
}

module.exports = PurchaseOrderService;
