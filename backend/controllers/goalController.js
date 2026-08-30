const SavingsGoal = require('../models/SavingsGoal');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const Notification = require('../models/Notification');
const { formatCurrency } = require("../utils/currency");

// @desc    Get savings goals
// @route   GET /api/v1/goals
// @access  Private
const getGoals = async (req, res, next) => {
  try {
    const goals = await SavingsGoal.find({ user: req.user._id });
    res.json({ success: true, goals });
  } catch (error) {
    next(error);
  }
};

// @desc    Create savings goal
// @route   POST /api/v1/goals
// @access  Private
const createGoal = async (req, res, next) => {
  try {
    const { name, targetAmount, deadline, currentAmount } = req.body;

    const goal = await SavingsGoal.create({
      user: req.user._id,
      name,
      targetAmount,
      deadline,
      currentAmount: currentAmount || 0,
    });

    res.status(201).json({ success: true, goal });
  } catch (error) {
    next(error);
  }
};

// @desc    Update savings goal
// @route   PUT /api/v1/goals/:id
// @access  Private
const updateGoal = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findOne({ _id: req.params.id, user: req.user._id });

    if (!goal) {
      res.status(404);
      throw new Error('Goal not found');
    }

    goal.name = req.body.name || goal.name;
    goal.targetAmount = req.body.targetAmount !== undefined ? req.body.targetAmount : goal.targetAmount;
    goal.currentAmount = req.body.currentAmount !== undefined ? req.body.currentAmount : goal.currentAmount;
    goal.deadline = req.body.deadline || goal.deadline;

    if (goal.currentAmount >= goal.targetAmount) {
      goal.isCompleted = true;
    } else {
      goal.isCompleted = false;
    }

    const updated = await goal.save();
    res.json({ success: true, goal: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete savings goal
// @route   DELETE /api/v1/goals/:id
// @access  Private
const deleteGoal = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findOne({ _id: req.params.id, user: req.user._id });

    if (!goal) {
      res.status(404);
      throw new Error('Goal not found');
    }

    await goal.deleteOne();
    res.json({ success: true, message: 'Savings goal deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Contribute to goal (Transfer balance from account to goal)
// @route   POST /api/v1/goals/:id/contribute
// @access  Private
const contributeToGoal = async (req, res, next) => {
  try {
    const { amount, accountId } = req.body;
    const goal = await SavingsGoal.findOne({ _id: req.params.id, user: req.user._id });
    const account = await Account.findOne({ _id: accountId, user: req.user._id });

    if (!goal) {
      res.status(404);
      throw new Error('Savings goal not found');
    }

    if (!account) {
      res.status(404);
      throw new Error('Account not found');
    }

    if (amount <= 0) {
      res.status(400);
      throw new Error('Contribution amount must be greater than zero');
    }

    if (account.balance < amount) {
      res.status(400);
      throw new Error('Insufficient balance in selected account');
    }

    // Deduct from account and add to goal
    account.balance -= amount;
    await account.save();

    goal.currentAmount += amount;
    if (goal.currentAmount >= goal.targetAmount) {
      goal.isCompleted = true;
      
      // Create achievement notification
      await Notification.create({
        user: req.user._id,
        message: `Congratulations! You have fully funded your savings goal: "${goal.name}" (${formatCurrency(goal.targetAmount)})!`,
        type: 'info',
        link: '/goals',
      });
    }
    await goal.save();

    // Log the transaction
    const tx = await Transaction.create({
      user: req.user._id,
      type: 'savings',
      amount,
      category: 'Savings Goal',
      description: `Savings goal contribution: ${goal.name}`,
      account: accountId,
      date: new Date(),
    });

    res.json({ success: true, goal, account, transaction: tx });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  contributeToGoal,
};
