const express = require('express');
const router = express.Router();
const {
  getBudgets,
  createOrUpdateBudget,
  deleteBudget
} = require('../controllers/budgetController');

router.get('/', getBudgets);
router.post('/', createOrUpdateBudget);
router.delete('/:id', deleteBudget);

module.exports = router;
