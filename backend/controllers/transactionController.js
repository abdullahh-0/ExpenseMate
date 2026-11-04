const db = require('../db/connection');
const { suggestCategory } = require('../utils/categorizer');
const { validateTransactionInput } = require('../utils/validators');

// GET /api/transactions
const getTransactions = async (req, res) => {
  try {
    const { search, type, category_id, currency, sort_by } = req.query;

    let sql = `
      SELECT t.*, c.name as category_name, c.type as category_type
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (search && search.trim()) {
      sql += ` AND LOWER(t.description) LIKE $${paramIndex++}`;
      params.push(`%${search.trim().toLowerCase()}%`);
    }

    if (type && (type === 'income' || type === 'expense')) {
      sql += ` AND t.type = $${paramIndex++}`;
      params.push(type);
    }

    if (category_id) {
      sql += ` AND t.category_id = $${paramIndex++}`;
      params.push(parseInt(category_id));
    }

    if (currency) {
      sql += ` AND t.currency = $${paramIndex++}`;
      params.push(currency.toUpperCase());
    }

    const startDate = req.query.startDate || req.query.start_date;
    if (startDate) {
      sql += ` AND t.date >= $${paramIndex++}`;
      params.push(startDate);
    }

    const endDate = req.query.endDate || req.query.end_date;
    if (endDate) {
      sql += ` AND t.date <= $${paramIndex++}`;
      params.push(endDate);
    }

    const sortColumn = sort_by === 'amount' ? 't.amount' : 't.date';
    sql += ` ORDER BY ${sortColumn} DESC, t.id DESC`;

    const result = await db.query(sql, params);
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch transactions.' });
  }
};

// POST /api/transactions
const createTransaction = async (req, res) => {
  try {
    const { date, description, amount, type, category_id, category_name, currency } = req.body;

    const validation = validateTransactionInput({ date, description, amount, type });
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.errors.join(' ') });
    }

    let finalCategoryId = category_id;
    let finalCategoryName = category_name;

    // Auto-Categorization fallback if category not selected explicitly
    if (!finalCategoryId) {
      const suggestedName = suggestCategory(description);
      finalCategoryName = suggestedName;
      
      const catRes = await db.query('SELECT id FROM categories WHERE name = $1', [suggestedName]);
      if (catRes.rows.length > 0) {
        finalCategoryId = catRes.rows[0].id;
      } else {
        const newCat = await db.query('INSERT INTO categories (name, type) VALUES ($1, $2) RETURNING id', [suggestedName, type || 'expense']);
        finalCategoryId = newCat.rows[0].id;
      }
    }

    const insertSql = `
      INSERT INTO transactions (date, description, amount, type, category_id, currency)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const params = [date, description.trim(), parseFloat(amount), type, finalCategoryId, currency || 'PKR'];

    const result = await db.query(insertSql, params);
    return res.status(201).json({
      success: true,
      message: 'Transaction saved successfully.',
      data: result.rows[0]
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to save transaction.' });
  }
};

// PUT /api/transactions/:id
const updateTransaction = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { date, description, amount, type, category_id, currency } = req.body;

    const validation = validateTransactionInput({ date, description, amount, type });
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.errors.join(' ') });
    }

    const updateSql = `
      UPDATE transactions
      SET date = $1, description = $2, amount = $3, type = $4, category_id = $5, currency = $6
      WHERE id = $7
      RETURNING *
    `;
    const params = [date, description.trim(), parseFloat(amount), type, parseInt(category_id), currency || 'PKR', id];

    const result = await db.query(updateSql, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaction record not found.' });
    }

    return res.json({
      success: true,
      message: 'Transaction updated successfully.',
      data: result.rows[0]
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to update transaction.' });
  }
};

// DELETE /api/transactions/:id
const deleteTransaction = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await db.query('DELETE FROM transactions WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Transaction record not found.' });
    }

    return res.json({ success: true, message: 'Transaction deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to delete transaction.' });
  }
};

// POST /api/transactions/suggest-category
const autoCategorize = async (req, res) => {
  const { description } = req.body;
  const suggestedCategory = suggestCategory(description);
  
  // Find category ID if exists
  const catRes = await db.query('SELECT id, name, type FROM categories WHERE LOWER(name) = $1', [suggestedCategory.toLowerCase()]);
  const categoryObj = catRes.rows[0] || { id: null, name: suggestedCategory, type: 'expense' };

  return res.json({
    success: true,
    suggestedCategory: categoryObj.name,
    category: categoryObj
  });
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  autoCategorize
};
