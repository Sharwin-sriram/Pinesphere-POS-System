# Module 7 - Complete Testing Guide
## End-to-End Workflow Verification

This guide provides practical examples to test all Module 7 functionality.

---

## Prerequisites

1. **Database is running and schema is created**
   ```bash
   mysql -u root -p pinesphere_pos < config/inventory.sql
   ```

2. **Server is running**
   ```bash
   npm run dev
   # Server should start on http://localhost:9933
   ```

3. **Verification script passes** (optional)
   ```bash
   node verify-module7.js
   # Should show green checkmarks for all items
   ```

---

## Test Data Setup

### Branch ID Assumption
All examples assume:
- Branch ID: `1` (You may need to adjust based on your database)
- User ID: `1` (Current user)

To find your branch ID:
```bash
mysql -u root -p pinesphere_pos -e "SELECT * FROM branches LIMIT 1;"
```

---

## Complete Testing Workflow

### Step 1: Create a Supplier

**Request:**
```bash
curl -X POST http://localhost:9933/api/inventory/suppliers \
  -H "Content-Type: application/json" \
  -d '{
    "branchId": 1,
    "name": "Fresh Organic Suppliers",
    "contactPerson": "Rajesh Kumar",
    "mobile": "9876543210",
    "email": "rajesh@freshorganic.com",
    "gstNumber": "27AABFR5055K1Z0"
  }'
```

**Expected Response:**
```json
{
  "id": 1,
  "branchId": 1,
  "name": "Fresh Organic Suppliers",
  "contactPerson": "Rajesh Kumar",
  "mobile": "9876543210",
  "email": "rajesh@freshorganic.com",
  "gstNumber": "27AABFR5055K1Z0"
}
```

**Save:** `SUPPLIER_ID = 1`

---

### Step 2: Create Inventory Items

Create multiple items to test various scenarios.

**Item 1: Tomatoes (frequently used)**
```bash
curl -X POST http://localhost:9933/api/inventory/items \
  -H "Content-Type: application/json" \
  -d '{
    "branchId": 1,
    "supplierId": 1,
    "name": "Fresh Tomatoes",
    "sku": "VEG-TOM-001",
    "category": "Vegetables",
    "unitType": "kg",
    "currentStock": 0,
    "reorderLevel": 20,
    "purchasePrice": 45.50
  }'
```

**Item 2: Onions (will trigger low stock)**
```bash
curl -X POST http://localhost:9933/api/inventory/items \
  -H "Content-Type: application/json" \
  -d '{
    "branchId": 1,
    "supplierId": 1,
    "name": "Yellow Onions",
    "sku": "VEG-ONI-001",
    "category": "Vegetables",
    "unitType": "kg",
    "currentStock": 10,
    "reorderLevel": 25,
    "purchasePrice": 35.00
  }'
```

**Item 3: Potatoes (will test wastage)**
```bash
curl -X POST http://localhost:9933/api/inventory/items \
  -H "Content-Type: application/json" \
  -d '{
    "branchId": 1,
    "supplierId": 1,
    "name": "Red Potatoes",
    "sku": "VEG-POT-001",
    "category": "Vegetables",
    "unitType": "kg",
    "currentStock": 50,
    "reorderLevel": 15,
    "purchasePrice": 30.00
  }'
```

**Save:** 
- `ITEM_TOMATOES_ID = 1`
- `ITEM_ONIONS_ID = 2`
- `ITEM_POTATOES_ID = 3`

---

### Step 3: Add Stock (Purchase)

**Receive 100kg of Tomatoes**
```bash
curl -X POST http://localhost:9933/api/inventory/items/1/add-stock \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 100,
    "type": "PURCHASE",
    "reference": "PO-001",
    "userId": 1
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "newStock": 100
}
```

**Receive 50kg of Onions**
```bash
curl -X POST http://localhost:9933/api/inventory/items/2/add-stock \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 50,
    "type": "PURCHASE",
    "reference": "PO-001",
    "userId": 1
  }'
```

**Expected:**
- Tomatoes: 0 + 100 = 100 kg ✅
- Onions: 10 + 50 = 60 kg ✅

