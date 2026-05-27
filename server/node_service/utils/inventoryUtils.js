// Inventory Utils - Utility functions for inventory operations

class InventoryUtils {
  /**
   * Calculate inventory valuation
   */
  static calculateInventoryValue(items) {
    return items.reduce((total, item) => {
      return total + item.currentStock * item.purchasePrice;
    }, 0);
  }

  /**
   * Generate SKU
   */
  static generateSKU(prefix, counter) {
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}-${counter}-${timestamp}-${random}`;
  }

  /**
   * Calculate reorder point
   * Using formula: Reorder Point = (Average Daily Usage × Lead Time) + Safety Stock
   */
  static calculateReorderPoint(avgDailyUsage, leadTimeDays, safetyStock = 0) {
    return avgDailyUsage * leadTimeDays + safetyStock;
  }

  /**
   * Calculate economic order quantity (EOQ)
   * Using formula: EOQ = √(2DS/H)
   * D = Annual demand
   * S = Ordering cost per order
   * H = Holding cost per unit per year
   */
  static calculateEOQ(annualDemand, orderingCost, holdingCost) {
    if (holdingCost === 0) return 0;
    return Math.sqrt((2 * annualDemand * orderingCost) / holdingCost);
  }

  /**
   * Check if item is low stock
   */
  static isLowStock(currentStock, reorderLevel) {
    return currentStock <= reorderLevel;
  }

  /**
   * Check if item is expired
   */
  static isExpired(expiryDate) {
    return new Date(expiryDate) < new Date();
  }

  /**
   * Calculate stock variance
   */
  static calculateVariance(expectedStock, actualStock) {
    return {
      variance: actualStock - expectedStock,
      variancePercentage: ((actualStock - expectedStock) / expectedStock) * 100,
      isVarianceAcceptable: Math.abs(actualStock - expectedStock) < expectedStock * 0.05, // 5% variance threshold
    };
  }

  /**
   * Format inventory report
   */
  static formatInventoryReport(items) {
    return {
      totalItems: items.length,
      totalValue: this.calculateInventoryValue(items),
      totalQuantity: items.reduce((sum, item) => sum + item.currentStock, 0),
      lowStockItems: items.filter((item) => this.isLowStock(item.currentStock, item.reorderLevel)).length,
      averageItemValue: this.calculateInventoryValue(items) / items.length,
    };
  }

  /**
   * Generate purchase order number
   */
  static generatePONumber(branchCode) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `PO-${branchCode}-${timestamp}-${random}`;
  }

  /**
   * Generate GRN number
   */
  static generateGRNNumber(branchCode) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `GRN-${branchCode}-${timestamp}-${random}`;
  }

  /**
   * Calculate stock consumption rate
   */
  static calculateConsumptionRate(totalConsumed, days) {
    return (totalConsumed / days).toFixed(2);
  }

  /**
   * Predict days until stockout
   */
  static predictDaysUntilStockout(currentStock, dailyConsumption) {
    if (dailyConsumption === 0) return Infinity;
    return Math.floor(currentStock / dailyConsumption);
  }

  /**
   * Validate quantity received vs ordered
   */
  static validateReceivedQuantity(ordered, received) {
    const variance = Math.abs(ordered - received);
    const variancePercent = (variance / ordered) * 100;
    
    return {
      isAcceptable: variancePercent <= 5, // 5% tolerance
      variance,
      variancePercent: variancePercent.toFixed(2),
      status: variancePercent > 5 ? 'requires_approval' : 'acceptable',
    };
  }

  /**
   * Calculate FIFO (First In First Out) batch selection
   */
  static selectBatchesFIFO(batches, quantityRequired) {
    const sortedBatches = batches.sort((a, b) => 
      new Date(a.manufacturingDate) - new Date(b.manufacturingDate)
    );

    const selectedBatches = [];
    let remainingQuantity = quantityRequired;

    for (const batch of sortedBatches) {
      if (remainingQuantity <= 0) break;

      const quantityToTake = Math.min(batch.currentQuantity, remainingQuantity);
      selectedBatches.push({
        batchId: batch.id,
        batchNumber: batch.batchNumber,
        quantityTaken: quantityToTake,
        expiryDate: batch.expiryDate,
      });

      remainingQuantity -= quantityToTake;
    }

    return {
      selectedBatches,
      totalQuantitySelected: quantityRequired - remainingQuantity,
      isFullyFulfilled: remainingQuantity <= 0,
    };
  }
}

module.exports = InventoryUtils;
