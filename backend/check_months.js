const { query } = require('./db/connection');

async function main() {
  const res = await query(`
    SELECT 
      TO_CHAR(date, 'YYYY-MM') as ym,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense,
      SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as net_savings
    FROM transactions
    WHERE currency = 'PKR'
    GROUP BY TO_CHAR(date, 'YYYY-MM')
    ORDER BY ym DESC
  `);
  console.table(res.rows);
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
