// Inventory API Documentation
// Complete API reference for Inventory Management Module

/**
 * BASE URL: http://localhost:5000/api/inventory
 */

// ==================== ITEMS ENDPOINTS ====================

/**
 * 1. CREATE ITEM
 * POST /api/inventory/items
 * 
 * Request Body:
 * {
 *   "restaurantId": "uuid",
 *   "branchId": "uuid",
 *   "name": "Tomato",
 *   "sku": "TOM-001",
 *   "category": "vegetables",
 *   "unit": "kg",
 *   "purchasePrice": 50,
 *   "sellingPrice": 80,
 *   "tax": 5,
 *   "reorderLevel": 10,
 *   "currentStock": 25,
 *   "description": "Fresh tomatoes"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Item created successfully",
 *   "data": { item object }
 * }
 */

/**
 * 2. GET ALL ITEMS
 * GET /api/inventory/items?restaurantId=uuid&branchId=uuid
 * 
 * Query Parameters:
 * - restaurantId (required)
 * - branchId (optional)
 * 
 * Response:
 * {
 *   "success": true,
 *   "count": 5,
 *   "data": [{ item1 }, { item2 }, ...]
 * }
 */

/**
 * 3. GET ITEM BY ID
 * GET /api/inventory/items/:itemId
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": { item object }
 * }
 */

/**
 * 4. UPDATE ITEM
 * PUT /api/inventory/items/:itemId
 * 
 * Request Body:
 * {
 *   "purchasePrice": 55,
 *   "sellingPrice": 85,
 *   "reorderLevel": 15
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Item updated successfully",
 *   "data": { updated item object }
 * }
 */

/**
 * 5. GET LOW STOCK ITEMS
 * GET /api/inventory/items/stock/low-stock?restaurantId=uuid&branchId=uuid
 * 
 * Returns items where current_stock <= reorder_level
 * 
 * Response:
 * {
 *   "success": true,
 *   "count": 3,
 *   "data": [{ item1 }, { item2 }, ...]
 * }
 */

/**
 * 6. DEDUCT STOCK (On Sale)
 * POST /api/inventory/items/:itemId/deduct
 * 
 * Request Body:
 * {
 *   "quantity": 5,
 *   "reference": "ORD-12345",
 *   "userId": "user-uuid"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Stock deducted successfully",
 *   "data": {
 *     "success": true,
 *     "newStock": 20
 *   }
 * }
 */

/**
 * 7. ADD STOCK (Purchase/Adjustment)
 * POST /api/inventory/items/:itemId/add
 * 
 * Request Body:
 * {
 *   "quantity": 50,
 *   "transactionType": "purchase",
 *   "reference": "PO-001",
 *   "userId": "user-uuid"
 * }
 * 
 * Transaction Types:
 * - purchase: Stock received from supplier
 * - adjustment: Manual stock adjustment
 * - transfer: Stock received from another branch
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Stock added successfully",
 *   "data": {
 *     "success": true,
 *     "newStock": 75
 *   }
 * }
 */

// ==================== SUPPLIERS ENDPOINTS ====================

/**
 * 8. CREATE SUPPLIER
 * POST /api/inventory/suppliers
 * 
 * Request Body:
 * {
 *   "restaurantId": "uuid",
 *   "name": "Fresh Farms Ltd",
 *   "contactPerson": "John Doe",
 *   "email": "john@freshfarms.com",
 *   "phone": "9876543210",
 *   "address": "123 Market Street",
 *   "city": "Mumbai",
 *   "state": "Maharashtra",
 *   "zipCode": "400001",
 *   "gst": "27AABCT1234G1Z5",
 *   "pan": "AAAPN5055K",
 *   "bankDetails": {
 *     "accountNumber": "123456789",
 *     "bankName": "HDFC Bank"
 *   },
 *   "paymentTerms": "Net 30"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Supplier created successfully",
 *   "data": { supplier object }
 * }
 */

/**
 * 9. GET ALL SUPPLIERS
 * GET /api/inventory/suppliers?restaurantId=uuid
 * 
 * Response:
 * {
 *   "success": true,
 *   "count": 5,
 *   "data": [{ supplier1 }, { supplier2 }, ...]
 * }
 */

/**
 * 10. UPDATE SUPPLIER
 * PUT /api/inventory/suppliers/:supplierId
 * 
 * Request Body:
 * {
 *   "email": "newemail@freshfarms.com",
 *   "phone": "9876543211"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Supplier updated successfully",
 *   "data": { updated supplier object }
 * }
 */

// ==================== WASTAGE ENDPOINTS ====================

/**
 * 11. REPORT WASTAGE
 * POST /api/inventory/wastage
 * 
 * Request Body:
 * {
 *   "restaurantId": "uuid",
 *   "branchId": "uuid",
 *   "itemId": "uuid",
 *   "quantity": 5,
 *   "reason": "expiry",
 *   "notes": "Expired on 2024-01-15"
 * }
 * 
 * Common Reasons:
 * - expiry: Item expired
 * - damage: Item damaged
 * - spoilage: Item spoiled
 * - theft: Item lost/stolen
 * - other: Other reason
 * 
 * Note: Requires user authentication
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Wastage reported successfully",
 *   "data": { wastage object with status: "reported" }
 * }
 */

