const { query } = require('./db/connection');

async function main() {
  const res = await query(`
    SELECT category_id, c.name, TO_CHAR(date, 'YYYY-MM') as ym, COUNT(*), SUM(amount) as total
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.type = 'expense'
    GROUP BY category_id, c.name, ym
    ORDER BY c.name, ym
  `);
  console.table(res.rows);
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
