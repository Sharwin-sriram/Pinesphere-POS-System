/**
 * Database Connection Pool Configuration
 * Manages MySQL/MariaDB connections for Inventory Management Module
 * 
 * Aligned with Django Models structure:
 * - Schema: inventory_schema (references shared_schema for branches/users)
 * - Tables use snake_case naming convention (Django standard)
 * - Connection pool: 10 connections (configurable via .env)
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// MySQL/MariaDB Connection Pool Configuration
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'pinesphere_pos',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_POOL_LIMIT) || 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  collation: 'utf8mb4_unicode_ci',
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0,
  decimalNumbers: true, // For decimal precision in inventory calculations
  dateStrings: true,    // Return dates as strings for consistent handling
  supportBigNumbers: true,
  bigNumberStrings: true,
  timeout: 40000,
});

/**
 * Get a database connection from the pool
 * @returns {Promise<Connection>} Database connection
 */
const getConnection = async () => {
  try {
    const connection = await pool.getConnection();
    return connection;
  } catch (error) {
    console.error('❌ Database Connection Error:', error.message);
    throw new Error(`Database connection failed: ${error.message}`);
  }
};

/**
 * Test database connection
 * Verifies connectivity to MySQL database on startup
 */
const testConnection = async () => {
  let connection;
  try {
    connection = await getConnection();
    await connection.ping();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    return false;
  } finally {
    if (connection) await connection.release();
  }
};

/**
 * Execute a query with parameters
 * Prevents SQL injection using parameterized queries
 * @param {string} query - SQL query with ? placeholders
 * @param {array} params - Query parameters
 * @returns {Promise<array>} Query results
 */
const executeQuery = async (query, params = []) => {
  let connection;
  try {
    connection = await getConnection();
    const [results] = await connection.execute(query, params);
    return results;
  } catch (error) {
    console.error('❌ Query Execution Error:', error.message);
    console.error('Query:', query);
    console.error('Params:', params);
    throw error;
  } finally {
    if (connection) await connection.release();
  }
};

/**
 * Execute multiple queries in a transaction
 * @param {array} queries - Array of {query, params} objects
 * @returns {Promise<array>} Results of all queries
 */
const executeTransaction = async (queries) => {
  let connection;
  try {
    connection = await getConnection();
    await connection.beginTransaction();
    
    const results = [];
    for (const {query, params = []} of queries) {
      const [result] = await connection.execute(query, params);
      results.push(result);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('❌ Transaction Error:', error.message);
    throw error;
  } finally {
    if (connection) await connection.release();
  }
};

/**
 * Close database pool
 * Should be called on application shutdown
 */
const closePool = async () => {
  try {
    await pool.end();
    console.log('✅ Database pool closed');
  } catch (error) {
    console.error('❌ Error closing database pool:', error.message);
  }
};

// Test connection on startup
pool.on('connection', () => {
  console.log('✅ Database connection pool initialized');
});

pool.on('error', (err) => {
  console.error('❌ Database pool error:', err.message);
});

module.exports = {
  pool,
  getConnection,
  testConnection,
  executeQuery,
  executeTransaction,
  closePool,
  
  // Table names mapping for reference
  tables: {
    suppliers: 'suppliers',
    inventoryItems: 'inventory_items',
    purchaseOrders: 'purchase_orders',
    purchaseOrderItems: 'purchase_order_items',
    grn: 'grn',
    grnItems: 'grn_items',
    stockTransactions: 'stock_transactions',
    wastage: 'wastage',
    stockBatches: 'stock_batches',
    stockTransfers: 'stock_transfers',
    stockTransferItems: 'stock_transfer_items',
    recipeItems: 'recipe_items',
  },
  
  // Views for reporting
  views: {
    lowStockItems: 'low_stock_items',
    expiringStock: 'expiring_stock',
    inventoryValuation: 'inventory_valuation',
  },
};
