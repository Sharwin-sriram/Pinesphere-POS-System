# Module 7 - Django Alignment Update

## Overview
Inventory Management Module (Module 7) has been updated to align with Django models for consistency across backend services.

## Key Changes

### 1. Database Schema Alignment
**File:** `config/inventory.sql`

#### Updated Tables with Django Field Mapping:

| Django Model | Node.js Table | Status |
|---|---|---|
| `Supplier` | `suppliers` | ✅ Updated |
| `InventoryItem` | `inventory_items` | ✅ Updated |
| `PurchaseOrder` | `purchase_orders` | ✅ Updated |
| `GRN` | `grn` | ✅ Updated |
| Stock Transactions | `stock_transactions` | ✅ Updated |
| Wastage Tracking | `wastage` | ✅ Updated |
| Recipe Items | `recipe_items` | ✅ Updated |
| Stock Batches | `stock_batches` | ✅ Updated |
| Stock Transfers | `stock_transfers` | ✅ Updated |

### 2. Field Name Conventions
Changed from:
- `restaurantId` + `branchId` → **`branchId` only** (branch is primary entity)
- `phone` → **`mobile`** (align with Django Supplier model)
- `gst` → **`gst_number`** (clearer naming)
- `pan` → removed (not in Django model)
- `unit` → **`unit_type`** (clearer naming)
- `item_id` → **`inventory_item_id`** (explicit reference)

### 3. Database Connection Configuration
**File:** `config/database.js`

**Updated to MySQL/MariaDB:**
- Changed from PostgreSQL (`pg` library) to MySQL (`mysql2/promise`)
- Implemented connection pooling with configurable limits
- Added transaction support with `executeTransaction()` method
- Added parameterized query execution with `executeQuery()` method
- Query placeholders changed from `$1, $2` to `?`

**Configuration includes:**
```javascript
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'pinesphere_pos',
  connectionLimit: parseInt(process.env.DB_POOL_LIMIT) || 10,
  charset: 'utf8mb4',
  collation: 'utf8mb4_unicode_ci',
  decimalNumbers: true, // Critical for inventory calculations
  dateStrings: true,
});
```

### 4. Data Models
**File:** `models/inventory.model.js`

Updated model definitions now use:
- MySQL/MariaDB syntax
- Proper foreign key constraints
- Integer IDs instead of UUIDs
- ENUM types for status fields
- DECIMAL precision (10,3) for quantities, (10,2) for prices

**Example - Supplier Model:**
```javascript
Supplier: {
  id: 'SERIAL PRIMARY KEY',
  branchId: 'INTEGER NOT NULL REFERENCES branches(id)',
  name: 'VARCHAR(255) NOT NULL',
  contactPerson: 'VARCHAR(255) NOT NULL',
  mobile: 'VARCHAR(20) NOT NULL', // Changed from 'phone'
  email: 'EMAIL NOT NULL',
  gstNumber: 'VARCHAR(20)', // Changed from 'gst'
  isActive: 'BOOLEAN DEFAULT true',
  createdAt: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
}
```

### 5. Service Layer Updates Required

**File:** `services/inventory/inventoryService.js` (pending update)

**Migration notes:**
- Change PostgreSQL queries to MySQL syntax (`?` instead of `$1`)
- Update table references: `items` → `inventory_items`
- Remove `restaurantId` parameter from methods
- Update field name mappings in all methods
- Use new database utility functions

**Example Method Signature Changes:**
```javascript
// Before (PostgreSQL)
async createItem(restaurantId, branchId, itemData)

// After (MySQL with Django alignment)
async createItem(branchId, supplierId, itemData)
```

### 6. Database Views Added

Three new views for reporting:

1. **`low_stock_items`** - Items below reorder level with supplier info
2. **`expiring_stock`** - Stock batches expiring within 30 days
3. **`inventory_valuation`** - Current inventory value by item

### 7. Foreign Key References

All tables now properly reference:
- `shared_schema.branches(id)` - Branch entity
- `shared_schema.users(id)` - User entity
- Internal references with ON DELETE CASCADE/SET NULL

### 8. SQL File Structure

