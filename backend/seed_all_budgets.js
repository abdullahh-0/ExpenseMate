const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:1234@localhost:5432/expensemate_db'
});

async function main() {
  const client = await pool.connect();
  try {
    console.log('Connected to PostgreSQL database.');

    // 1. Ensure all standard expense categories exist
    const categoryNames = [
      'Rent', 'Shopping', 'Education', 'Food', 'Transport',
      'Bills', 'Health', 'Utilities', 'Entertainment', 'Other'
    ];

    for (const name of categoryNames) {
      await client.query(`
        INSERT INTO categories (name, type) VALUES ($1, 'expense')
        ON CONFLICT (name) DO NOTHING
      `, [name]);
    }

    // 2. Clear old budgets for 2026
    await client.query('DELETE FROM budgets WHERE year = 2026');

    // 3. For each month from 1 to 9 (and default for 10-12),
    // calculate actual spending in dummy data and set sensible budget caps matching the data
    const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    for (const m of months) {
      // Query spending for this month in PKR
      const spentRes = await client.query(`
        SELECT c.name, COALESCE(SUM(t.amount), 0) as spent
        FROM categories c
        LEFT JOIN transactions t ON t.category_id = c.id 
          AND t.type = 'expense' 
          AND t.currency = 'PKR'
          AND EXTRACT(MONTH FROM t.date) = $1
          AND EXTRACT(YEAR FROM t.date) = 2026
        WHERE c.type = 'expense'
        GROUP BY c.name
      `, [m]);

      for (const row of spentRes.rows) {
        const spent = parseFloat(row.spent) || 0;
        let limit;
        if (spent > 0) {
          // Set budget limit between 1.15x and 1.30x of actual spending so it is realistic (75% - 87% used)
          // Rounded to nearest 5,000 or 10,000
          const rawLimit = spent * 1.20;
          limit = Math.max(15000, Math.ceil(rawLimit / 5000) * 5000);
        } else {
          // Baseline monthly budget if no spending in that month
          const defaults = {
            'Rent': 450000, 'Shopping': 100000, 'Food': 80000,
            'Education': 80000, 'Transport': 30000, 'Bills': 50000,
            'Entertainment': 25000, 'Health': 35000, 'Utilities': 30000, 'Other': 25000
          };
          limit = defaults[row.name] || 25000;
        }

        await client.query(`
          INSERT INTO budgets (category_id, month, year, amount, currency)
          VALUES ((SELECT id FROM categories WHERE name = $1), $2, 2026, $3, 'PKR')
          ON CONFLICT (category_id, month, year, currency)
          DO UPDATE SET amount = EXCLUDED.amount
        `, [row.name, m, limit]);
      }

      // Also insert USD budgets for each month
      const usdDefaults = {
        'Rent': 1500, 'Shopping': 600, 'Food': 700,
        'Education': 400, 'Transport': 350, 'Bills': 350,
        'Entertainment': 200, 'Health': 250, 'Utilities': 200, 'Other': 150
      };

      for (const [catName, usdLimit] of Object.entries(usdDefaults)) {
        await client.query(`
          INSERT INTO budgets (category_id, month, year, amount, currency)
          VALUES ((SELECT id FROM categories WHERE name = $1), $2, 2026, $3, 'USD')
          ON CONFLICT (category_id, month, year, currency)
          DO UPDATE SET amount = EXCLUDED.amount
        `, [catName, m, usdLimit]);
      }
    }

    console.log('Successfully seeded budgets matching all dummy data for all 12 months.');

    const sepCheck = await client.query(`
      SELECT c.name, b.amount as limit_pkr,
        COALESCE(SUM(t.amount), 0) as spent_pkr,
        ROUND((COALESCE(SUM(t.amount), 0) / b.amount * 100)::numeric, 1) as pct_used
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      LEFT JOIN transactions t ON t.category_id = c.id 
        AND t.type = 'expense' 
        AND t.currency = 'PKR'
        AND EXTRACT(MONTH FROM t.date) = 9
        AND EXTRACT(YEAR FROM t.date) = 2026
      WHERE b.month = 9 AND b.year = 2026 AND b.currency = 'PKR'
      GROUP BY c.name, b.amount
      ORDER BY b.amount DESC
    `);

    console.log('September 2026 Budgets vs Actual Dummy Spending:');
    console.table(sepCheck.rows);

  } catch (err) {
    console.error('Error seeding budgets:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
