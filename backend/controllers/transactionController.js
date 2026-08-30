const Transaction = require("../models/Transaction");
const Account = require("../models/Account");
const Budget = require("../models/Budget");
const Notification = require("../models/Notification");
const { formatCurrency } = require("../utils/currency");


// ============================================================
// Helper: Update Account Balance
// ============================================================
const adjustAccountBalance = async (
  accountId,
  amount,
  type,
  operation
) => {
  const account = await Account.findById(accountId);

  if (!account) return;

  // Always convert amount to Number
  const numericAmount = Number(amount) || 0;

  let delta = numericAmount;

  // Revert previous transaction
  if (operation === "revert") {
    delta = -numericAmount;
  }

  // Make sure existing balance is also treated as Number
  const currentBalance = Number(account.balance) || 0;

  // Income / Borrow increases balance
  if (["income", "borrow"].includes(type)) {
    account.balance = currentBalance + delta;
  }

  // Expense / Investment / Savings / Lend / Loan decreases balance
  else if (
    ["expense", "investment", "savings", "lend", "loan"].includes(type)
  ) {
    account.balance = currentBalance - delta;
  }

  await account.save();
};


// ============================================================
// Helper: Update Budget Spent
// ============================================================
const handleBudgetAdjustment = async (
  userId,
  category,
  amount,
  operation,
  transactionDate
) => {
  // Always convert amount to Number
  const numericAmount = Number(amount) || 0;

  // IMPORTANT:
  // Use transaction date instead of today's date.
  //
  // Example:
  // Transaction date = August 15
  // → August budget should be updated.
  //
  // Not the current month's budget.
  const date = transactionDate
    ? new Date(transactionDate)
    : new Date();

  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  // Find budget for this category/month/year
  const budget = await Budget.findOne({
    user: userId,
    category,
    month,
    year,
  });

  // No budget exists for this category
  if (!budget) return;

  // Make sure existing spent value is a number
  const currentSpent = Number(budget.spent) || 0;

  let delta = numericAmount;

  // Revert transaction
  if (operation === "revert") {
    delta = -numericAmount;
  }

  // Update spent amount
  budget.spent = currentSpent + delta;

  // Never allow negative spent
  if (budget.spent < 0) {
    budget.spent = 0;
  }

  await budget.save();


  // ==========================================================
  // Budget Notifications
  // ==========================================================

  const budgetLimit = Number(budget.limit) || 0;


  // ----------------------------------------------------------
  // Budget exceeded
  // ----------------------------------------------------------
  if (
    operation === "add" &&
    budget.spent > budgetLimit
  ) {
    const notifExists = await Notification.findOne({
      user: userId,
      message: new RegExp(
        `Budget limit exceeded for ${category}`
      ),
      createdAt: {
        $gte: new Date(
          Date.now() - 24 * 60 * 60 * 1000
        ),
      },
    });

    if (!notifExists) {
      await Notification.create({
        user: userId,

        message: `Budget limit exceeded for ${category}! Spent: ${formatCurrency(
          budget.spent
        )} / Limit: ${formatCurrency(budgetLimit)}.`,

        type: "alert",

        link: "/budgets",
      });
    }
  }


  // ----------------------------------------------------------
  // Budget warning at 80%
  // ----------------------------------------------------------
  else if (
    operation === "add" &&
    budgetLimit > 0 &&
    budget.spent >= budgetLimit * 0.8 &&
    budget.spent <= budgetLimit
  ) {
    const notifExists = await Notification.findOne({
      user: userId,
      message: new RegExp(
        `Budget warning: ${category}`
      ),
      createdAt: {
        $gte: new Date(
          Date.now() - 24 * 60 * 60 * 1000
        ),
      },
    });

    if (!notifExists) {
      await Notification.create({
        user: userId,

        message: `Budget warning: ${category} spending is at 80% of limit. Spent: ${formatCurrency(
          budget.spent
        )} / Limit: ${formatCurrency(budgetLimit)}.`,

        type: "info",

        link: "/budgets",
      });
    }
  }
};


