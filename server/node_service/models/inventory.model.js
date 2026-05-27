// Inventory Model - Database Schema definitions
// Aligned with Django models for consistency across backend services
// Reference: Django schemas in auth_service/inventory app

const inventoryModels = {
  // Supplier Model (Django: Supplier)
  // Stores supplier information with GST/contact details
  Supplier: {
    id: 'SERIAL PRIMARY KEY',
    branchId: 'INTEGER NOT NULL REFERENCES branches(id)',
    name: 'VARCHAR(255) NOT NULL',
    contactPerson: 'VARCHAR(255) NOT NULL',
    mobile: 'VARCHAR(20) NOT NULL',
    email: 'EMAIL NOT NULL',
    gstNumber: 'VARCHAR(20)',
    isActive: 'BOOLEAN DEFAULT true',
    createdAt: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    // DB Table: django_schema.suppliers
  },

  // Inventory Item Model (Django: InventoryItem)
  // Core inventory items with stock tracking
  InventoryItem: {
    id: 'SERIAL PRIMARY KEY',
    branchId: 'INTEGER NOT NULL REFERENCES branches(id)',
    supplierId: 'INTEGER REFERENCES suppliers(id) ON DELETE SET NULL',
    name: 'VARCHAR(255) NOT NULL',
    sku: 'VARCHAR(100) UNIQUE NOT NULL',
    category: 'VARCHAR(100) NOT NULL', // vegetables, spices, dairy, meat, etc.
    unitType: 'VARCHAR(50) NOT NULL', // kg, litre, piece, etc.
    currentStock: 'DECIMAL(10,3) DEFAULT 0',
    reorderLevel: 'DECIMAL(10,3) NOT NULL',
    purchasePrice: 'DECIMAL(10,2) NOT NULL',
    expiryDate: 'DATE', // Batch expiry tracking
    isActive: 'BOOLEAN DEFAULT true',
    createdAt: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    updatedAt: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    // DB Table: django_schema.inventory_items
  },

  // Purchase Order Model (Django: PurchaseOrder)
  // PO lifecycle management for inventory procurement
  PurchaseOrder: {
    id: 'SERIAL PRIMARY KEY',
    branchId: 'INTEGER NOT NULL REFERENCES branches(id)',
    supplierId: 'INTEGER NOT NULL REFERENCES suppliers(id)',
    poNumber: 'VARCHAR(100) UNIQUE NOT NULL',
    status: 'ENUM("DRAFT", "SENT", "RECEIVED", "CANCELLED") DEFAULT "DRAFT"',
    total: 'DECIMAL(10,2) NOT NULL',
    orderedAt: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    // DB Table: django_schema.purchase_orders
  },

  // Purchase Order Items
  PurchaseOrderItem: {
    id: 'SERIAL PRIMARY KEY',
    purchaseOrderId: 'INTEGER NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE',
    inventoryItemId: 'INTEGER NOT NULL REFERENCES inventory_items(id)',
    quantity: 'DECIMAL(10,3) NOT NULL',
    unitPrice: 'DECIMAL(10,2) NOT NULL',
    totalPrice: 'DECIMAL(10,2) NOT NULL',
    createdAt: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  },

  // Goods Receipt Note (GRN) Model
  // Tracks received goods and verifies against PO
  GRN: {
    id: 'SERIAL PRIMARY KEY',
    branchId: 'INTEGER NOT NULL REFERENCES branches(id)',
    purchaseOrderId: 'INTEGER REFERENCES purchase_orders(id)',
    grnNumber: 'VARCHAR(100) UNIQUE NOT NULL',
    receivedDate: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    status: 'ENUM("PENDING", "VERIFIED", "ACCEPTED", "REJECTED") DEFAULT "PENDING"',
    totalItems: 'INTEGER',
    notes: 'TEXT',
    receivedBy: 'INTEGER REFERENCES users(id)',
    verifiedBy: 'INTEGER REFERENCES users(id)',
    createdAt: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    updatedAt: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
  },

  // GRN Items - Detailed items received in GRN
  GRNItem: {
    id: 'SERIAL PRIMARY KEY',
    grnId: 'INTEGER NOT NULL REFERENCES grn(id) ON DELETE CASCADE',
    inventoryItemId: 'INTEGER NOT NULL REFERENCES inventory_items(id)',
    quantityOrdered: 'DECIMAL(10,3)',
    quantityReceived: 'DECIMAL(10,3) NOT NULL',
    quantityAccepted: 'DECIMAL(10,3)',
    quantityRejected: 'DECIMAL(10,3)',
    rejectionReason: 'TEXT',
    batchNumber: 'VARCHAR(100)',
    expiryDate: 'DATE',
    createdAt: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    updatedAt: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
  },

  // Stock Transaction Model - Audit trail for all stock movements
  StockTransaction: {
    id: 'SERIAL PRIMARY KEY',
    branchId: 'INTEGER NOT NULL REFERENCES branches(id)',
    inventoryItemId: 'INTEGER NOT NULL REFERENCES inventory_items(id)',
    transactionType: 'ENUM("PURCHASE", "SALE", "WASTAGE", "ADJUSTMENT", "TRANSFER") NOT NULL',
    quantity: 'DECIMAL(10,3) NOT NULL',
    previousStock: 'DECIMAL(10,3)',
    newStock: 'DECIMAL(10,3)',
    reference: 'VARCHAR(255)', // PO number, GRN number, etc.
    referenceType: 'VARCHAR(50)', // purchase_order, grn, wastage, etc.
    notes: 'TEXT',
    createdBy: 'INTEGER REFERENCES users(id)',
    createdAt: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  },

  // Wastage Tracking Model - Track waste, spoilage, expiry
  Wastage: {
    id: 'SERIAL PRIMARY KEY',
    branchId: 'INTEGER NOT NULL REFERENCES branches(id)',
    inventoryItemId: 'INTEGER NOT NULL REFERENCES inventory_items(id)',
    quantity: 'DECIMAL(10,3) NOT NULL',
    reason: 'ENUM("EXPIRY", "DAMAGE", "SPOILAGE", "PILFERAGE", "OTHER") NOT NULL',
    reportedDate: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    approvedDate: 'TIMESTAMP',
    status: 'ENUM("REPORTED", "APPROVED", "REJECTED") DEFAULT "REPORTED"',
    notes: 'TEXT',
    reportedBy: 'INTEGER REFERENCES users(id)',
    approvedBy: 'INTEGER REFERENCES users(id)',
    createdAt: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    updatedAt: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
  },

  // Recipe Mapping Model - Map inventory items to recipes for costing
  RecipeItem: {
    id: 'SERIAL PRIMARY KEY',
    branchId: 'INTEGER NOT NULL REFERENCES branches(id)',
    recipeId: 'INTEGER NOT NULL',
    inventoryItemId: 'INTEGER NOT NULL REFERENCES inventory_items(id)',
    quantity: 'DECIMAL(10,3) NOT NULL',
    unitType: 'VARCHAR(50) NOT NULL',
    createdAt: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    updatedAt: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
  },

  // Stock Batch Model - Batch/lot tracking with expiry dates
  StockBatch: {
    id: 'SERIAL PRIMARY KEY',
    inventoryItemId: 'INTEGER NOT NULL REFERENCES inventory_items(id)',
    branchId: 'INTEGER NOT NULL REFERENCES branches(id)',
    batchNumber: 'VARCHAR(100) NOT NULL',
    expiryDate: 'DATE NOT NULL',
    manufacturingDate: 'DATE',
    quantity: 'DECIMAL(10,3) NOT NULL',
    currentQuantity: 'DECIMAL(10,3) NOT NULL',
    purchasePrice: 'DECIMAL(10,2) NOT NULL',
    status: 'ENUM("ACTIVE", "EXPIRED", "DEPLETED") DEFAULT "ACTIVE"',
    grnItemId: 'INTEGER REFERENCES grn_items(id)',
    createdAt: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    updatedAt: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
  },

  // Inter-branch Stock Transfer
  StockTransfer: {
    id: 'SERIAL PRIMARY KEY',
    branchId: 'INTEGER NOT NULL REFERENCES branches(id)',
    fromBranchId: 'INTEGER NOT NULL REFERENCES branches(id)',
    toBranchId: 'INTEGER NOT NULL REFERENCES branches(id)',
    transferDate: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    status: 'ENUM("PENDING", "IN_TRANSIT", "RECEIVED", "CANCELLED") DEFAULT "PENDING"',
    totalQuantity: 'DECIMAL(10,3)',
    notes: 'TEXT',
    initiatedBy: 'INTEGER REFERENCES users(id)',
    receivedBy: 'INTEGER REFERENCES users(id)',
    createdAt: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    updatedAt: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
  },

  // Stock Transfer Items - Individual items in a transfer
  StockTransferItem: {
    id: 'SERIAL PRIMARY KEY',
    stockTransferId: 'INTEGER NOT NULL REFERENCES stock_transfers(id) ON DELETE CASCADE',
    inventoryItemId: 'INTEGER NOT NULL REFERENCES inventory_items(id)',
    quantitySent: 'DECIMAL(10,3) NOT NULL',
    quantityReceived: 'DECIMAL(10,3)',
    createdAt: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    updatedAt: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
  },
};

module.exports = inventoryModels;