---

### Step 4: Check Inventory Status

**Get All Items**
```bash
curl http://localhost:9933/api/inventory/items?branchId=1
```

**Expected:** Returns 3 items with updated stock levels

**Get Low Stock Items**
```bash
curl http://localhost:9933/api/inventory/items/low-stock?branchId=1
```

**Expected:** Should return items where `current_stock <= reorder_level`
(Currently should be empty since we've stocked up)

---

### Step 5: Deduct Stock (Sales)

**Sell 25kg of Tomatoes for Order #100**
```bash
curl -X POST http://localhost:9933/api/inventory/items/1/deduct-stock \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 25,
    "reference": "ORDER-100",
    "userId": 1
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "newStock": 75
}
```

**Sell 60kg of Onions (complete stock)**
```bash
curl -X POST http://localhost:9933/api/inventory/items/2/deduct-stock \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 60,
    "reference": "ORDER-101",
    "userId": 1
  }'
```

**Expected:**
- Tomatoes: 100 - 25 = 75 kg ✅
- Onions: 60 - 60 = 0 kg ✅ (This will trigger low stock alert!)

---

### Step 6: Check Low Stock Alert

**Get Low Stock Items**
```bash
curl http://localhost:9933/api/inventory/items/low-stock?branchId=1
```

**Expected:** Now Onions should appear (0 <= 25)
```json
[
  {
    "id": 2,
    "name": "Yellow Onions",
    "current_stock": 0,
    "reorder_level": 25,
    "qty_to_order": 25,
    "supplier_name": "Fresh Organic Suppliers"
  }
]
```

---

### Step 7: Report Wastage

**Report 5kg of Potatoes as Spoiled**
```bash
curl -X POST http://localhost:9933/api/inventory/wastage \
  -H "Content-Type: application/json" \
  -d '{
    "branchId": 1,
    "itemId": 3,
    "quantity": 5,
    "reason": "SPOILAGE",
    "reportedBy": 1
  }'
```

**Expected Response:**
```json
{
  "id": 1,
  "status": "REPORTED"
}
```

**Save:** `WASTAGE_ID = 1`

---

### Step 8: View Wastage Report

**Get All Wastage Reports**
```bash
curl http://localhost:9933/api/inventory/wastage?branchId=1
```

**Expected:** Shows the reported wastage with status "REPORTED"

---

### Step 9: Approve Wastage

**Manager Approves Wastage (Auto-deducts stock)**
```bash
curl -X PUT http://localhost:9933/api/inventory/wastage/1/approve \
  -H "Content-Type: application/json" \
  -d '{
    "approvedBy": 1
  }'
```

**Expected:**
```json
{
  "success": true
}
```

**Automatic Stock Update:**
- Potatoes: 50 - 5 = 45 kg ✅
- Stock transaction created automatically

---

### Step 10: View Stock Transactions (Audit Trail)

**Get All Transactions**
```bash
curl http://localhost:9933/api/inventory/reports/transactions?branchId=1
```

**Expected:** Complete history of all operations:
```json
[
  {
    "type": "PURCHASE",
    "item_name": "Fresh Tomatoes",
    "quantity": 100,
    "reference": "PO-001",
    "previous_stock": 0,
    "new_stock": 100
  },
  {
    "type": "PURCHASE",
    "item_name": "Yellow Onions",
    "quantity": 50,
    "reference": "PO-001",
    "previous_stock": 10,
    "new_stock": 60
  },
  {
    "type": "SALE",
    "item_name": "Fresh Tomatoes",
    "quantity": 25,
    "reference": "ORDER-100",
    "previous_stock": 100,
    "new_stock": 75
  },
  {
    "type": "SALE",
    "item_name": "Yellow Onions",
    "quantity": 60,
    "reference": "ORDER-101",
    "previous_stock": 60,
    "new_stock": 0
  },
  {
    "type": "WASTAGE",
    "item_name": "Red Potatoes",
    "quantity": 5,
    "reference": "WASTAGE-1",
    "previous_stock": 50,
    "new_stock": 45
  }
]
```

---

### Step 11: Generate Reports

**Inventory Valuation**
```bash
curl http://localhost:9933/api/inventory/reports/valuation?branchId=1
```

**Expected:** Total inventory value
```json
[
  {
    "id": 1,
    "sku": "VEG-TOM-001",
    "name": "Fresh Tomatoes",
    "current_stock": 75,
    "purchase_price": 45.50,
    "stock_value": 3412.50
  },
  {
    "id": 2,
    "sku": "VEG-ONI-001",
    "name": "Yellow Onions",
    "current_stock": 0,
    "purchase_price": 35.00,
    "stock_value": 0
  },
  {
    "id": 3,
    "sku": "VEG-POT-001",
    "name": "Red Potatoes",
    "current_stock": 45,
    "purchase_price": 30.00,
    "stock_value": 1350.00
  }
]
```

**Total Inventory Value: ₹4,762.50**

---

### Step 12: Update Item Details

**Update Tomatoes Reorder Level**
```bash
curl -X PUT http://localhost:9933/api/inventory/items/1 \
  -H "Content-Type: application/json" \
  -d '{
    "reorderLevel": 30
  }'
```

**Update Supplier Contact**
```bash
curl -X PUT http://localhost:9933/api/inventory/suppliers/1 \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "9123456789",
    "email": "newcontact@freshorganic.com"
  }'
```

---

## Error Scenarios to Test

### Test: Insufficient Stock

**Try to deduct more than available**
```bash
curl -X POST http://localhost:9933/api/inventory/items/2/deduct-stock \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 100,
    "reference": "ORDER-999",
    "userId": 1
  }'
```

**Expected Error:**
```json
{
  "success": false,
  "error": "❌ Error deducting stock: Insufficient stock. Available: 0"
}
```

---

### Test: Invalid Item ID

**Try to access non-existent item**
```bash
curl http://localhost:9933/api/inventory/items/9999
```

**Expected:** Should return 404 or null

---

### Test: Missing Required Fields

**Try to create item without required fields**
```bash
curl -X POST http://localhost:9933/api/inventory/items \
  -H "Content-Type: application/json" \
  -d '{
    "branchId": 1
  }'
```

**Expected:** Validation error (once validators are implemented)

---

## Verification Checklist

After running all tests above, verify:

- [ ] **Suppliers**: Created successfully with GST number
- [ ] **Items**: Created with correct stock levels
- [ ] **Stock Addition**: Stock increases correctly (PURCHASE)
- [ ] **Stock Deduction**: Stock decreases correctly (SALE)
- [ ] **Low Stock Alert**: Shows when stock ≤ reorder level
- [ ] **Wastage Reporting**: Items can be reported as waste
- [ ] **Wastage Approval**: Wastage auto-deducts stock when approved
- [ ] **Transaction Audit**: All operations logged with timestamps
- [ ] **Inventory Reports**: Valuation calculated correctly
- [ ] **Error Handling**: System rejects invalid operations

---

## Performance Notes

- All queries use parameterized statements (SQL injection safe)
- Database connection pooling (10 connections)
- Transactions ensure data integrity
- Proper indexing on frequently queried columns
- UTF8MB4 support for international text

---

## Troubleshooting

### "Table not found" Error
```bash
# Verify schema is loaded
mysql -u root -p pinesphere_pos -e "SHOW TABLES;"

# Re-run schema if needed
mysql -u root -p pinesphere_pos < config/inventory.sql
```

### "Database connection failed"
```bash
# Check MySQL is running
sudo systemctl status mysql

# Verify credentials in .env file
cat .env | grep DB_
```

### "Port 9933 already in use"
```bash
# Change PORT in .env
echo "PORT=9934" >> .env

# Or kill existing process
lsof -i :9933
kill -9 <PID>
```

---

## Next Steps

Once all tests pass:

1. **Frontend Integration**: Wire up React components to these endpoints
2. **Advanced Features**: Purchase orders, GRN workflow
3. **Multi-branch**: Test with multiple branches
4. **Reports**: Generate PDF/Excel reports
5. **Notifications**: Setup low-stock alerts

---

**Module 7 Complete Testing Guide** ✅  
Last Updated: May 26, 2026
