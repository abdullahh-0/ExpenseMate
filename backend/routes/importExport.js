const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { previewFile, confirmImport, exportCsv } = require('../controllers/importController');

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 16 * 1024 * 1024 } // 16 MB max
});

router.post('/import/preview', upload.single('file'), previewFile);
router.post('/import/confirm', confirmImport);
router.get('/export/csv', exportCsv);

module.exports = router;
