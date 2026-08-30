const BorrowLend = require('../models/BorrowLend');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

// @desc    Get all borrow and lend records
// @route   GET /api/v1/debt
// @access  Private
const getDebts = async (req, res, next) => {
  try {
    const debts = await BorrowLend.find({ user: req.user._id });
    res.json({ success: true, debts });
  } catch (error) {
    next(error);
  }
};

// @desc    Create borrow/lend record
// @route   POST /api/v1/debt
// @access  Private
const createDebt = async (req, res, next) => {
  try {
    const { personName, phone, type, amount, dueDate } = req.body;

    if (!personName || !type || !amount || !dueDate) {
      res.status(400);
      throw new Error('Please fill in all debt fields');
    }

    const debt = await BorrowLend.create({
      user: req.user._id,
      personName,
      phone,
      type,
      amount,
      remainingAmount: amount,
      dueDate,
    });

    res.status(201).json({ success: true, debt });
  } catch (error) {
    next(error);
  }
};

// @desc    Update borrow/lend record
// @route   PUT /api/v1/debt/:id
// @access  Private
const updateDebt = async (req, res, next) => {
  try {
    const debt = await BorrowLend.findOne({ _id: req.params.id, user: req.user._id });

    if (!debt) {
      res.status(404);
      throw new Error('Debt record not found');
    }

    debt.personName = req.body.personName || debt.personName;
    debt.phone = req.body.phone !== undefined ? req.body.phone : debt.phone;
    debt.dueDate = req.body.dueDate || debt.dueDate;
    debt.status = req.body.status || debt.status;

    if (req.body.remainingAmount !== undefined) {
      debt.remainingAmount = req.body.remainingAmount;
      if (debt.remainingAmount <= 0) {
        debt.status = 'paid';
      }
    }

    const updated = await debt.save();
    res.json({ success: true, debt: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete borrow/lend record
// @route   DELETE /api/v1/debt/:id
// @access  Private
const deleteDebt = async (req, res, next) => {
  try {
    const debt = await BorrowLend.findOne({ _id: req.params.id, user: req.user._id });

    if (!debt) {
      res.status(404);
      throw new Error('Debt record not found');
    }

    await debt.deleteOne();
    res.json({ success: true, message: 'Debt record deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Pay back or collect money from debt
// @route   POST /api/v1/debt/:id/payment
// @access  Private
const recordDebtPayment = async (req, res, next) => {
  try {
    const { amount, accountId } = req.body;
    const debt = await BorrowLend.findOne({ _id: req.params.id, user: req.user._id });
    const account = await Account.findOne({ _id: accountId, user: req.user._id });

    if (!debt) {
      res.status(404);
      throw new Error('Debt details not found');
    }

    if (!account) {
      res.status(404);
      throw new Error('Wallet/Account not found');
    }

    if (amount <= 0 || amount > debt.remainingAmount) {
      res.status(400);
      throw new Error('Invalid payment amount. Cannot exceed remaining debt amount.');
    }

    // Type 'borrowed' means we owe money. Re-paying debt deducts money from our account
    // Type 'lent' means we lent money. Collecting repayment adds money to our account
    if (debt.type === 'borrowed') {
      if (account.balance < amount) {
        res.status(400);
        throw new Error('Insufficient balance in selected account to repay this debt');
      }
      account.balance -= amount;
    } else {
      account.balance += amount;
    }

    await account.save();

    // Log transaction
    const txType = debt.type === 'borrowed' ? 'expense' : 'income'; // Record as expense (paying back) or income (receiving payment)
    const transaction = await Transaction.create({
      user: req.user._id,
      type: txType,
      amount,
      category: 'Debt Settlement',
      description: `Debt payment for ${debt.personName} (${debt.type})`,
      account: accountId,
      date: new Date(),
    });

    // Update debt values
    debt.remainingAmount -= amount;
    if (debt.remainingAmount <= 0) {
      debt.remainingAmount = 0;
      debt.status = 'paid';
    }

    debt.paymentHistory.push({
      date: new Date(),
      amount,
      transaction: transaction._id,
    });

    await debt.save();

    res.json({ success: true, debt, account, transaction });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDebts,
  createDebt,
  updateDebt,
  deleteDebt,
  recordDebtPayment,
};
