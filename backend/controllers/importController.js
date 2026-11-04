const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const csvParser = require('csv-parser');
const db = require('../db/connection');
const { suggestCategory } = require('../utils/categorizer');

// Helper to parse uploaded file into rows
async function parseUploadedFile(filepath) {
  const ext = path.extname(filepath).toLowerCase();
  
  if (ext === '.xlsx' || ext === '.xls') {
    const workbook = xlsx.readFile(filepath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return xlsx.utils.sheet_to_json(sheet, { raw: false });
  } else if (ext === '.csv') {
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(filepath)
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (err) => reject(err));
    });
  } else {
    throw new Error('Unsupported file format. Please upload a CSV or Excel (.xlsx) file.');
  }
}

// POST /api/import/preview
const previewFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a CSV or Excel file.' });
    }

    const filepath = req.file.path;
    const defaultCurrency = req.body.defaultCurrency || 'PKR';
    const rawRows = await parseUploadedFile(filepath);

    const validRecords = [];
    const invalidRecords = [];
    const previewRows = [];

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      const rowNum = i + 1;
      const errors = [];

      // Extract field values regardless of casing
      const dateVal = row.Date || row.date || row['Transaction Date'] || row['Transaction_Date'] || '';
      const descVal = row.Description || row.description || row.Details || row.details || '';
      const catVal = row.Category || row.category || '';
      const typeVal = (row.Type || row.type || 'expense').toString().toLowerCase().trim();
      const amtVal = parseFloat(row.Amount || row.amount || row.Cost || 0);
      const currVal = row.Currency || row.currency || defaultCurrency;

      // Validate
      if (!descVal || !descVal.toString().trim()) errors.push('Missing description');
      if (isNaN(amtVal) || amtVal <= 0) errors.push('Amount must be greater than zero');
      if (typeVal !== 'income' && typeVal !== 'expense') errors.push('Type must be income or expense');
      if (!dateVal) errors.push('Missing date');

      const categoryName = catVal ? catVal.toString().trim() : suggestCategory(descVal ? descVal.toString() : '');

      const recordObj = {
        rowNumber: rowNum,
        isValid: errors.length === 0,
        date: dateVal,
        description: descVal ? descVal.toString().trim() : '',
        category: categoryName,
        suggestedCategoryName: categoryName,
        type: typeVal,
        amount: amtVal,
        currency: currVal ? currVal.toString().toUpperCase() : 'PKR',
        errors: errors.length > 0 ? errors : null
      };

      previewRows.push(recordObj);

      if (errors.length > 0) {
        invalidRecords.push(recordObj);
      } else {
        validRecords.push(recordObj);
      }
    }

    // Clean up temporary file
    fs.unlink(filepath, () => {});

    return res.json({
      success: true,
      filename: req.file.originalname,
      summary: {
        totalRows: rawRows.length,
        validCount: validRecords.length,
        invalidCount: invalidRecords.length
      },
      previewRows,
      validRecords,
      invalidRecords
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, () => {});
    }
    return res.status(400).json({ success: false, message: error.message || 'Failed to parse dataset file.' });
  }
};

// POST /api/import/confirm
const confirmImport = async (req, res) => {
  try {
    const { validRecords } = req.body;
    if (!Array.isArray(validRecords) || validRecords.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid records to import.' });
    }

    // Pre-fetch all categories to map category name -> id cleanly
    const catRes = await db.query('SELECT id, name FROM categories');
    const categoryMap = new Map();
    (catRes.rows || []).forEach(c => {
      if (c && c.name) categoryMap.set(c.name.toLowerCase().trim(), c.id);
    });

    let importedCount = 0;

    for (const rec of validRecords) {
      const categoryName = (rec.category || rec.suggestedCategoryName || 'Other').toString().trim();
      const rawType = (rec.type || 'expense').toString().toLowerCase().trim();
      const categoryType = (rawType === 'income' || rawType === 'expense') ? rawType : 'expense';
      const safeAmount = parseFloat(rec.amount) || 0;
      const safeCurrency = (rec.currency || 'PKR').toString().toUpperCase().trim();
      const safeDate = rec.date ? rec.date.toString().trim() : new Date().toISOString().split('T')[0];
      const lowerCatName = categoryName.toLowerCase();

      let categoryId = categoryMap.get(lowerCatName);

      // Create category if it doesn't exist yet
      if (!categoryId) {
        try {
          const newCat = await db.query(
            'INSERT INTO categories (name, type) VALUES ($1, $2) RETURNING id',
            [categoryName, categoryType]
          );
          if (newCat.rows && newCat.rows.length > 0) {
            categoryId = newCat.rows[0].id;
          } else {
            // Fallback lookup
            const reCheck = await db.query('SELECT id FROM categories WHERE LOWER(name) = $1', [lowerCatName]);
            categoryId = reCheck.rows[0] ? reCheck.rows[0].id : 1;
          }
        } catch (e) {
          // If insert failed due to duplicate, fetch existing id
          const reCheck = await db.query('SELECT id FROM categories WHERE LOWER(name) = $1', [lowerCatName]);
          categoryId = reCheck.rows[0] ? reCheck.rows[0].id : 1;
        }
        categoryMap.set(lowerCatName, categoryId);
      }

      await db.query(
        `INSERT INTO transactions (date, description, amount, type, category_id, currency)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [safeDate, rec.description.trim(), safeAmount, categoryType, categoryId, safeCurrency]
      );
      importedCount++;
    }

    return res.json({
      success: true,
      message: `Successfully imported ${importedCount} records into database.`,
      importedCount
    });
  } catch (error) {
    console.error('Import confirm error:', error);
    return res.status(500).json({ success: false, message: 'Database import failed: ' + (error.message || 'Internal Server Error') });
  }
};

// GET /api/export/csv
const exportCsv = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT t.id, t.date, t.description, t.amount, t.type, c.name as category, t.currency
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      ORDER BY t.date ASC
    `);

    let csv = 'ID,Date,Description,Category,Type,Amount,Currency\n';
    (result.rows || []).forEach(r => {
      const catName = r.category || 'Other';
      const desc = (r.description || '').replace(/"/g, '""');
      csv += `"${r.id}","${r.date}","${desc}","${catName}","${r.type}",${r.amount},"${r.currency}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="ExpenseMate_Export.csv"');
    return res.status(200).send(csv);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to export CSV file.' });
  }
};

module.exports = {
  previewFile,
  confirmImport,
  exportCsv
};
