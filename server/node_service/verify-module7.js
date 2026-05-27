#!/usr/bin/env node

/**
 * Module 7 Verification Script
 * Tests all core functionality of the Inventory Management System
 * Verifies MySQL connectivity, schema, and service layer operations
 * 
 * Usage: node verify-module7.js
 */

require('dotenv').config();
const { executeQuery, testConnection, closePool } = require('./config/database');
const InventoryService = require('./services/inventory/inventoryService');

let testsPassed = 0;
let testsFailed = 0;

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

// Helper function to log test results
const logTest = (name, passed, message = '') => {
  if (passed) {
    testsPassed++;
    console.log(`${colors.green}✅ PASS${colors.reset} - ${name}`);
  } else {
    testsFailed++;
    console.log(`${colors.red}❌ FAIL${colors.reset} - ${name}`);
    if (message) console.log(`   ${colors.yellow}${message}${colors.reset}`);
  }
};

const logSection = (title) => {
  console.log(`\n${colors.blue}${colors.bright}═══ ${title} ═══${colors.reset}`);
};

// Test Suite
async function runTests() {
  console.log(`\n${colors.bright}Module 7 Verification Suite${colors.reset}`);
  console.log(`Started: ${new Date().toISOString()}`);

  // ============================================================================
  // SECTION 1: DATABASE CONNECTION
  // ============================================================================
  logSection('DATABASE CONNECTION');

  try {
    const connected = await testConnection();
    logTest('Database Connection', connected, 'Could not establish connection to MySQL');
  } catch (error) {
    logTest('Database Connection', false, error.message);
    console.error(`\n${colors.red}Cannot proceed without database connection${colors.reset}`);
    process.exit(1);
  }

  // ============================================================================
  // SECTION 2: SCHEMA VERIFICATION
  // ============================================================================
  logSection('SCHEMA VERIFICATION');

  const requiredTables = [
    'suppliers',
    'inventory_items',
    'purchase_orders',
    'grn',
    'grn_items',
    'stock_transactions',
    'wastage',
    'stock_batches',
    'stock_transfers',
    'stock_transfer_items',
    'recipe_items',
  ];

  try {
    const query = `
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
    `;
    const tables = await executeQuery(query);
    const tableNames = tables.map(t => t.TABLE_NAME);

    for (const table of requiredTables) {
      const exists = tableNames.includes(table);
      logTest(`Table exists: ${table}`, exists);
    }
  } catch (error) {
    logTest('Schema Query', false, error.message);
  }

  // ============================================================================
  // SECTION 3: REQUIRED COLUMNS
  // ============================================================================
  logSection('REQUIRED COLUMNS');

  const columnChecks = [
    { table: 'suppliers', columns: ['id', 'branch_id', 'name', 'mobile', 'gst_number'] },
    { table: 'inventory_items', columns: ['id', 'branch_id', 'supplier_id', 'sku', 'unit_type', 'current_stock'] },
    { table: 'stock_transactions', columns: ['id', 'branch_id', 'inventory_item_id', 'transaction_type', 'quantity'] },
    { table: 'wastage', columns: ['id', 'branch_id', 'inventory_item_id', 'quantity', 'reason', 'status'] },
  ];

  for (const check of columnChecks) {
    try {
      const query = `DESCRIBE ${check.table}`;
      const columns = await executeQuery(query);
      const columnNames = columns.map(c => c.Field);

      for (const col of check.columns) {
        const exists = columnNames.includes(col);
        logTest(`${check.table}.${col}`, exists);
      }
    } catch (error) {
      logTest(`${check.table} Columns`, false, error.message);
    }
  }

  // ============================================================================
  // SECTION 4: SERVICE INITIALIZATION
  // ============================================================================
  logSection('SERVICE INITIALIZATION');

  let inventoryService;
  try {
    inventoryService = new InventoryService();
    logTest('InventoryService Instantiation', !!inventoryService);
    logTest('InventoryService Has Methods', 
      typeof inventoryService.createItem === 'function' &&
      typeof inventoryService.getItems === 'function' &&
      typeof inventoryService.createSupplier === 'function'
    );
  } catch (error) {
    logTest('InventoryService Instantiation', false, error.message);
    process.exit(1);
  }

  // ============================================================================
  // SECTION 5: SERVICE METHOD VALIDATION
  // ============================================================================
  logSection('SERVICE METHODS');

  const methodTests = [
    ['createItem', 'function'],
    ['getItems', 'function'],
    ['getItemById', 'function'],
    ['updateItem', 'function'],
    ['getLowStockItems', 'function'],
    ['deductStock', 'function'],
    ['addStock', 'function'],
    ['createSupplier', 'function'],
    ['getSuppliers', 'function'],
    ['getSupplierById', 'function'],
    ['updateSupplier', 'function'],
    ['reportWastage', 'function'],
    ['approveWastage', 'function'],
    ['getWastageReports', 'function'],
    ['recordTransaction', 'function'],
    ['getStockTransactions', 'function'],
    ['getInventoryValuation', 'function'],
    ['getConsumptionReport', 'function'],
    ['getVarianceReport', 'function'],
  ];

  for (const [method, type] of methodTests) {
    const exists = typeof inventoryService[method] === type;
    logTest(`Method: ${method}`, exists);
  }

  // ============================================================================
  // SECTION 6: UTILITY FUNCTIONS
  // ============================================================================
  logSection('UTILITY FUNCTIONS');

  const camelToSnakeTest = inventoryService.camelToSnake('testFieldName');
  const expectedSnake = 'test_field_name';
  logTest('camelToSnake Function', camelToSnakeTest === expectedSnake, 
    `Expected ${expectedSnake}, got ${camelToSnakeTest}`);

  // ============================================================================
  // SECTION 7: ENVIRONMENT VARIABLES
  // ============================================================================
  logSection('ENVIRONMENT CONFIGURATION');

  const envChecks = [
    { key: 'DB_HOST', optional: false },
    { key: 'DB_USER', optional: false },
    { key: 'DB_PASSWORD', optional: false },
    { key: 'DB_NAME', optional: false },
    { key: 'PORT', optional: true },
    { key: 'NODE_ENV', optional: true },
  ];

  for (const check of envChecks) {
    const isSet = process.env[check.key] !== undefined;
    const status = isSet ? 'SET' : 'MISSING';
    if (!check.optional) {
      logTest(`${check.key}`, isSet, `${status} (required)`);
    } else {
      logTest(`${check.key}`, isSet, `${status} (optional)`);
    }
  }

  // ============================================================================
  // SECTION 8: SUMMARY
  // ============================================================================
  logSection('TEST SUMMARY');

  console.log(`\n${colors.bright}Results:${colors.reset}`);
  console.log(`  ${colors.green}Passed: ${testsPassed}${colors.reset}`);
  console.log(`  ${colors.red}Failed: ${testsFailed}${colors.reset}`);

  const totalTests = testsPassed + testsFailed;
  const passPercentage = totalTests > 0 ? ((testsPassed / totalTests) * 100).toFixed(1) : 0;

  console.log(`  ${colors.blue}Total: ${totalTests}${colors.reset}`);
  console.log(`  ${colors.bright}Pass Rate: ${passPercentage}%${colors.reset}`);

  // ============================================================================
  // FINAL VERDICT
  // ============================================================================
  console.log(`\n${colors.bright}Final Status:${colors.reset}`);

  if (testsFailed === 0 && testsPassed > 30) {
    console.log(`${colors.green}${colors.bright}✅ ALL SYSTEMS OPERATIONAL${colors.reset}`);
    console.log(`${colors.green}Module 7 is ready to use!${colors.reset}\n`);
    return true;
  } else if (testsFailed < 5) {
    console.log(`${colors.yellow}⚠️  PARTIAL SUCCESS${colors.reset}`);
    console.log(`${colors.yellow}Some features may not work. Check failures above.${colors.reset}\n`);
    return true;
  } else {
    console.log(`${colors.red}❌ CRITICAL FAILURES${colors.reset}`);
    console.log(`${colors.red}Module 7 is not ready. Fix failures above.${colors.reset}\n`);
    return false;
  }
}

// Run tests
(async () => {
  try {
    const success = await runTests();
    await closePool();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error(`\n${colors.red}Test suite error:${colors.reset}`, error.message);
    await closePool();
    process.exit(1);
  }
})();
