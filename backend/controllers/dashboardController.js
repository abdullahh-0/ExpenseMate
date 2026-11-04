const db = require('../db/connection');

// GET /api/dashboard
const getDashboardData = async (req, res) => {
  try {
    const isOverall = req.query.month === 'overall' || req.query.month === '0' || req.query.month === 'all';
    const month = isOverall ? 0 : (parseInt(req.query.month) || 9);
    const year = parseInt(req.query.year) || 2026;
    const selectedCurrency = req.query.currency || 'PKR';

    // 1. Totals grouped by Currency
    const totalsRes = await db.query(`
      SELECT 
        currency,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
      FROM transactions
      GROUP BY currency
    `);

    const totalsByCurrency = {};
    totalsRes.rows.forEach(r => {
      const inc = parseFloat(r.total_income) || 0;
      const exp = parseFloat(r.total_expense) || 0;
      totalsByCurrency[r.currency] = {
        income: inc,
        expense: exp,
        balance: inc - exp
      };
    });

    const currTotals = totalsByCurrency[selectedCurrency] || { income: 0, expense: 0, balance: 0 };

    let monthSpendingRes, monthIncomeRes, catMonthRes, budgetRes;

    if (isOverall) {
      monthSpendingRes = await db.query(`
        SELECT SUM(amount) as month_spent
        FROM transactions
        WHERE type = 'expense' AND currency = $1
          AND EXTRACT(YEAR FROM date) = $2
      `, [selectedCurrency, year]);

      monthIncomeRes = await db.query(`
        SELECT SUM(amount) as month_income
        FROM transactions
        WHERE type = 'income' AND currency = $1
          AND EXTRACT(YEAR FROM date) = $2
      `, [selectedCurrency, year]);

      catMonthRes = await db.query(`
        SELECT c.name as category_name, SUM(t.amount) as total_amount
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE t.type = 'expense' AND t.currency = $1
          AND EXTRACT(YEAR FROM t.date) = $2
        GROUP BY c.name
        ORDER BY total_amount DESC
      `, [selectedCurrency, year]);

      budgetRes = await db.query(`
        SELECT b.category_id as id, b.category_id, c.name as category_name, SUM(b.amount) as amount, b.currency
        FROM budgets b
        JOIN categories c ON b.category_id = c.id
        WHERE b.year = $1 AND b.currency = $2
        GROUP BY b.category_id, c.name, b.currency
        ORDER BY amount DESC
      `, [year, selectedCurrency]);
    } else {
      monthSpendingRes = await db.query(`
        SELECT SUM(amount) as month_spent
        FROM transactions
        WHERE type = 'expense' AND currency = $1
          AND EXTRACT(MONTH FROM date) = $2
          AND EXTRACT(YEAR FROM date) = $3
      `, [selectedCurrency, month, year]);

      monthIncomeRes = await db.query(`
        SELECT SUM(amount) as month_income
        FROM transactions
        WHERE type = 'income' AND currency = $1
          AND EXTRACT(MONTH FROM date) = $2
          AND EXTRACT(YEAR FROM date) = $3
      `, [selectedCurrency, month, year]);

      catMonthRes = await db.query(`
        SELECT c.name as category_name, SUM(t.amount) as total_amount
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE t.type = 'expense' AND t.currency = $1
          AND EXTRACT(MONTH FROM t.date) = $2
          AND EXTRACT(YEAR FROM t.date) = $3
        GROUP BY c.name
        ORDER BY total_amount DESC
      `, [selectedCurrency, month, year]);

      budgetRes = await db.query(`
        SELECT b.*, c.name as category_name
        FROM budgets b
        JOIN categories c ON b.category_id = c.id
        WHERE b.month = $1 AND b.year = $2 AND b.currency = $3
        ORDER BY b.amount DESC
      `, [month, year, selectedCurrency]);
    }

    const monthSpent = parseFloat(monthSpendingRes.rows[0]?.month_spent) || 0;
    const monthIncome = parseFloat(monthIncomeRes.rows[0]?.month_income) || 0;
    const monthSavings = monthIncome - monthSpent;

    const catRes = await db.query(`
      SELECT c.name as category_name, SUM(t.amount) as total_amount
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.type = 'expense' AND t.currency = $1
      GROUP BY c.name
      ORDER BY total_amount DESC
    `, [selectedCurrency]);

    const formattedCategoryBreakdownAllTime = catRes.rows.map(r => ({
      name: r.category_name,
      category_name: r.category_name,
      value: parseFloat(r.total_amount),
      total_amount: parseFloat(r.total_amount)
    }));

    const formattedCategoryBreakdownMonth = catMonthRes.rows.map(r => ({
      name: r.category_name,
      category_name: r.category_name,
      value: parseFloat(r.total_amount),
      total_amount: parseFloat(r.total_amount)
    }));

    // Recent transactions query
    const recentRes = await db.query(`
      SELECT t.*, c.name as category_name
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.currency = $1
      ORDER BY t.date DESC, t.id DESC
      LIMIT 10
    `, [selectedCurrency]);

    // Monthly trend query
    const trendRes = await db.query(`
      SELECT 
        EXTRACT(MONTH FROM date) as month_num,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
      FROM transactions
      WHERE currency = $1 AND EXTRACT(YEAR FROM date) = $2
      GROUP BY EXTRACT(MONTH FROM date)
      ORDER BY month_num ASC
    `, [selectedCurrency, year]);

    const monthShortNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendMap = {};
    trendRes.rows.forEach(r => {
      trendMap[parseInt(r.month_num)] = {
        income: parseFloat(r.income) || 0,
        expense: parseFloat(r.expense) || 0
      };
    });

    const monthlyTrend = monthShortNames.map((name, i) => {
      const mNum = i + 1;
      const data = trendMap[mNum] || { income: 0, expense: 0 };
      return {
        month: name,
        month_num: mNum,
        income: data.income,
        expense: data.expense
      };
    });

    return res.json({
      success: true,
      data: {
        totalsByCurrency,
        selectedCurrency,
        selectedMonth: month,
        selectedYear: year,
        monthSpent,
        monthIncome,
        monthSavings,
        monthSummary: {
          total_income: monthIncome,
          total_expense: monthSpent,
          net_balance: monthSavings,
          savings: monthSavings
        },
        summary: {
          total_income: currTotals.income,
          total_expense: currTotals.expense,
          net_balance: currTotals.balance
        },
        categoryExpenses: formattedCategoryBreakdownMonth.length > 0 ? formattedCategoryBreakdownMonth : formattedCategoryBreakdownAllTime,
        category_breakdown: formattedCategoryBreakdownMonth.length > 0 ? formattedCategoryBreakdownMonth : formattedCategoryBreakdownAllTime,
        category_breakdown_month: formattedCategoryBreakdownMonth,
        category_breakdown_all_time: formattedCategoryBreakdownAllTime,
        monthlyTrend,
        recentTransactions: recentRes.rows,
        recent_transactions: recentRes.rows,
        budget_summary: budgetRes.rows || []
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load dashboard data.' });
  }
};

module.exports = {
  getDashboardData
};
