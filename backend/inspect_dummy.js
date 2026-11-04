const { query } = require('./db/connection');

async function main() {
  const res = await query(`
    SELECT c.name as category_name, c.id as category_id,
      COUNT(*) as tx_count,
      ROUND(SUM(amount)::numeric, 2) as total_spent,
      ROUND(AVG(amount)::numeric, 2) as avg_spent,
      ROUND((SUM(amount) / 9.0)::numeric, 2) as avg_monthly_spent
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.type = 'expense' AND t.currency = 'PKR'
    GROUP BY c.name, c.id
    ORDER BY total_spent DESC
  `);
  console.log('Categories spending in PKR across dummy data:');
  console.table(res.rows);

  const monthCat = await query(`
    SELECT to_char(date, 'YYYY-MM') as ym, c.name, sum(amount) as spent
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.type = 'expense' AND t.currency = 'PKR'
    GROUP BY ym, c.name
    ORDER BY ym DESC, spent DESC
  `);
  console.log('Sample monthly spending by category (latest 20):');
  console.table(monthCat.rows.slice(0, 20));

  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