// ============================================================
// Get All Transactions
// ============================================================
// @desc    Get all transactions with filter, search, sort, pagination
// @route   GET /api/v1/transactions
// @access  Private
const getTransactions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      type,
      category,
      account,
      startDate,
      endDate,
      sort = "-date",
    } = req.query;

    const query = {
      user: req.user._id,
    };


    // Search
    if (search) {
      query.$or = [
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
        {
          category: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }


    // Type filter
    if (type) {
      query.type = type;
    }


    // Category filter
    if (category) {
      query.category = category;
    }


    // Account filter
    if (account) {
      query.account = account;
    }


    // Date filter
    if (startDate || endDate) {
      query.date = {};

      if (startDate) {
        query.date.$gte = new Date(startDate);
      }

      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }


    const total = await Transaction.countDocuments(query);


    const transactions = await Transaction.find(query)
      .sort(sort)
      .skip((page - 1) * Number(limit))
      .limit(Number(limit))
      .populate(
        "account",
        "name type color"
      )
      .populate(
        "toAccount",
        "name type color"
      );


    res.json({
      success: true,
      count: transactions.length,
      total,
      pages: Math.ceil(
        total / Number(limit)
      ),
      currentPage: Number(page),
      transactions,
    });

  } catch (error) {
    next(error);
  }
};


// ============================================================
// Create Transaction
// ============================================================
// @desc    Create new transaction
// @route   POST /api/v1/transactions
// @access  Private
const createTransaction = async (req, res, next) => {
  try {
    const {
      type,
      amount,
      category,
      date,
      description,
      account: accountId,
      paymentMethod,
      isRecurring,
      recurrenceFrequency,
    } = req.body;


    // Convert amount to Number immediately
    const numericAmount = Number(amount);


    // Validate amount
    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      res.status(400);
      throw new Error(
        "Please enter a valid transaction amount"
      );
    }


    // Find account
    const targetAccount = await Account.findOne({
      _id: accountId,
      user: req.user._id,
    });


    if (!targetAccount) {
      res.status(404);
      throw new Error(
        "Associated financial account not found"
      );
    }


    // Attachment
    let attachment = "";

    if (req.file) {
      attachment = `/uploads/${req.file.filename}`;
    }


    // Recurring transaction
    let nextRecurrenceDate = null;


    if (
      isRecurring &&
      recurrenceFrequency !== "none"
    ) {
      const start = date
        ? new Date(date)
        : new Date();

      nextRecurrenceDate = new Date(start);


      if (recurrenceFrequency === "daily") {
        nextRecurrenceDate.setDate(
          nextRecurrenceDate.getDate() + 1
        );
      }

      else if (
        recurrenceFrequency === "weekly"
      ) {
        nextRecurrenceDate.setDate(
          nextRecurrenceDate.getDate() + 7
        );
      }

      else if (
        recurrenceFrequency === "monthly"
      ) {
        nextRecurrenceDate.setMonth(
          nextRecurrenceDate.getMonth() + 1
        );
      }

      else if (
        recurrenceFrequency === "yearly"
      ) {
        nextRecurrenceDate.setFullYear(
          nextRecurrenceDate.getFullYear() + 1
        );
      }
    }


    // Actual transaction date
    const transactionDate = date
      ? new Date(date)
      : new Date();


    // Create transaction
    const transaction = await Transaction.create({
      user: req.user._id,
      type,
      amount: numericAmount,
      category,
      date: transactionDate,
      description,
      account: accountId,
      paymentMethod:
        paymentMethod || "Bank",
      attachment,
      isRecurring:
        isRecurring || false,
      recurrenceFrequency:
        recurrenceFrequency || "none",
      nextRecurrenceDate,
    });


    // Update account balance
    await adjustAccountBalance(
      accountId,
      numericAmount,
      type,
      "add"
    );


    // Update budget
    if (type === "expense") {
      await handleBudgetAdjustment(
        req.user._id,
        category,
        numericAmount,
        "add",
        transactionDate
      );
    }


    res.status(201).json({
      success: true,
      transaction,
    });

  } catch (error) {
    next(error);
  }
};


