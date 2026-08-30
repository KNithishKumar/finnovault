const express = require('express');
const router = express.Router();
const {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  transferFunds,
} = require('../controllers/accountController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getAccounts)
  .post(createAccount);

router.route('/:id')
  .put(updateAccount)
  .delete(deleteAccount);

router.post('/transfer', transferFunds);

module.exports = router;
