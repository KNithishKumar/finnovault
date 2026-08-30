const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

// @desc    Get all accounts
// @route   GET /api/v1/accounts
// @access  Private
const getAccounts = async (req, res, next) => {
  try {
    const accounts = await Account.find({ user: req.user._id }).sort({ isPinned: -1, name: 1 });
    res.json({ success: true, accounts });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new account
// @route   POST /api/v1/accounts
// @access  Private
const createAccount = async (req, res, next) => {
  try {
    const { name, type, balance, color } = req.body;

    const account = await Account.create({
      user: req.user._id,
      name,
      type,
      balance: balance || 0,
      color: color || '#2563EB',
    });

    res.status(201).json({ success: true, account });
  } catch (error) {
    next(error);
  }
};

// @desc    Update account
// @route   PUT /api/v1/accounts/:id
// @access  Private
const updateAccount = async (req, res, next) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, user: req.user._id });

    if (!account) {
      res.status(404);
      throw new Error('Account not found');
    }

    account.name = req.body.name || account.name;
    account.type = req.body.type || account.type;
    if (req.body.balance !== undefined) {
      account.balance = req.body.balance;
    }
    if (req.body.isPinned !== undefined) {
      account.isPinned = req.body.isPinned;
    }
    account.color = req.body.color || account.color;

    const updatedAccount = await account.save();
    res.json({ success: true, account: updatedAccount });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete account
// @route   DELETE /api/v1/accounts/:id
// @access  Private
const deleteAccount = async (req, res, next) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, user: req.user._id });

    if (!account) {
      res.status(404);
      throw new Error('Account not found');
    }

    // Verify it is not their only account
    const accountCount = await Account.countDocuments({ user: req.user._id });
    if (accountCount <= 1) {
      res.status(400);
      throw new Error('You must keep at least one financial account active');
    }

    // Delete associated transactions
    await Transaction.deleteMany({ account: req.params.id });
    await account.deleteOne();

    res.json({ success: true, message: 'Account and associated transactions deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Transfer funds between accounts
// @route   POST /api/v1/accounts/transfer
// @access  Private
const transferFunds = async (req, res, next) => {
  try {
    const { fromAccountId, toAccountId, amount, description } = req.body;

    if (!fromAccountId || !toAccountId || !amount || amount <= 0) {
      res.status(400);
      throw new Error('Invalid transfer details');
    }

    const fromAccount = await Account.findOne({ _id: fromAccountId, user: req.user._id });
    const toAccount = await Account.findOne({ _id: toAccountId, user: req.user._id });

    if (!fromAccount || !toAccount) {
      res.status(404);
      throw new Error('One or both accounts not found');
    }

    if (fromAccount.balance < amount) {
      res.status(400);
      throw new Error('Insufficient balance in source account');
    }

    // Deduct and add
    fromAccount.balance -= amount;
    toAccount.balance += amount;

    await fromAccount.save();
    await toAccount.save();

    // Create a transaction record to log the transfer
    const transaction = await Transaction.create({
      user: req.user._id,
      type: 'transfer',
      amount,
      category: 'Transfer',
      description: description || `Transfer from ${fromAccount.name} to ${toAccount.name}`,
      account: fromAccountId,
      toAccount: toAccountId,
      paymentMethod: 'Bank',
      status: 'completed',
      date: new Date(),
    });

    res.json({
      success: true,
      message: 'Transfer successful',
      transaction,
      fromAccount,
      toAccount,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  transferFunds,
};