// ============================================================
// Update Transaction
// ============================================================
// @desc    Update transaction
// @route   PUT /api/v1/transactions/:id
// @access  Private
const updateTransaction = async (req, res, next) => {
  try {

    const transaction =
      await Transaction.findOne({
        _id: req.params.id,
        user: req.user._id,
      });


    if (!transaction) {
      res.status(404);
      throw new Error(
        "Transaction not found"
      );
    }


    // ========================================================
    // Save old transaction values
    // ========================================================

    const oldAmount =
      Number(transaction.amount) || 0;

    const oldType =
      transaction.type;

    const oldCategory =
      transaction.category;

    const oldDate =
      transaction.date;

    const oldAccount =
      transaction.account;


    // ========================================================
    // Revert old account balance
    // ========================================================

    await adjustAccountBalance(
      oldAccount,
      oldAmount,
      oldType,
      "revert"
    );


    // ========================================================
    // Revert old budget
    // ========================================================

    if (oldType === "expense") {
      await handleBudgetAdjustment(
        req.user._id,
        oldCategory,
        oldAmount,
        "revert",
        oldDate
      );
    }


    // ========================================================
    // Apply new values
    // ========================================================

    transaction.type =
      req.body.type ||
      transaction.type;


    transaction.amount =
      req.body.amount !== undefined
        ? Number(req.body.amount)
        : oldAmount;


    transaction.category =
      req.body.category ||
      transaction.category;


    transaction.date =
      req.body.date
        ? new Date(req.body.date)
        : transaction.date;


    transaction.description =
      req.body.description ||
      transaction.description;


    transaction.account =
      req.body.account ||
      transaction.account;


    transaction.paymentMethod =
      req.body.paymentMethod ||
      transaction.paymentMethod;


    transaction.isRecurring =
      req.body.isRecurring !== undefined
        ? req.body.isRecurring
        : transaction.isRecurring;


    transaction.recurrenceFrequency =
      req.body.recurrenceFrequency ||
      transaction.recurrenceFrequency;


    // Validate new amount
    if (
      !Number.isFinite(
        Number(transaction.amount)
      ) ||
      Number(transaction.amount) <= 0
    ) {
      res.status(400);
      throw new Error(
        "Please enter a valid transaction amount"
      );
    }


    // Attachment
    if (req.file) {
      transaction.attachment =
        `/uploads/${req.file.filename}`;
    }


    // Save updated transaction
    const updatedTransaction =
      await transaction.save();


    // ========================================================
    // Apply new account balance
    // ========================================================

    await adjustAccountBalance(
      updatedTransaction.account,
      Number(updatedTransaction.amount),
      updatedTransaction.type,
      "add"
    );


    // ========================================================
    // Apply new budget
    // ========================================================

    if (
      updatedTransaction.type ===
      "expense"
    ) {
      await handleBudgetAdjustment(
        req.user._id,
        updatedTransaction.category,
        Number(updatedTransaction.amount),
        "add",
        updatedTransaction.date
      );
    }


    res.json({
      success: true,
      transaction: updatedTransaction,
    });

  } catch (error) {
    next(error);
  }
};


// ============================================================
// Delete Transaction
// ============================================================
// @desc    Delete transaction
// @route   DELETE /api/v1/transactions/:id
// @access  Private
const deleteTransaction = async (
  req,
  res,
  next
) => {
  try {

    const transaction =
      await Transaction.findOne({
        _id: req.params.id,
        user: req.user._id,
      });


    if (!transaction) {
      res.status(404);
      throw new Error(
        "Transaction not found"
      );
    }


    const amount =
      Number(transaction.amount) || 0;


    // ========================================================
    // Revert account balance
    // ========================================================

    await adjustAccountBalance(
      transaction.account,
      amount,
      transaction.type,
      "revert"
    );


    // ========================================================
    // Revert budget
    // ========================================================

    if (
      transaction.type === "expense"
    ) {
      await handleBudgetAdjustment(
        req.user._id,
        transaction.category,
        amount,
        "revert",
        transaction.date
      );
    }


    // Delete transaction
    await transaction.deleteOne();


    res.json({
      success: true,
      message:
        "Transaction deleted and account balance reconciled",
    });

  } catch (error) {
    next(error);
  }
};

// ============================================================
// Export Controllers
// ============================================================

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};