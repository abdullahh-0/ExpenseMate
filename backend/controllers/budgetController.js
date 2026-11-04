const db = require('../db/connection');

// Helper to evaluate simple budget threshold
function calculateBudgetStatus(budgetAmount, actualSpent) {
  const budget = parseFloat(budgetAmount) || 0;
  const spent = parseFloat(actualSpent) || 0;
  const remaining = budget - spent;
  const percentage = budget > 0 ? Math.round((spent / budget) * 100) : 0;

  let status = 'normal';
  let statusLabel = 'Normal';
  let level = 'success';

  if (percentage >= 100) {
    status = 'exceeded';
    statusLabel = 'Exceeded Limit';
    level = 'danger';
  } else if (percentage >= 90) {
    status = 'critical';
    statusLabel = 'Critical Limit';
    level = 'warning';
  } else if (percentage >= 80) {
    status = 'warning';
    statusLabel = 'Warning';
    level = 'info';
  }

  return {
    budgetAmount: budget,
    amount_limit: budget,
    amount: budget,
    spent,
    actual_spent: spent,
    remaining,
    remaining_budget: remaining,
    percentage,
    percentage_used: percentage,
    status: status.toUpperCase(),
    warning_status: status.toUpperCase(),
    statusLabel,
    level
  };
}

// GET /api/budgets
const getBudgets = async (req, res) => {
  try {
    const isOverall = req.query.month === 'overall' || req.query.month === '0' || req.query.month === 'all';
    const month = isOverall ? 0 : (parseInt(req.query.month) || 9);
    const year = parseInt(req.query.year) || 2026;
    const currency = req.query.currency || 'PKR';

    let budgetRes, txRes;

    if (isOverall) {
      budgetRes = await db.query(
        `SELECT b.category_id as id, b.category_id, c.name as category_name, SUM(b.amount) as amount, b.currency
         FROM budgets b
         JOIN categories c ON b.category_id = c.id
         WHERE b.year = $1 AND b.currency = $2
         GROUP BY b.category_id, c.name, b.currency
         ORDER BY amount DESC`,
        [year, currency]
      );

      txRes = await db.query(
        `SELECT category_id, SUM(amount) as total_spent
         FROM transactions
         WHERE type = 'expense' AND currency = $1
           AND EXTRACT(YEAR FROM date) = $2
         GROUP BY category_id`,
        [currency, year]
      );
    } else {
      budgetRes = await db.query(
        `SELECT b.*, c.name as category_name
         FROM budgets b
         JOIN categories c ON b.category_id = c.id
         WHERE b.month = $1 AND b.year = $2 AND b.currency = $3
         ORDER BY b.amount DESC`,
        [month, year, currency]
      );

      txRes = await db.query(
        `SELECT category_id, SUM(amount) as total_spent
         FROM transactions
         WHERE type = 'expense' AND currency = $1
           AND EXTRACT(MONTH FROM date) = $2
           AND EXTRACT(YEAR FROM date) = $3
         GROUP BY category_id`,
        [currency, month, year]
      );
    }

    const spentMap = {};
    txRes.rows.forEach(r => {
      spentMap[r.category_id] = parseFloat(r.total_spent);
    });

    const budgetsWithUsage = budgetRes.rows.map(b => {
      const spent = spentMap[b.category_id] || 0;
      const statusInfo = calculateBudgetStatus(b.amount, spent);
      return {
        ...b,
        ...statusInfo
      };
    });

    return res.json({
      success: true,
      data: budgetsWithUsage
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch budget status.' });
  }
};

// POST /api/budgets
const createOrUpdateBudget = async (req, res) => {
  try {
    const { category_id, month, year, amount, currency } = req.body;
    const rawAmt = amount !== undefined ? amount : req.body.amount_limit;

    if (!category_id || !rawAmt || parseFloat(rawAmt) <= 0) {
      return res.status(400).json({ success: false, message: 'Category and a positive budget amount are required.' });
    }

    const m = parseInt(month) || 9;
    const y = parseInt(year) || 2026;
    const curr = currency || 'PKR';
    const amt = parseFloat(rawAmt);

    // Upsert budget limit
    const existing = await db.query(
      'SELECT id FROM budgets WHERE category_id = $1 AND month = $2 AND year = $3 AND currency = $4',
      [category_id, m, y, curr]
    );

    let result;
    if (existing.rows.length > 0) {
      result = await db.query(
        'UPDATE budgets SET amount = $1 WHERE id = $2 RETURNING *',
        [amt, existing.rows[0].id]
      );
    } else {
      result = await db.query(
        'INSERT INTO budgets (category_id, month, year, amount, currency) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [category_id, m, y, amt, curr]
      );
    }

    return res.status(201).json({
      success: true,
      message: 'Budget ceiling set successfully.',
      data: result.rows[0]
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to set budget.' });
  }
};

// DELETE /api/budgets/:id
const deleteBudget = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.query('DELETE FROM budgets WHERE id = $1', [id]);
    return res.json({ success: true, message: 'Budget cap deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to delete budget.' });
  }
};

module.exports = {
  getBudgets,
  createOrUpdateBudget,
  deleteBudget,
  calculateBudgetStatus
};
