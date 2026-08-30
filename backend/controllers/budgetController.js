const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");

// @desc    Get budgets
// @route   GET /api/v1/budgets
// @access  Private
const getBudgets = async (req, res, next) => {
  try {
    const { month, year } = req.query;

    const query = {
      user: req.user._id,
    };

    if (month) {
      query.month = Number(month);
    }

    if (year) {
      query.year = Number(year);
    }

    // Get budgets
    const budgets = await Budget.find(query);

    // Recalculate spent amount for every budget
    const updatedBudgets = await Promise.all(
      budgets.map(async (budget) => {
        // Start of selected month
        const startDate = new Date(
          budget.year,
          budget.month - 1,
          1,
          0,
          0,
          0,
          0
        );

        // End of selected month
        const endDate = new Date(
          budget.year,
          budget.month,
          0,
          23,
          59,
          59,
          999
        );

        // Find expenses for this category
        const transactions = await Transaction.find({
          user: req.user._id,
          type: "expense",
          category: budget.category,
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        });

        // IMPORTANT:
        // Convert every amount to Number before adding.
        const spent = transactions.reduce((sum, tx) => {
          return sum + (Number(tx.amount) || 0);
        }, 0);

        // Update stored spent value as well
        budget.spent = spent;
        await budget.save();

        return budget;
      })
    );

    res.json({
      success: true,
      budgets: updatedBudgets,
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Create or update budget
// @route   POST /api/v1/budgets
// @access  Private
const createBudget = async (req, res, next) => {
  try {
    const { category, limit, month, year } = req.body;

    if (!category || !limit || !month || !year) {
      res.status(400);
      throw new Error("Please enter all budget details");
    }

    const budgetLimit = Number(limit);
    const budgetMonth = Number(month);
    const budgetYear = Number(year);

    if (
      !Number.isFinite(budgetLimit) ||
      budgetLimit <= 0 ||
      !Number.isInteger(budgetMonth) ||
      budgetMonth < 1 ||
      budgetMonth > 12 ||
      !Number.isInteger(budgetYear)
    ) {
      res.status(400);
      throw new Error("Please enter valid budget details");
    }

    // Check if budget already exists
    let budget = await Budget.findOne({
      user: req.user._id,
      category,
      month: budgetMonth,
      year: budgetYear,
    });

    if (budget) {
      // Update existing budget limit
      budget.limit = budgetLimit;

      await budget.save();
    } else {
      // Calculate dates
      const startDate = new Date(
        budgetYear,
        budgetMonth - 1,
        1,
        0,
        0,
        0,
        0
      );

      const endDate = new Date(
        budgetYear,
        budgetMonth,
        0,
        23,
        59,
        59,
        999
      );

      // Find existing expenses
      const transactions = await Transaction.find({
        user: req.user._id,
        type: "expense",
        category,
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      });

      // Convert amounts to numbers
      const spent = transactions.reduce((sum, tx) => {
        return sum + (Number(tx.amount) || 0);
      }, 0);

      // Create budget
      budget = await Budget.create({
        user: req.user._id,
        category,
        limit: budgetLimit,
        spent,
        month: budgetMonth,
        year: budgetYear,
      });
    }

    res.status(201).json({
      success: true,
      budget,
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Update budget
// @route   PUT /api/v1/budgets/:id
// @access  Private
const updateBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!budget) {
      res.status(404);
      throw new Error("Budget not found");
    }

    // Update limit
    if (req.body.limit !== undefined) {
      const newLimit = Number(req.body.limit);

      if (!Number.isFinite(newLimit) || newLimit <= 0) {
        res.status(400);
        throw new Error("Please enter a valid budget limit");
      }

      budget.limit = newLimit;
    }

    const updated = await budget.save();

    res.json({
      success: true,
      budget: updated,
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Delete budget
// @route   DELETE /api/v1/budgets/:id
// @access  Private
const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!budget) {
      res.status(404);
      throw new Error("Budget not found");
    }

    await budget.deleteOne();

    res.json({
      success: true,
      message: "Budget deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
};