**File:** `config/inventory.sql`

New features:
- **Comments:** Every field has descriptive comments
- **Indexes:** 15+ optimized indexes for query performance
- **Views:** 3 reporting views included
- **Charset:** UTF8MB4 support for international characters
- **Collation:** Unicode collation for proper sorting

### 9. Environment Variables

Update `.env` with MySQL connection settings:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=pinesphere_pos
DB_POOL_LIMIT=10
```

### 10. Migration Steps

**To implement these changes:**

1. **Update database credentials** in `.env`
2. **Create/update database schema:**
   ```bash
   mysql -u root -p pinesphere_pos < config/inventory.sql
   ```
3. **Update Node.js connection settings:**
   - Install mysql2: `npm install mysql2`
   - Remove pg dependency: `npm uninstall pg`
4. **Update service layer** (see pending tasks)
5. **Test API endpoints** with correct table/field names

### 11. Backward Compatibility

**Breaking Changes:**
- API field names now use snake_case (JSON responses)
- URL parameters remain camelCase for consistency
- Removed `restaurantId` from most methods
- Changed database from PostgreSQL to MySQL

**Migration Guide:**
- Update frontend API calls to use correct field names
- Update auth module to align with Django user references
- Update other modules to use new table structure

### 12. Pending Tasks

- [ ] Update `inventoryService.js` to use MySQL syntax
- [ ] Update `purchaseOrderService.js`
- [ ] Update `grnService.js`
- [ ] Update all controllers to use new field names
- [ ] Update validators for Django field names
- [ ] Update API documentation with new field names
- [ ] Test complete workflow end-to-end
- [ ] Update frontend API calls
- [ ] Database migration from PostgreSQL (if applicable)

### 13. Django Model References

**Django Models Used as Reference:**

Located in: `django_service/apps/inventory/models.py`

```python
class Supplier(models.Model):
    branch = models.ForeignKey('Branch', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=255)
    mobile = models.CharField(max_length=20)  # Key: 'mobile' not 'phone'
    email = models.EmailField()
    gst_number = models.CharField(max_length=20, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

class InventoryItem(models.Model):
    branch = models.ForeignKey('Branch', on_delete=models.CASCADE)
    supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True)
    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=100)
    unit_type = models.CharField(max_length=50)  # kg, litre, piece
    current_stock = models.DecimalField(max_digits=10, decimal_places=3)
    reorder_level = models.DecimalField(max_digits=10, decimal_places=3)
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2)
    expiry_date = models.DateField(null=True)
    is_active = models.BooleanField(default=True)

class PurchaseOrder(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'DRAFT'
        SENT = 'SENT'
        RECEIVED = 'RECEIVED'
        CANCELLED = 'CANCELLED'

    branch = models.ForeignKey('Branch', on_delete=models.CASCADE)
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE)
    po_number = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=20, choices=Status.choices)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    ordered_at = models.DateTimeField(auto_now_add=True)
```

### 14. Impact Assessment

**Affected Modules:**
- ✅ Inventory Management (Module 7)
- 🔄 Restaurant Admin (uses inventory data)
- 🔄 Menu Management (uses recipe items)
- 🔄 CRM (accesses inventory reports)
- 🔄 HR (may track inventory for staff)

**Testing Requirements:**
- [ ] Item CRUD operations
- [ ] Supplier management
- [ ] Purchase order lifecycle
- [ ] GRN receipt workflow
- [ ] Stock transaction audit trail
- [ ] Wastage reporting
- [ ] Inventory reports
- [ ] Low stock alerts

### 15. Summary

**Completed:**
✅ Updated database schema (SQL file)
✅ Updated data models
✅ Updated database connection config
✅ Added MySQL support
✅ Added reporting views
✅ Added performance indexes

**In Progress:**
🔄 Service layer migration to MySQL
🔄 Controller updates
🔄 API documentation

**Next Steps:**
- Complete service layer migration
- Update all controllers
- Test complete inventory workflow
- Update frontend API calls
- Deploy changes

---

**Version:** 1.0  
**Last Updated:** May 26, 2026  
**Status:** Django Alignment Phase 1 Complete
