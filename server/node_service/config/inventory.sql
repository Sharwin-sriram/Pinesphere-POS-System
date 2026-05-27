-- ============================================================================
-- Inventory Management Module Database Schema (Module 7)
-- Aligned with Django Models from Pinesphere POS System
-- Database: MySQL 8.0+ / MariaDB 10.5+
-- Schema: inventory_schema (references shared_schema for branches, users)
-- ============================================================================

-- ============================================================================
-- Suppliers Table
-- Stores supplier information with GST/PAN for tax compliance
-- Django Model: inventory.models.Supplier
-- ============================================================================
CREATE TABLE IF NOT EXISTS suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    branch_id INT NOT NULL COMMENT 'Foreign key to branches.id',
    name VARCHAR(255) NOT NULL COMMENT 'Supplier company name',
    contact_person VARCHAR(255) NOT NULL COMMENT 'Primary contact person',
    mobile VARCHAR(20) NOT NULL COMMENT 'Contact mobile number',
    email VARCHAR(255) NOT NULL COMMENT 'Email address',
    gst_number VARCHAR(20) COMMENT 'GST registration number for tax compliance',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Soft delete flag',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for frequently queried columns
    KEY idx_branch_id (branch_id),
    KEY idx_name (name),
    KEY idx_gst_number (gst_number),
    KEY idx_is_active (is_active),
    
    -- Constraints
    CONSTRAINT fk_supplier_branch FOREIGN KEY (branch_id) 
        REFERENCES shared_schema.branches(id) ON DELETE CASCADE,
    CONSTRAINT uk_supplier_branch_email UNIQUE (branch_id, email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Supplier Master Data - Django: inventory.Supplier';

-- ============================================================================
-- Inventory Items (Raw Materials) Table
-- Core inventory items with SKU, stock tracking, and supplier mapping
-- Django Model: inventory.models.InventoryItem
-- ============================================================================
CREATE TABLE IF NOT EXISTS inventory_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    branch_id INT NOT NULL COMMENT 'Foreign key to branches.id',
    supplier_id INT COMMENT 'Foreign key to suppliers.id',
    name VARCHAR(255) NOT NULL COMMENT 'Item name',
    sku VARCHAR(100) NOT NULL COMMENT 'Stock Keeping Unit - unique identifier',
    category VARCHAR(100) NOT NULL COMMENT 'Item category: vegetables, spices, dairy, meat, etc.',
    unit_type VARCHAR(50) NOT NULL COMMENT 'Unit: kg, litre, piece, dozen, etc.',
    current_stock DECIMAL(10,3) DEFAULT 0 COMMENT 'Current available quantity',
    reorder_level DECIMAL(10,3) NOT NULL COMMENT 'Minimum stock threshold for ordering',
    purchase_price DECIMAL(10,2) NOT NULL COMMENT 'Last purchase price',
    expiry_date DATE COMMENT 'Batch expiry date (if applicable)',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Soft delete flag',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for frequently queried columns
    KEY idx_branch_id (branch_id),
    KEY idx_sku (sku),
    KEY idx_supplier_id (supplier_id),
    KEY idx_category (category),
    KEY idx_is_active (is_active),
    KEY idx_reorder_check (branch_id, current_stock, reorder_level),
    
    -- Constraints
    CONSTRAINT fk_item_branch FOREIGN KEY (branch_id) 
        REFERENCES shared_schema.branches(id) ON DELETE CASCADE,
    CONSTRAINT fk_item_supplier FOREIGN KEY (supplier_id) 
        REFERENCES suppliers(id) ON DELETE SET NULL,
    CONSTRAINT uk_item_sku UNIQUE (sku)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Inventory Items/Raw Materials - Django: inventory.InventoryItem';

-- ============================================================================
-- Purchase Orders Table
-- Tracks purchase orders from suppliers with complete lifecycle
-- Django Model: inventory.models.PurchaseOrder
-- ============================================================================
CREATE TABLE IF NOT EXISTS purchase_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    branch_id INT NOT NULL COMMENT 'Foreign key to branches.id',
    supplier_id INT NOT NULL COMMENT 'Foreign key to suppliers.id',
    po_number VARCHAR(100) NOT NULL UNIQUE COMMENT 'Unique PO reference number',
    status ENUM('DRAFT', 'SENT', 'RECEIVED', 'CANCELLED') DEFAULT 'DRAFT' COMMENT 'PO lifecycle status',
    total DECIMAL(10,2) NOT NULL COMMENT 'Total PO amount',
    ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'PO creation timestamp',
    
    -- Indexes for frequently queried columns
    KEY idx_branch_id (branch_id),
    KEY idx_supplier_id (supplier_id),
    KEY idx_po_number (po_number),
    KEY idx_status (status),
    KEY idx_ordered_at (ordered_at),
    
    -- Constraints
    CONSTRAINT fk_po_branch FOREIGN KEY (branch_id) 
        REFERENCES shared_schema.branches(id) ON DELETE CASCADE,
    CONSTRAINT fk_po_supplier FOREIGN KEY (supplier_id) 
        REFERENCES suppliers(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Purchase Orders - Django: inventory.PurchaseOrder';

-- ============================================================================
-- Purchase Order Items Table
-- Line items in purchase orders with quantity and pricing
-- ============================================================================
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    purchase_order_id INT NOT NULL COMMENT 'Foreign key to purchase_orders.id',
    inventory_item_id INT NOT NULL COMMENT 'Foreign key to inventory_items.id',
    quantity DECIMAL(10,3) NOT NULL COMMENT 'Ordered quantity',
    unit_price DECIMAL(10,2) NOT NULL COMMENT 'Price per unit',
    total_price DECIMAL(10,2) NOT NULL COMMENT 'Quantity × Unit Price',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    KEY idx_po_id (purchase_order_id),
    KEY idx_item_id (inventory_item_id),
    
    -- Constraints
    CONSTRAINT fk_poi_po FOREIGN KEY (purchase_order_id) 
        REFERENCES purchase_orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_poi_item FOREIGN KEY (inventory_item_id) 
        REFERENCES inventory_items(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Purchase Order Line Items';

-- ============================================================================
-- Goods Receipt Notes (GRN) Table
-- Tracks received goods from suppliers with verification workflow
-- ============================================================================
CREATE TABLE IF NOT EXISTS grn (
    id INT AUTO_INCREMENT PRIMARY KEY,
    branch_id INT NOT NULL COMMENT 'Foreign key to branches.id',
    purchase_order_id INT COMMENT 'Foreign key to purchase_orders.id (optional)',
    grn_number VARCHAR(100) NOT NULL UNIQUE COMMENT 'Unique GRN reference number',
    received_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Goods receipt date',
    status ENUM('PENDING', 'VERIFIED', 'ACCEPTED', 'REJECTED') DEFAULT 'PENDING' COMMENT 'Receipt status',
    total_items INT COMMENT 'Number of line items',
    notes TEXT COMMENT 'Receipt notes/remarks',
    received_by INT COMMENT 'Foreign key to users.id',
    verified_by INT COMMENT 'Foreign key to users.id',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    KEY idx_branch_id (branch_id),
    KEY idx_grn_number (grn_number),
    KEY idx_status (status),
    KEY idx_received_date (received_date),
    
    -- Constraints
    CONSTRAINT fk_grn_branch FOREIGN KEY (branch_id) 
        REFERENCES shared_schema.branches(id) ON DELETE CASCADE,
    CONSTRAINT fk_grn_po FOREIGN KEY (purchase_order_id) 
        REFERENCES purchase_orders(id) ON DELETE SET NULL,
    CONSTRAINT fk_grn_received_by FOREIGN KEY (received_by) 
        REFERENCES shared_schema.users(id) ON DELETE SET NULL,
    CONSTRAINT fk_grn_verified_by FOREIGN KEY (verified_by) 
        REFERENCES shared_schema.users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Goods Receipt Notes';

-- ============================================================================
-- GRN Items Table
-- Individual items received in a GRN with batch tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS grn_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    grn_id INT NOT NULL COMMENT 'Foreign key to grn.id',
    inventory_item_id INT NOT NULL COMMENT 'Foreign key to inventory_items.id',
    quantity_ordered DECIMAL(10,3) COMMENT 'Quantity from PO',
    quantity_received DECIMAL(10,3) NOT NULL COMMENT 'Actual received quantity',
    quantity_accepted DECIMAL(10,3) COMMENT 'Quantity accepted after QC',
    quantity_rejected DECIMAL(10,3) COMMENT 'Quantity rejected',
    rejection_reason TEXT COMMENT 'Reason for rejection',
    batch_number VARCHAR(100) COMMENT 'Supplier batch/lot number',
    expiry_date DATE COMMENT 'Product expiry date',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    KEY idx_grn_id (grn_id),
    KEY idx_item_id (inventory_item_id),
    KEY idx_batch_number (batch_number),
    KEY idx_expiry_date (expiry_date),
    
    -- Constraints
    CONSTRAINT fk_grni_grn FOREIGN KEY (grn_id) 
        REFERENCES grn(id) ON DELETE CASCADE,
    CONSTRAINT fk_grni_item FOREIGN KEY (inventory_item_id) 
        REFERENCES inventory_items(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Goods Receipt Note Line Items';

-- ============================================================================
-- Stock Transactions Table
-- Complete audit trail of all stock movements (purchases, sales, adjustments)
-- ============================================================================
CREATE TABLE IF NOT EXISTS stock_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    branch_id INT NOT NULL COMMENT 'Foreign key to branches.id',
    inventory_item_id INT NOT NULL COMMENT 'Foreign key to inventory_items.id',
    transaction_type ENUM('PURCHASE', 'SALE', 'WASTAGE', 'ADJUSTMENT', 'TRANSFER') NOT NULL COMMENT 'Type of transaction',
    quantity DECIMAL(10,3) NOT NULL COMMENT 'Transaction quantity',
    previous_stock DECIMAL(10,3) COMMENT 'Stock before transaction',
    new_stock DECIMAL(10,3) COMMENT 'Stock after transaction',
    reference VARCHAR(255) COMMENT 'Reference ID (PO, GRN, etc.)',
    reference_type VARCHAR(50) COMMENT 'Type of reference',
    notes TEXT COMMENT 'Transaction notes',
    created_by INT COMMENT 'Foreign key to users.id',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for reporting queries
    KEY idx_branch_date (branch_id, created_at),
    KEY idx_item_date (inventory_item_id, created_at),
    KEY idx_transaction_type (transaction_type),
    KEY idx_reference (reference),
    
    -- Constraints
    CONSTRAINT fk_st_branch FOREIGN KEY (branch_id) 
        REFERENCES shared_schema.branches(id) ON DELETE CASCADE,
    CONSTRAINT fk_st_item FOREIGN KEY (inventory_item_id) 
        REFERENCES inventory_items(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stock Transaction Audit Trail';

-- ============================================================================
-- Wastage Table
-- Track inventory wastage, expiry, damage with approval workflow
-- ============================================================================
CREATE TABLE IF NOT EXISTS wastage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    branch_id INT NOT NULL COMMENT 'Foreign key to branches.id',
    inventory_item_id INT NOT NULL COMMENT 'Foreign key to inventory_items.id',
    quantity DECIMAL(10,3) NOT NULL COMMENT 'Wastage quantity',
    reason ENUM('EXPIRY', 'DAMAGE', 'SPOILAGE', 'PILFERAGE', 'OTHER') NOT NULL COMMENT 'Wastage reason',
    reported_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When wastage was reported',
    approved_date TIMESTAMP COMMENT 'When wastage was approved',
    status ENUM('REPORTED', 'APPROVED', 'REJECTED') DEFAULT 'REPORTED' COMMENT 'Approval status',
    notes TEXT COMMENT 'Wastage details/notes',
    reported_by INT COMMENT 'Foreign key to users.id',
    approved_by INT COMMENT 'Foreign key to users.id',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    KEY idx_branch_id (branch_id),
    KEY idx_item_id (inventory_item_id),
    KEY idx_status (status),
    KEY idx_reported_date (reported_date),
    
    -- Constraints
    CONSTRAINT fk_wastage_branch FOREIGN KEY (branch_id) 
        REFERENCES shared_schema.branches(id) ON DELETE CASCADE,
    CONSTRAINT fk_wastage_item FOREIGN KEY (inventory_item_id) 
        REFERENCES inventory_items(id) ON DELETE RESTRICT,
    CONSTRAINT fk_wastage_reported_by FOREIGN KEY (reported_by) 
        REFERENCES shared_schema.users(id) ON DELETE SET NULL,
    CONSTRAINT fk_wastage_approved_by FOREIGN KEY (approved_by) 
        REFERENCES shared_schema.users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Wastage Management';

-- ============================================================================
-- Stock Batch Table
-- Batch/lot tracking with expiry dates for FIFO management
-- ============================================================================
CREATE TABLE IF NOT EXISTS stock_batches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inventory_item_id INT NOT NULL COMMENT 'Foreign key to inventory_items.id',
    branch_id INT NOT NULL COMMENT 'Foreign key to branches.id',
    batch_number VARCHAR(100) NOT NULL COMMENT 'Supplier/internal batch number',
    expiry_date DATE NOT NULL COMMENT 'Product expiry date',
    manufacturing_date DATE COMMENT 'Manufacturing date',
    quantity DECIMAL(10,3) NOT NULL COMMENT 'Initial batch quantity',
    current_quantity DECIMAL(10,3) NOT NULL COMMENT 'Remaining quantity',
    purchase_price DECIMAL(10,2) NOT NULL COMMENT 'Purchase price per unit',
    status ENUM('ACTIVE', 'EXPIRED', 'DEPLETED') DEFAULT 'ACTIVE' COMMENT 'Batch status',
    grn_item_id INT COMMENT 'Foreign key to grn_items.id',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for FIFO and reporting
    KEY idx_item_id (inventory_item_id),
    KEY idx_branch_id (branch_id),
    KEY idx_batch_number (batch_number),
    KEY idx_expiry_date (expiry_date),
    KEY idx_status (status),
    KEY idx_fifo_fetch (branch_id, inventory_item_id, expiry_date, current_quantity),
    
    -- Constraints
    CONSTRAINT fk_sb_item FOREIGN KEY (inventory_item_id) 
        REFERENCES inventory_items(id) ON DELETE CASCADE,
    CONSTRAINT fk_sb_branch FOREIGN KEY (branch_id) 
        REFERENCES shared_schema.branches(id) ON DELETE CASCADE,
    CONSTRAINT fk_sb_grn_item FOREIGN KEY (grn_item_id) 
        REFERENCES grn_items(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Batch/Lot Tracking for FIFO Stock Management';

-- ============================================================================
-- Stock Transfer Table
-- Inter-branch stock transfers
-- ============================================================================
CREATE TABLE IF NOT EXISTS stock_transfers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    from_branch_id INT NOT NULL COMMENT 'Sending branch',
    to_branch_id INT NOT NULL COMMENT 'Receiving branch',
    transfer_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Transfer initiation date',
    status ENUM('PENDING', 'IN_TRANSIT', 'RECEIVED', 'CANCELLED') DEFAULT 'PENDING' COMMENT 'Transfer status',
    total_quantity DECIMAL(10,3) COMMENT 'Total quantity transferred',
    notes TEXT COMMENT 'Transfer notes',
    initiated_by INT COMMENT 'Foreign key to users.id',
    received_by INT COMMENT 'Foreign key to users.id',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    KEY idx_from_branch (from_branch_id),
    KEY idx_to_branch (to_branch_id),
    KEY idx_status (status),
    KEY idx_transfer_date (transfer_date),
    
    -- Constraints
    CONSTRAINT fk_st_from_branch FOREIGN KEY (from_branch_id) 
        REFERENCES shared_schema.branches(id) ON DELETE CASCADE,
    CONSTRAINT fk_st_to_branch FOREIGN KEY (to_branch_id) 
        REFERENCES shared_schema.branches(id) ON DELETE CASCADE,
    CONSTRAINT fk_st_initiated_by FOREIGN KEY (initiated_by) 
        REFERENCES shared_schema.users(id) ON DELETE SET NULL,
    CONSTRAINT fk_st_received_by FOREIGN KEY (received_by) 
        REFERENCES shared_schema.users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Inter-branch Stock Transfers';

-- ============================================================================
-- Stock Transfer Items Table
-- Individual items in a stock transfer
-- ============================================================================
CREATE TABLE IF NOT EXISTS stock_transfer_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stock_transfer_id INT NOT NULL COMMENT 'Foreign key to stock_transfers.id',
    inventory_item_id INT NOT NULL COMMENT 'Foreign key to inventory_items.id',
    quantity_sent DECIMAL(10,3) NOT NULL COMMENT 'Quantity sent from source branch',
    quantity_received DECIMAL(10,3) COMMENT 'Quantity received at destination',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    KEY idx_transfer_id (stock_transfer_id),
    KEY idx_item_id (inventory_item_id),
    
    -- Constraints
    CONSTRAINT fk_sti_transfer FOREIGN KEY (stock_transfer_id) 
        REFERENCES stock_transfers(id) ON DELETE CASCADE,
    CONSTRAINT fk_sti_item FOREIGN KEY (inventory_item_id) 
        REFERENCES inventory_items(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stock Transfer Line Items';

-- ============================================================================
-- Recipe Items Table
-- Map inventory items to recipes for cost calculation
-- ============================================================================
CREATE TABLE IF NOT EXISTS recipe_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    branch_id INT NOT NULL COMMENT 'Foreign key to branches.id',
    recipe_id INT NOT NULL COMMENT 'Reference to recipe in menu schema',
    inventory_item_id INT NOT NULL COMMENT 'Foreign key to inventory_items.id',
    quantity DECIMAL(10,3) NOT NULL COMMENT 'Quantity used per recipe',
    unit_type VARCHAR(50) NOT NULL COMMENT 'Unit of measurement',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    KEY idx_recipe_id (recipe_id),
    KEY idx_item_id (inventory_item_id),
    KEY idx_branch_id (branch_id),
    
    -- Constraints
    CONSTRAINT fk_ri_branch FOREIGN KEY (branch_id) 
        REFERENCES shared_schema.branches(id) ON DELETE CASCADE,
    CONSTRAINT fk_ri_item FOREIGN KEY (inventory_item_id) 
        REFERENCES inventory_items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Recipe Item Mapping for Cost Calculation';

-- ============================================================================
-- Views for Reporting
-- ============================================================================

-- Low Stock Alert View
CREATE OR REPLACE VIEW low_stock_items AS
SELECT 
    ii.id,
    ii.sku,
    ii.name,
    ii.current_stock,
    ii.reorder_level,
    ii.unit_type,
    ii.purchase_price,
    (ii.reorder_level - ii.current_stock) AS quantity_to_order,
    s.name AS supplier_name,
    s.mobile AS supplier_mobile,
    ii.branch_id,
    ii.created_at
FROM inventory_items ii
LEFT JOIN suppliers s ON ii.supplier_id = s.id
WHERE ii.current_stock <= ii.reorder_level AND ii.is_active = TRUE;

-- Expiring Stock View
CREATE OR REPLACE VIEW expiring_stock AS
SELECT 
    sb.id,
    sb.batch_number,
    ii.name AS item_name,
    ii.sku,
    sb.current_quantity,
    sb.expiry_date,
    DATEDIFF(sb.expiry_date, CURDATE()) AS days_until_expiry,
    ii.branch_id
FROM stock_batches sb
JOIN inventory_items ii ON sb.inventory_item_id = ii.id
WHERE sb.status = 'ACTIVE' 
  AND sb.expiry_date > CURDATE()
  AND DATEDIFF(sb.expiry_date, CURDATE()) <= 30
ORDER BY sb.expiry_date ASC;

-- Inventory Valuation View
CREATE OR REPLACE VIEW inventory_valuation AS
SELECT 
    ii.id,
    ii.sku,
    ii.name,
    ii.category,
    ii.current_stock,
    ii.purchase_price,
    (ii.current_stock * ii.purchase_price) AS stock_value,
    ii.branch_id,
    ii.created_at
FROM inventory_items ii
WHERE ii.is_active = TRUE;

-- ============================================================================
-- Indexes for Query Performance
-- ============================================================================

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_branch_category_active ON inventory_items(branch_id, category, is_active);
CREATE INDEX IF NOT EXISTS idx_supplier_branch_active ON suppliers(branch_id, is_active);
CREATE INDEX IF NOT EXISTS idx_po_status_ordered ON purchase_orders(status, ordered_at);
CREATE INDEX IF NOT EXISTS idx_grn_status_received ON grn(status, received_date);
CREATE INDEX IF NOT EXISTS idx_wastage_branch_status ON wastage(branch_id, status);
CREATE INDEX IF NOT EXISTS idx_batch_expiry_active ON stock_batches(branch_id, expiry_date, status);
