const express = require('express');
const router = express.Router();
const {
  getDebts,
  createDebt,
  updateDebt,
  deleteDebt,
  recordDebtPayment,
} = require('../controllers/borrowLendController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getDebts)
  .post(createDebt);

router.route('/:id')
  .put(updateDebt)
  .delete(deleteDebt);

router.post('/:id/payment', recordDebtPayment);

module.exports = router;
