const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const isProduction = process.env.NODE_ENV === 'production';

let pool = null;
let useMockMemoryDb = false;

// Memory Store Fallback for zero-dependency local testing/demo if Postgres is unreachable
let memoryStore = {
  categories: [
    { id: 1, name: 'Food', type: 'expense' },
    { id: 2, name: 'Transport', type: 'expense' },
    { id: 3, name: 'Shopping', type: 'expense' },
    { id: 4, name: 'Bills', type: 'expense' },
    { id: 5, name: 'Education', type: 'expense' },
    { id: 6, name: 'Health', type: 'expense' },
    { id: 7, name: 'Entertainment', type: 'expense' },
    { id: 8, name: 'Rent', type: 'expense' },
    { id: 9, name: 'Utilities', type: 'expense' },
    { id: 10, name: 'Other', type: 'expense' },
    { id: 11, name: 'Salary', type: 'income' },
    { id: 12, name: 'Freelance', type: 'income' },
    { id: 13, name: 'Business', type: 'income' },
    { id: 14, name: 'Investment', type: 'income' },
    { id: 15, name: 'Other Income', type: 'income' }
  ],
  transactions: [
    { id: 1, date: '2026-09-01', description: 'Software Engineer Salary', amount: 150000.00, type: 'income', category_id: 11, currency: 'PKR', created_at: new Date() },
    { id: 2, date: '2026-09-02', description: 'Monthly Apartment Rent', amount: 45000.00, type: 'expense', category_id: 8, currency: 'PKR', created_at: new Date() },
    { id: 3, date: '2026-09-03', description: 'Grocery Supermarket', amount: 18500.00, type: 'expense', category_id: 1, currency: 'PKR', created_at: new Date() },
    { id: 4, date: '2026-09-04', description: 'Fuel & Car Refill', amount: 8500.00, type: 'expense', category_id: 2, currency: 'PKR', created_at: new Date() },
    { id: 5, date: '2026-09-05', description: 'Freelance Project Income', amount: 450.00, type: 'income', category_id: 12, currency: 'USD', created_at: new Date() }
  ],
  budgets: [
    { id: 1, category_id: 8, month: 9, year: 2026, amount: 450000.00, currency: 'PKR' },
    { id: 2, category_id: 3, month: 9, year: 2026, amount: 250000.00, currency: 'PKR' },
    { id: 3, category_id: 5, month: 9, year: 2026, amount: 200000.00, currency: 'PKR' },
    { id: 4, category_id: 1, month: 9, year: 2026, amount: 200000.00, currency: 'PKR' },
    { id: 5, category_id: 2, month: 9, year: 2026, amount: 80000.00, currency: 'PKR' },
    { id: 6, category_id: 4, month: 9, year: 2026, amount: 70000.00, currency: 'PKR' },
    { id: 7, category_id: 8, month: 9, year: 2026, amount: 1500.00, currency: 'USD' },
    { id: 8, category_id: 1, month: 9, year: 2026, amount: 750.00, currency: 'USD' },
    { id: 9, category_id: 3, month: 9, year: 2026, amount: 450.00, currency: 'USD' },
    { id: 10, category_id: 2, month: 9, year: 2026, amount: 350.00, currency: 'USD' },
    { id: 11, category_id: 4, month: 9, year: 2026, amount: 350.00, currency: 'USD' },
    { id: 12, category_id: 5, month: 9, year: 2026, amount: 300.00, currency: 'USD' }
  ],
  nextTxId: 6,
  nextBudgetId: 13,
  nextCatId: 16
};

// Initialize PostgreSQL Pool
try {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL || `postgres://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || '1234'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'expensemate_db'}`,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
  });
} catch (e) {
  useMockMemoryDb = true;
}

const query = async (text, params = []) => {
  if (!useMockMemoryDb && pool) {
    try {
      const start = Date.now();
      const res = await pool.query(text, params);
      return res;
    } catch (err) {
      useMockMemoryDb = true;
      return executeMockQuery(text, params);
    }
  }

  // Fallback Mock Query Execution
  return executeMockQuery(text, params);
};

