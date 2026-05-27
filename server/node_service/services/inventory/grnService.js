// GRN Service - Handles Goods Receipt Note operations

class GRNService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Create GRN
   */
  async createGRN(restaurantId, branchId, grnData, userId) {
    try {
      const query = `
        INSERT INTO grn (
          restaurant_id, branch_id, purchase_order_id, grn_number,
          received_date, status, total_items, total_quantity,
          notes, received_by
        ) VALUES ($1, $2, $3, $4, NOW(), 'pending', $5, $6, $7, $8)
        RETURNING *
      `;

      const values = [
        restaurantId,
        branchId,
        grnData.purchaseOrderId,
        grnData.grnNumber,
        grnData.totalItems || 0,
        grnData.totalQuantity || 0,
        grnData.notes || '',
        userId,
      ];

      const result = await this.db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating GRN: ${error.message}`);
    }
  }

  /**
   * Add items to GRN
   */
  async addGRNItem(grnId, itemId, quantityReceived, quantityAccepted, batchNumber, expiryDate) {
    try {
      const query = `
        INSERT INTO grn_items (
          grn_id, item_id, quantity_received, quantity_accepted,
          batch_number, expiry_date
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const values = [
        grnId,
        itemId,
        quantityReceived,
        quantityAccepted,
        batchNumber,
        expiryDate,
      ];

      const result = await this.db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error adding GRN item: ${error.message}`);
    }
  }

  /**
   * Get GRNs
   */
  async getGRNs(restaurantId, branchId, status = null) {
    try {
      let query = `
        SELECT * FROM grn
        WHERE restaurant_id = $1 AND branch_id = $2
      `;
      const values = [restaurantId, branchId];

      if (status) {
        query += ' AND status = $3';
        values.push(status);
      }

      query += ' ORDER BY received_date DESC';
      const result = await this.db.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching GRNs: ${error.message}`);
    }
  }

  /**
   * Verify GRN
   */
  async verifyGRN(grnId, userId) {
    try {
      const query = `
        UPDATE grn
        SET status = 'verified', verified_by = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `;

      const result = await this.db.query(query, [userId, grnId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error verifying GRN: ${error.message}`);
    }
  }

  /**
   * Accept GRN (finalize receipt and update stock)
   */
  async acceptGRN(grnId, userId) {
    try {
      const query = `
        UPDATE grn
        SET status = 'accepted', updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;

      const result = await this.db.query(query, [grnId, userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error accepting GRN: ${error.message}`);
    }
  }
}

module.exports = GRNService;