/**
 * 12. APPROVE WASTAGE
 * PUT /api/inventory/wastage/:wastageId/approve
 * 
 * Note: This endpoint auto-deducts stock from inventory
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Wastage approved and stock deducted",
 *   "data": { wastage object with status: "approved" }
 * }
 */

/**
 * 13. GET WASTAGE REPORTS
 * GET /api/inventory/wastage?restaurantId=uuid&branchId=uuid&status=approved
 * 
 * Query Parameters:
 * - restaurantId (required)
 * - branchId (required)
 * - status (optional): reported, approved, rejected
 * 
 * Response:
 * {
 *   "success": true,
 *   "count": 3,
 *   "data": [{ wastage1 }, { wastage2 }, ...]
 * }
 */

// ==================== REPORT ENDPOINTS ====================

/**
 * 14. GET STOCK TRANSACTIONS
 * GET /api/inventory/reports/transactions?restaurantId=uuid&branchId=uuid&itemId=uuid
 * 
 * Query Parameters:
 * - restaurantId (required)
 * - branchId (required)
 * - itemId (optional)
 * 
 * Response:
 * {
 *   "success": true,
 *   "count": 10,
 *   "data": [
 *     {
 *       "id": "uuid",
 *       "itemId": "uuid",
 *       "transactionType": "sale",
 *       "quantity": 5,
 *       "previousStock": 25,
 *       "newStock": 20,
 *       "reference": "ORD-12345",
 *       "createdAt": "2024-01-15T10:30:00Z"
 *     },
 *     ...
 *   ]
 * }
 */

/**
 * 15. GET INVENTORY VALUATION
 * GET /api/inventory/reports/valuation?restaurantId=uuid&branchId=uuid
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "restaurantId": "uuid",
 *     "branchId": "uuid",
 *     "totalValue": 25000.50,
 *     "totalItems": 150,
 *     "totalQuantity": 500
 *   }
 * }
 */

/**
 * 16. GET CONSUMPTION REPORT
 * GET /api/inventory/reports/consumption?restaurantId=uuid&branchId=uuid&startDate=2024-01-01&endDate=2024-01-31
 * 
 * Response:
 * {
 *   "success": true,
 *   "count": 5,
 *   "data": [
 *     {
 *       "itemId": "uuid",
 *       "itemName": "Tomato",
 *       "totalConsumed": 100,
 *       "totalPurchased": 150,
 *       "transactionCount": 25
 *     },
 *     ...
 *   ]
 * }
 */

/**
 * 17. GET VARIANCE REPORT
 * GET /api/inventory/reports/variance?restaurantId=uuid&branchId=uuid
 * 
 * (Feature coming soon)
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Variance report feature coming soon",
 *   "data": []
 * }
 */

// ==================== ERROR RESPONSES ====================

/**
 * Error Response Format:
 * {
 *   "success": false,
 *   "error": "Error message describing what went wrong"
 * }
 * 
 * Common HTTP Status Codes:
 * - 200: Success
 * - 201: Created successfully
 * - 400: Bad request (validation error)
 * - 401: Unauthorized
 * - 404: Not found
 * - 500: Server error
 */

// ==================== USAGE EXAMPLES ====================

/**
 * Example 1: Create an item
 * 
 * POST http://localhost:5000/api/inventory/items
 * Content-Type: application/json
 * 
 * {
 *   "restaurantId": "550e8400-e29b-41d4-a716-446655440000",
 *   "branchId": "550e8400-e29b-41d4-a716-446655440001",
 *   "name": "Onion",
 *   "sku": "ONI-001",
 *   "category": "vegetables",
 *   "unit": "kg",
 *   "purchasePrice": 40,
 *   "sellingPrice": 60,
 *   "tax": 5,
 *   "reorderLevel": 20,
 *   "currentStock": 50
 * }
 */

/**
 * Example 2: Deduct stock after sale
 * 
 * POST http://localhost:5000/api/inventory/items/550e8400-e29b-41d4-a716-446655440002/deduct
 * Content-Type: application/json
 * 
 * {
 *   "quantity": 5,
 *   "reference": "ORDER-20240115-001",
 *   "userId": "550e8400-e29b-41d4-a716-446655440003"
 * }
 */

/**
 * Example 3: Report wastage
 * 
 * POST http://localhost:5000/api/inventory/wastage
 * Content-Type: application/json
 * Authorization: Bearer your_jwt_token
 * 
 * {
 *   "restaurantId": "550e8400-e29b-41d4-a716-446655440000",
 *   "branchId": "550e8400-e29b-41d4-a716-446655440001",
 *   "itemId": "550e8400-e29b-41d4-a716-446655440002",
 *   "quantity": 10,
 *   "reason": "expiry",
 *   "notes": "Expired batch from supplier ABC"
 * }
 */

module.exports = {
  // This file is for documentation only
};
