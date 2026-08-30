const Loan = require('../models/Loan');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

// Helper to calculate EMI
const calculateEMIVal = (principal, annualRate, termMonths) => {
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) return principal / termMonths;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
  return emi;
};

// @desc    Get all loans
// @route   GET /api/v1/loans
// @access  Private
const getLoans = async (req, res, next) => {
  try {
    const loans = await Loan.find({ user: req.user._id });
    res.json({ success: true, loans });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new loan
// @route   POST /api/v1/loans
// @access  Private
const createLoan = async (req, res, next) => {
  try {
    const { name, type, principal, interestRate, termMonths, nextDueDate } = req.body;

    if (!name || !type || !principal || interestRate === undefined || !termMonths) {
      res.status(400);
      throw new Error('Please fill in all loan details');
    }

    const emi = calculateEMIVal(Number(principal), Number(interestRate), Number(termMonths));
    const defaultDueDate = nextDueDate ? new Date(nextDueDate) : new Date(new Date().setMonth(new Date().getMonth() + 1));

    const loan = await Loan.create({
      user: req.user._id,
      name,
      type,
      principal,
      interestRate,
      termMonths,
      emi,
      remainingBalance: principal,
      nextDueDate: defaultDueDate,
    });

    res.status(201).json({ success: true, loan });
  } catch (error) {
    next(error);
  }
};

// @desc    Update loan
// @route   PUT /api/v1/loans/:id
// @access  Private
const updateLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, user: req.user._id });

    if (!loan) {
      res.status(404);
      throw new Error('Loan not found');
    }

    loan.name = req.body.name || loan.name;
    loan.type = req.body.type || loan.type;
    loan.nextDueDate = req.body.nextDueDate || loan.nextDueDate;
    loan.status = req.body.status || loan.status;

    if (req.body.remainingBalance !== undefined) {
      loan.remainingBalance = req.body.remainingBalance;
    }

    const updated = await loan.save();
    res.json({ success: true, loan: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete loan
// @route   DELETE /api/v1/loans/:id
// @access  Private
const deleteLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, user: req.user._id });

    if (!loan) {
      res.status(404);
      throw new Error('Loan not found');
    }

    await loan.deleteOne();
    res.json({ success: true, message: 'Loan record deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Pay EMI installment
// @route   POST /api/v1/loans/:id/pay
// @access  Private
const payEMI = async (req, res, next) => {
  try {
    const { amount, accountId } = req.body;
    const loan = await Loan.findOne({ _id: req.params.id, user: req.user._id });
    const account = await Account.findOne({ _id: accountId, user: req.user._id });

    if (!loan) {
      res.status(404);
      throw new Error('Loan details not found');
    }

    if (!account) {
      res.status(404);
      throw new Error('Source payment account not found');
    }

    const paymentAmount = amount || loan.emi;

    if (account.balance < paymentAmount) {
      res.status(400);
      throw new Error('Insufficient balance in selected account to pay EMI');
    }

    // Deduct from bank account
    account.balance -= paymentAmount;
    await account.save();

    // Log transaction
    const transaction = await Transaction.create({
      user: req.user._id,
      type: 'loan',
      amount: paymentAmount,
      category: 'Loan EMI',
      description: `EMI payment for loan: ${loan.name}`,
      account: accountId,
      date: new Date(),
    });

    // Update remaining loan balance
    loan.remainingBalance -= paymentAmount;
    if (loan.remainingBalance <= 0) {
      loan.remainingBalance = 0;
      loan.status = 'closed';
    }

    // Shift next due date to next month
    const nextDate = new Date(loan.nextDueDate);
    nextDate.setMonth(nextDate.getMonth() + 1);
    loan.nextDueDate = nextDate;

    // Record payment history
    loan.paymentHistory.push({
      date: new Date(),
      amount: paymentAmount,
      transaction: transaction._id,
    });

    await loan.save();

    res.json({ success: true, loan, account, transaction });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLoans,
  createLoan,
  updateLoan,
  deleteLoan,
  payEMI,
};
