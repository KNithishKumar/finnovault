const express = require('express');
const router = express.Router();
const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  ocrReceiptUpload,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

router.route('/')
  .get(getTransactions)
  .post(upload.single('attachment'), createTransaction);

router.route('/:id')
  .put(upload.single('attachment'), updateTransaction)
  .delete(deleteTransaction);

module.exports = router;
