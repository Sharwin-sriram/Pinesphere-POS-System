// Inventory Validator - Input validation for inventory operations

class InventoryValidator {
  /**
   * Validate item creation
   */
  static validateItemCreation(data) {
    const errors = [];

    if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
      errors.push('Item name is required and must be a string');
    }

    if (!data.sku || typeof data.sku !== 'string' || data.sku.trim() === '') {
      errors.push('SKU is required and must be a string');
    }

    if (!data.category || typeof data.category !== 'string') {
      errors.push('Category is required');
    }

    if (!data.unit || typeof data.unit !== 'string') {
      errors.push('Unit is required');
    }

    if (typeof data.purchasePrice !== 'number' || data.purchasePrice < 0) {
      errors.push('Purchase price must be a positive number');
    }

    if (typeof data.sellingPrice !== 'number' || data.sellingPrice < 0) {
      errors.push('Selling price must be a positive number');
    }

    if (data.tax && (typeof data.tax !== 'number' || data.tax < 0)) {
      errors.push('Tax must be a positive number');
    }

    if (
      data.reorderLevel &&
      (typeof data.reorderLevel !== 'number' || data.reorderLevel < 0)
    ) {
      errors.push('Reorder level must be a positive number');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate supplier creation
   */
  static validateSupplierCreation(data) {
    const errors = [];

    if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
      errors.push('Supplier name is required');
    }

    if (
      !data.contactPerson ||
      typeof data.contactPerson !== 'string' ||
      data.contactPerson.trim() === ''
    ) {
      errors.push('Contact person name is required');
    }

    if (data.email && !this.isValidEmail(data.email)) {
      errors.push('Invalid email format');
    }

    if (data.phone && !this.isValidPhone(data.phone)) {
      errors.push('Invalid phone format');
    }

    if (!data.address || typeof data.address !== 'string') {
      errors.push('Address is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate stock transaction
   */
  static validateStockTransaction(data) {
    const errors = [];

    if (!data.itemId || typeof data.itemId !== 'string') {
      errors.push('Item ID is required');
    }

    if (typeof data.quantity !== 'number' || data.quantity <= 0) {
      errors.push('Quantity must be a positive number');
    }

    if (
      !data.transactionType ||
      !['purchase', 'sale', 'wastage', 'adjustment', 'transfer'].includes(
        data.transactionType
      )
    ) {
      errors.push('Invalid transaction type');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate wastage report
   */
  static validateWastageReport(data) {
    const errors = [];

    if (!data.itemId || typeof data.itemId !== 'string') {
      errors.push('Item ID is required');
    }

    if (typeof data.quantity !== 'number' || data.quantity <= 0) {
      errors.push('Quantity must be a positive number');
    }

    if (!data.reason || typeof data.reason !== 'string' || data.reason.trim() === '') {
      errors.push('Wastage reason is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Helper: Validate email format
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Helper: Validate phone format
   */
  static isValidPhone(phone) {
    const phoneRegex = /^[0-9+-]{10,}$/;
    return phoneRegex.test(phone);
  }
}

module.exports = InventoryValidator;
