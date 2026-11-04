const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:1234@localhost:5432/expensemate_db'
});

async function main() {
  const client = await pool.connect();
  try {
    console.log('Connected to PostgreSQL successfully.');
    
    // Ensure all categories exist
    const categories = [
      { name: 'Rent', type: 'expense' },
      { name: 'Shopping', type: 'expense' },
      { name: 'Education', type: 'expense' },
      { name: 'Food', type: 'expense' },
      { name: 'Transport', type: 'expense' },
      { name: 'Bills', type: 'expense' },
      { name: 'Health', type: 'expense' },
      { name: 'Utilities', type: 'expense' },
      { name: 'Entertainment', type: 'expense' },
      { name: 'Other', type: 'expense' },
      { name: 'Salary', type: 'income' },
      { name: 'Freelance', type: 'income' },
      { name: 'Business', type: 'income' },
      { name: 'Investment', type: 'income' }
    ];

    for (const c of categories) {
      await client.query(
        'INSERT INTO categories (name, type) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
        [c.name, c.type]
      );
    }

    // Ensure September 2026 has realistic Entertainment transactions
    const entRes = await client.query(`
      SELECT count(*) FROM transactions 
      WHERE category_id = (SELECT id FROM categories WHERE name = 'Entertainment')
        AND EXTRACT(MONTH FROM date) = 9 AND EXTRACT(YEAR FROM date) = 2026
    `);
    
    if (parseInt(entRes.rows[0].count) === 0) {
      console.log('Adding realistic September 2026 Entertainment transactions...');
      await client.query(`
        INSERT INTO transactions (date, description, amount, type, category_id, currency) VALUES
        ('2026-09-12', 'Movie & IMAX 3D Cinema Tickets', 14500.00, 'expense', (SELECT id FROM categories WHERE name = 'Entertainment'), 'PKR'),
        ('2026-09-22', 'Live Concert & Family Park Passes', 35500.00, 'expense', (SELECT id FROM categories WHERE name = 'Entertainment'), 'PKR'),
        ('2026-09-15', 'Streaming & Theater Entertainment', 120.00, 'expense', (SELECT id FROM categories WHERE name = 'Entertainment'), 'USD')
      `);
    }

    // Clear old budget entries for month 9, 2026 and month 8, 2026
    await client.query('DELETE FROM budgets WHERE (month = 9 OR month = 8) AND year = 2026');

    // Realistic, sensible budgets
    const budgets = [
      // September 2026 PKR monthly budgets
      { cat: 'Rent', month: 9, year: 2026, amount: 450000.00, currency: 'PKR' },
      { cat: 'Shopping', month: 9, year: 2026, amount: 250000.00, currency: 'PKR' },
      { cat: 'Education', month: 9, year: 2026, amount: 200000.00, currency: 'PKR' },
      { cat: 'Food', month: 9, year: 2026, amount: 200000.00, currency: 'PKR' },
      { cat: 'Transport', month: 9, year: 2026, amount: 80000.00, currency: 'PKR' },
      { cat: 'Bills', month: 9, year: 2026, amount: 70000.00, currency: 'PKR' },
      { cat: 'Entertainment', month: 9, year: 2026, amount: 60000.00, currency: 'PKR' },
      
      // September 2026 USD monthly budgets
      { cat: 'Rent', month: 9, year: 2026, amount: 1500.00, currency: 'USD' },
      { cat: 'Food', month: 9, year: 2026, amount: 750.00, currency: 'USD' },
      { cat: 'Shopping', month: 9, year: 2026, amount: 450.00, currency: 'USD' },
      { cat: 'Transport', month: 9, year: 2026, amount: 350.00, currency: 'USD' },
      { cat: 'Bills', month: 9, year: 2026, amount: 350.00, currency: 'USD' },
      { cat: 'Education', month: 9, year: 2026, amount: 300.00, currency: 'USD' },
      { cat: 'Entertainment', month: 9, year: 2026, amount: 200.00, currency: 'USD' },

      // August 2026 PKR monthly budgets (so August is also populated)
      { cat: 'Rent', month: 8, year: 2026, amount: 220000.00, currency: 'PKR' },
      { cat: 'Shopping', month: 8, year: 2026, amount: 60000.00, currency: 'PKR' },
      { cat: 'Bills', month: 8, year: 2026, amount: 70000.00, currency: 'PKR' },
      { cat: 'Transport', month: 8, year: 2026, amount: 15000.00, currency: 'PKR' },
      { cat: 'Food', month: 8, year: 2026, amount: 15000.00, currency: 'PKR' },
      { cat: 'Entertainment', month: 8, year: 2026, amount: 15000.00, currency: 'PKR' }
    ];

    for (const b of budgets) {
      await client.query(`
        INSERT INTO budgets (category_id, month, year, amount, currency)
        VALUES ((SELECT id FROM categories WHERE name = $1), $2, $3, $4, $5)
        ON CONFLICT (category_id, month, year, currency)
        DO UPDATE SET amount = EXCLUDED.amount
      `, [b.cat, b.month, b.year, b.amount, b.currency]);
    }

    const res = await client.query(`
      SELECT b.id, c.name as category_name, b.amount, b.currency, b.month, b.year
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      WHERE b.month = 9 AND b.year = 2026 AND b.currency = 'PKR'
      ORDER BY b.amount DESC
    `);

    console.log('Updated September Budgets in DB:');
    console.table(res.rows);

  } catch (err) {
    console.error('Error updating budgets:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