function executeMockQuery(sql, params) {
  const normalizedSql = sql.trim().toUpperCase();

  // SELECT Categories
  if (normalizedSql.includes('FROM CATEGORIES')) {
    let rows = [...memoryStore.categories];
    if (params[0]) {
      const p = params[0].toString().toLowerCase();
      if (normalizedSql.includes('LOWER(NAME)') || normalizedSql.includes('NAME =')) {
        rows = rows.filter(c => c.name.toLowerCase() === p);
      } else if (p === 'income' || p === 'expense') {
        rows = rows.filter(c => c.type === p);
      }
    }
    return { rows, rowCount: rows.length };
  }

  // INSERT Category
  if (normalizedSql.includes('INSERT INTO CATEGORIES')) {
    const existing = memoryStore.categories.find(c => c.name.toLowerCase() === params[0].toLowerCase());
    if (existing) {
      return { rows: [existing], rowCount: 1 };
    }
    const newCat = {
      id: memoryStore.nextCatId++,
      name: params[0],
      type: params[1] || 'expense'
    };
    memoryStore.categories.push(newCat);
    return { rows: [newCat], rowCount: 1 };
  }

  // SELECT Transactions
  if (normalizedSql.includes('FROM TRANSACTIONS')) {
    let rows = memoryStore.transactions.map(t => {
      const cat = memoryStore.categories.find(c => c.id === t.category_id);
      return {
        ...t,
        category_name: cat ? cat.name : 'Other',
        category_type: cat ? cat.type : t.type
      };
    });

    // Filtering
    if (params[0] && normalizedSql.includes('ILIKE')) {
      const searchTerm = params[0].replace(/%/g, '').toLowerCase();
      rows = rows.filter(t => t.description.toLowerCase().includes(searchTerm));
    }

    rows.sort((a, b) => new Date(b.date) - new Date(a.date));
    return { rows, rowCount: rows.length };
  }

  // INSERT Transaction
  if (normalizedSql.includes('INSERT INTO TRANSACTIONS')) {
    const newTx = {
      id: memoryStore.nextTxId++,
      date: params[0],
      description: params[1],
      amount: parseFloat(params[2]),
      type: params[3],
      category_id: parseInt(params[4]),
      currency: params[5] || 'PKR',
      created_at: new Date()
    };
    memoryStore.transactions.push(newTx);
    return { rows: [newTx], rowCount: 1 };
  }

  // UPDATE Transaction
  if (normalizedSql.includes('UPDATE TRANSACTIONS')) {
    const id = parseInt(params[params.length - 1]);
    const idx = memoryStore.transactions.findIndex(t => t.id === id);
    if (idx !== -1) {
      memoryStore.transactions[idx] = {
        ...memoryStore.transactions[idx],
        date: params[0],
        description: params[1],
        amount: parseFloat(params[2]),
        type: params[3],
        category_id: parseInt(params[4]),
        currency: params[5]
      };
      return { rows: [memoryStore.transactions[idx]], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // DELETE Transaction
  if (normalizedSql.includes('DELETE FROM TRANSACTIONS')) {
    const id = parseInt(params[0]);
    const beforeCount = memoryStore.transactions.length;
    memoryStore.transactions = memoryStore.transactions.filter(t => t.id !== id);
    return { rowCount: beforeCount - memoryStore.transactions.length };
  }

  // SELECT Budgets
  if (normalizedSql.includes('FROM BUDGETS')) {
    let rows = memoryStore.budgets.map(b => {
      const cat = memoryStore.categories.find(c => c.id === b.category_id);
      return {
        ...b,
        category_name: cat ? cat.name : 'Other'
      };
    });
    return { rows, rowCount: rows.length };
  }

  // INSERT / UPDATE Budget
  if (normalizedSql.includes('INSERT INTO BUDGETS')) {
    const newB = {
      id: memoryStore.nextBudgetId++,
      category_id: parseInt(params[0]),
      month: parseInt(params[1]),
      year: parseInt(params[2]),
      amount: parseFloat(params[3]),
      currency: params[4] || 'PKR'
    };
    memoryStore.budgets.push(newB);
    return { rows: [newB], rowCount: 1 };
  }

  if (normalizedSql.includes('DELETE FROM BUDGETS')) {
    const id = parseInt(params[0]);
    memoryStore.budgets = memoryStore.budgets.filter(b => b.id !== id);
    return { rowCount: 1 };
  }

  return { rows: [], rowCount: 0 };
}

const initDb = async () => {
  if (!useMockMemoryDb && pool) {
    try {
      await pool.query('SELECT 1');

      const schemaSqlPath = fs.existsSync(path.join(__dirname, '../../db/schema.sql'))
        ? path.join(__dirname, '../../db/schema.sql')
        : path.join(__dirname, '../db/schema.sql');
      const seedSqlPath = fs.existsSync(path.join(__dirname, '../../db/seed.sql'))
        ? path.join(__dirname, '../../db/seed.sql')
        : path.join(__dirname, '../db/seed.sql');

      if (fs.existsSync(schemaSqlPath)) {
        const schemaSql = fs.readFileSync(schemaSqlPath, 'utf-8');
        await pool.query(schemaSql);
      }
      if (fs.existsSync(seedSqlPath)) {
        const countRes = await pool.query('SELECT COUNT(*) FROM categories');
        if (parseInt(countRes.rows[0].count) === 0) {
          const seedSql = fs.readFileSync(seedSqlPath, 'utf-8');
          await pool.query(seedSql);
        }
      }
      console.log('PostgreSQL Connected & Database Ready.');
    } catch (e) {
      console.log('PostgreSQL not accessible. Running on Memory Fallback mode.');
      useMockMemoryDb = true;
    }
  }
};

module.exports = {
  query,
  initDb,
  getMemoryStore: () => memoryStore
};
