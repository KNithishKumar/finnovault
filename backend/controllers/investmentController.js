const Investment = require('../models/Investment');

// Helper to compute ROI & CAGR
const enrichInvestmentMetrics = (inv) => {
  const invested = inv.investedAmount || 0;
  const current = inv.currentValue || 0;
  const profitLoss = current - invested;
  const roi = invested > 0 ? (profitLoss / invested) * 100 : 0;

  // CAGR calculation
  const pDate = new Date(inv.purchaseDate);
  const now = new Date();
  let diffYears = (now - pDate) / (1000 * 60 * 60 * 24 * 365.25);
  if (diffYears < 0.08) diffYears = 0.08; // Min 1 month approx to avoid extreme figures

  let cagr = 0;
  if (invested > 0 && current > 0) {
    cagr = (Math.pow(current / invested, 1 / diffYears) - 1) * 100;
  }

  return {
    ...inv.toObject(),
    profitLoss,
    roi,
    cagr,
  };
};

// @desc    Get all investments
// @route   GET /api/v1/investments
// @access  Private
const getInvestments = async (req, res, next) => {
  try {
    const investments = await Investment.find({ user: req.user._id });
    const enriched = investments.map(enrichInvestmentMetrics);
    res.json({ success: true, investments: enriched });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new investment
// @route   POST /api/v1/investments
// @access  Private
const createInvestment = async (req, res, next) => {
  try {
    const { name, type, investedAmount, currentValue, units, purchaseDate } = req.body;

    if (!name || !type || investedAmount === undefined || currentValue === undefined) {
      res.status(400);
      throw new Error('Please add name, type, invested amount, and current value');
    }

    const investment = await Investment.create({
      user: req.user._id,
      name,
      type,
      investedAmount,
      currentValue,
      units: units || 0,
      purchaseDate: purchaseDate || new Date(),
    });

    const enriched = enrichInvestmentMetrics(investment);
    res.status(201).json({ success: true, investment: enriched });
  } catch (error) {
    next(error);
  }
};

// @desc    Update investment
// @route   PUT /api/v1/investments/:id
// @access  Private
const updateInvestment = async (req, res, next) => {
  try {
    const investment = await Investment.findOne({ _id: req.params.id, user: req.user._id });

    if (!investment) {
      res.status(404);
      throw new Error('Investment not found');
    }

    investment.name = req.body.name || investment.name;
    investment.type = req.body.type || investment.type;
    investment.investedAmount = req.body.investedAmount !== undefined ? req.body.investedAmount : investment.investedAmount;
    investment.currentValue = req.body.currentValue !== undefined ? req.body.currentValue : investment.currentValue;
    investment.units = req.body.units !== undefined ? req.body.units : investment.units;
    investment.purchaseDate = req.body.purchaseDate || investment.purchaseDate;

    const saved = await investment.save();
    const enriched = enrichInvestmentMetrics(saved);

    res.json({ success: true, investment: enriched });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete investment
// @route   DELETE /api/v1/investments/:id
// @access  Private
const deleteInvestment = async (req, res, next) => {
  try {
    const investment = await Investment.findOne({ _id: req.params.id, user: req.user._id });

    if (!investment) {
      res.status(404);
      throw new Error('Investment not found');
    }

    await investment.deleteOne();
    res.json({ success: true, message: 'Investment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInvestments,
  createInvestment,
  updateInvestment,
  deleteInvestment,
};
