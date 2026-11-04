const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initDb } = require('./db/connection');

const transactionRoutes = require('./routes/transactions');
const budgetRoutes = require('./routes/budgets');
const categoryRoutes = require('./routes/categories');
const dashboardRoutes = require('./routes/dashboard');
const importExportRoutes = require('./routes/importExport');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Register REST API Routes
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', importExportRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ExpenseMate Express API Server Running' });
});

// Serve React Build Assets if built
const clientBuildPath = path.join(__dirname, '../frontend/dist');
if (require('fs').existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

if (require.main === module) {
  initDb().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`=======================================================`);
      console.log(`  EXPENSEMATE EXPRESS SERVER RUNNING ON PORT ${PORT}`);
      console.log(`  API Endpoint: http://localhost:${PORT}/api/health`);
      console.log(`=======================================================`);
    });
  });
} else {
  initDb();
}

module.exports = app;
