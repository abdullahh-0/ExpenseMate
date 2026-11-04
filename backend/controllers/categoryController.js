const db = require('../db/connection');

// GET /api/categories
const getCategories = async (req, res) => {
  try {
    const type = req.query.type;
    let sql = 'SELECT * FROM categories';
    let params = [];

    if (type && (type === 'income' || type === 'expense')) {
      sql += ' WHERE type = $1';
      params.push(type);
    }
    sql += ' ORDER BY name ASC';

    const result = await db.query(sql, params);
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
};

module.exports = {
  getCategories
};
