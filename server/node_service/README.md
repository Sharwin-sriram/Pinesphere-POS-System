# Pinesphere POS System - Node.js Server

## Project Structure

```
server/
├── node_service/
│   ├── models/
│   │   └── inventory.model.js          # Database schema definitions
│   ├── services/
│   │   └── inventory/
│   │       ├── inventoryService.js     # Core inventory logic
│   │       ├── purchaseOrderService.js # Purchase order management
│   │       └── grnService.js           # Goods Receipt Note management
│   ├── controllers/
│   │   └── inventory/
│   │       ├── itemController.js       # Item management endpoints
│   │       ├── supplierController.js   # Supplier management endpoints
│   │       ├── wastageController.js    # Wastage tracking endpoints
│   │       └── reportController.js     # Report generation endpoints
│   ├── routes/
│   │   └── inventory/
│   │       ├── itemRoutes.js           # Item routes
│   │       ├── supplierRoutes.js       # Supplier routes
│   │       ├── wastageRoutes.js        # Wastage routes
│   │       ├── reportRoutes.js         # Report routes
│   │       └── index.js                # Main inventory router
│   ├── validators/
│   │   └── inventoryValidator.js       # Input validation
│   ├── utils/
│   │   └── inventoryUtils.js           # Utility functions
│   ├── middleware/
│   ├── config/
│   ├── server.js                       # Main server entry point
│   ├── package.json
│   └── .env.example
```

## Module 7: Inventory Management Features

### Features Implemented

#### 1. Item Management
- **Create Items**: Add new inventory items with SKU, category, pricing
- **List Items**: Retrieve all items for a restaurant/branch
- **Update Items**: Modify item details and stock levels
- **Low Stock Alerts**: Identify items below reorder level

#### 2. Supplier Management
- **Create Suppliers**: Add supplier information (contact, location, GST, PAN)
- **Manage Suppliers**: Update and retrieve supplier details
- **Supplier Details**: Store contact info, bank details, payment terms

#### 3. Stock Transactions
- **Record Movements**: Track all stock in/out with transaction types
- **Stock Deduction**: Auto-deduct on sales
- **Stock Addition**: Add on purchase/adjustment
- **Transaction History**: Complete audit trail

#### 4. Wastage Tracking
- **Report Wastage**: Log wasted items with reason
- **Wastage Approval**: Authorize wastage and auto-deduct stock
- **Wastage Reports**: Track wastage by reason, date, quantity

#### 5. Inventory Reports
- **Stock Valuation**: Calculate total inventory value
- **Consumption Reports**: Track item consumption over time
- **Stock Transactions**: View all stock movements
- **Variance Reports**: Compare expected vs actual stock

#### 6. Purchase Orders (Extensible)
- Create and manage purchase orders
- Track PO status (draft, submitted, confirmed, received)
- Manage supplier orders

#### 7. GRN Management (Extensible)
- Create Goods Receipt Notes
- Track received items
- Verify and accept receipts
- Manage batch/lot numbers

## API Endpoints

### Items
```
POST   /api/inventory/items              # Create item
GET    /api/inventory/items              # Get all items
GET    /api/inventory/items/:itemId      # Get item by ID
PUT    /api/inventory/items/:itemId      # Update item
GET    /api/inventory/items/stock/low-stock  # Get low stock items
POST   /api/inventory/items/:itemId/deduct   # Deduct stock
POST   /api/inventory/items/:itemId/add      # Add stock
```

### Suppliers
```
POST   /api/inventory/suppliers          # Create supplier
GET    /api/inventory/suppliers          # Get all suppliers
PUT    /api/inventory/suppliers/:supplierId  # Update supplier
```

### Wastage
```
POST   /api/inventory/wastage            # Report wastage
PUT    /api/inventory/wastage/:wastageId/approve  # Approve wastage
GET    /api/inventory/wastage            # Get wastage reports
```

### Reports
```
GET    /api/inventory/reports/transactions      # Stock transactions
GET    /api/inventory/reports/valuation         # Inventory valuation
GET    /api/inventory/reports/consumption       # Consumption report
GET    /api/inventory/reports/variance          # Variance report
```

## Database Schema (PostgreSQL)

### Main Tables
- `items` - Inventory items with pricing and stock
- `suppliers` - Supplier information
- `stock_transactions` - All stock movements
- `wastage` - Wastage records
- `purchase_orders` - Purchase order management
- `grn` - Goods Receipt Notes
- `stock_batches` - Batch/lot tracking
- `stock_transfers` - Inter-branch transfers

## Utility Functions

### InventoryUtils
- `calculateInventoryValue()` - Total inventory value
- `calculateReorderPoint()` - Reorder level calculation
- `calculateEOQ()` - Economic Order Quantity
- `isLowStock()` - Check if item is low stock
- `isExpired()` - Check if batch/item expired
- `generatePONumber()` - Generate PO numbers
- `generateGRNNumber()` - Generate GRN numbers
- `selectBatchesFIFO()` - FIFO batch selection

## Installation & Setup

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev

# Start production server
npm start
```

## Dependencies
- Express.js
- PostgreSQL (pg)
- Prisma (ORM)
- JWT
- Multer
- CORS
- Morgan

## Next Steps

1. **Database Migration**: Create database schema using Prisma
2. **API Integration**: Connect with frontend
3. **Additional Modules**:
   - Purchase Order Module (detailed management)
   - GRN Module (receipt management)
   - Stock Transfer Module (inter-branch transfers)
   - Batch Management (expiry tracking, FIFO)
4. **Advanced Features**:
   - Inventory forecasting
   - Automated reorder suggestions
   - Batch expiry alerts
   - Stock variance reconciliation

## Error Handling

All endpoints return consistent JSON responses:

```json
{
  "success": true/false,
  "message": "Operation message",
  "data": {},
  "error": "Error message if any"
}
```

## Security Considerations

- ✅ JWT authentication for protected routes
- ✅ Role-based access control
- ✅ Input validation on all endpoints
- ✅ Audit logging for all transactions
- ✅ Parameterized queries (SQL injection prevention)

## Performance Optimizations

- Indexed database queries
- Pagination for list endpoints
- Connection pooling (pg library)
- Caching strategy for reports (to be implemented)

## Testing

(To be implemented with unit and integration tests)

---

For more details, refer to the main SRS document.
