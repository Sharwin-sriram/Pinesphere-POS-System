// Main Server Entry Point
// Pinesphere POS System - Node.js Backend

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

// Import services
const InventoryService = require('./services/inventory/inventoryService');
const PurchaseOrderService = require('./services/inventory/purchaseOrderService');
const GRNService = require('./services/inventory/grnService');

// Import routes
const inventoryRoutes = require('./routes/inventory');

const app = express();
const PORT = process.env.PORT || 5000;

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(morgan('combined'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== DATABASE CONNECTION ====================
const { testConnection, closePool } = require('./config/database');

// ==================== INITIALIZE SERVICES ====================
// Services now use the database connection pool from config/database.js
const inventoryService = new InventoryService();
const purchaseOrderService = new PurchaseOrderService();
const grnService = new GRNService();

// ==================== API ROUTES ====================

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Inventory module routes
app.use('/api/inventory', inventoryRoutes(inventoryService));

// Auth routes (placeholder)
// app.use('/api/auth', authRoutes);

// POS routes (placeholder)
// app.use('/api/pos', posRoutes);

// ==================== ERROR HANDLING ====================
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// ==================== SERVER STARTUP ====================
const server = app.listen(PORT, async () => {
  console.log(`
    ╔════════════════════════════════════════╗
    ║    Pinesphere POS System Backend      ║
    ║    Server running on port ${PORT}        ║
    ║    Environment: ${process.env.NODE_ENV || 'development'}        ║
    ╚════════════════════════════════════════╝
  `);

  // Test database connection
  try {
    const dbConnected = await testConnection();
    if (dbConnected) {
      console.log('✅ All systems ready - Module 7 Inventory is operational');
    } else {
      console.warn('⚠️  Database connection test failed - some features may not work');
    }
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n📌 Received SIGTERM - shutting down gracefully...');
  server.close(async () => {
    await closePool();
    console.log('✅ Server shut down');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('\n📌 Received SIGINT - shutting down gracefully...');
  server.close(async () => {
    await closePool();
    console.log('✅ Server shut down');
    process.exit(0);
  });
});

module.exports = app;
