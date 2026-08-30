const express = require('express');
const router = express.Router();
const {
  getLoans,
  createLoan,
  updateLoan,
  deleteLoan,
  payEMI,
} = require('../controllers/loanController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getLoans)
  .post(createLoan);

router.route('/:id')
  .put(updateLoan)
  .delete(deleteLoan);

router.post('/:id/pay', payEMI);

module.exports = router;
