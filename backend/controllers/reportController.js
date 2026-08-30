const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const Asset = require('../models/Asset');
const Investment = require('../models/Investment');
const Loan = require('../models/Loan');
const BorrowLend = require('../models/BorrowLend');
const SavingsGoal = require('../models/SavingsGoal');
const Budget = require('../models/Budget');
const { generateFinancialReportPDF } = require('../services/pdfService');
const { generateFinancialReportExcel, generateFinancialReportCSV } = require('../services/excelService');
const { generateAISpendingInsights } = require('../services/aiService');

// @desc    Get dashboard metrics & charts
// @route   GET /api/v1/reports/dashboard
// @access  Private
const getDashboardAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

    // 1. Core Summary Metrics
    const accounts = await Account.find({ user: userId });
    const cashBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    const assetsList = await Asset.find({ user: userId });
    const totalAssetsVal = assetsList.reduce((sum, ast) => sum + ast.currentPrice, 0);

    const investmentsList = await Investment.find({ user: userId });
    const totalInvestmentsVal = investmentsList.reduce((sum, inv) => sum + inv.currentValue, 0);

    const loansList = await Loan.find({ user: userId, status: 'active' });
    const totalLoansVal = loansList.reduce((sum, loan) => sum + loan.remainingBalance, 0);

    const debtList = await BorrowLend.find({ user: userId, status: 'pending' });
    const borrowedVal = debtList.filter(d => d.type === 'borrowed').reduce((sum, d) => sum + d.remainingAmount, 0);
    const lentVal = debtList.filter(d => d.type === 'lent').reduce((sum, d) => sum + d.remainingAmount, 0);

    // Net Worth = (Cash + Assets + Investments + Lent) - (Loans + Borrowed)
    const netWorth = (cashBalance + totalAssetsVal + totalInvestmentsVal + lentVal) - (totalLoansVal + borrowedVal);

    // 2. Monthly Stats (Income, Expense, Savings)
    const monthlyTransactions = await Transaction.find({
      user: userId,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const monthlyIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const monthlyExpense = monthlyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const monthlySavings = monthlyTransactions.filter(t => t.type === 'savings').reduce((sum, t) => sum + t.amount, 0);
    
    // Upcoming EMI
    const upcomingEMIVal = loansList.reduce((sum, loan) => sum + loan.emi, 0);

    // 3. Expense Breakdown (Pie Chart)
    const categoriesMap = {};
    monthlyTransactions.filter(t => t.type === 'expense').forEach((tx) => {
      categoriesMap[tx.category] = (categoriesMap[tx.category] || 0) + tx.amount;
    });
    const expenseBreakdown = Object.keys(categoriesMap).map((cat) => ({
      name: cat,
      value: categoriesMap[cat],
    }));

    // 4. Cash Flow Over Last 6 Months (Bar Chart)
    const cashFlow = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0, 23, 59, 59);
      
      const txs = await Transaction.find({
        user: userId,
        date: { $gte: monthStart, $lte: monthEnd },
      });

      const inc = txs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const exp = txs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

      cashFlow.push({
        month: monthStart.toLocaleString('default', { month: 'short' }),
        income: inc,
        expense: exp,
      });
    }

    // 5. Savings Goals Progress
    const goals = await SavingsGoal.find({ user: userId });

    // 6. Budgets
    const budgets = await Budget.find({ user: userId, month: today.getMonth() + 1, year: today.getFullYear() });

    // 7. Recent Transactions (latest 5)
    const recentTransactions = await Transaction.find({ user: userId })
      .sort('-date')
      .limit(5)
      .populate('account', 'name color type');

    // 8. AI Insights
    const allUserTxs = await Transaction.find({ user: userId }).sort('-date');
    const aiInsights = generateAISpendingInsights(req.user, allUserTxs, budgets, goals);

    res.json({
      success: true,
      summary: {
        currentBalance: cashBalance,
        totalAssets: totalAssetsVal,
        totalInvestments: totalInvestmentsVal,
        totalLoans: totalLoansVal,
        borrowedAmount: borrowedVal,
        lentAmount: lentVal,
        netWorth,
        monthlyIncome,
        monthlyExpense,
        monthlySavings,
        upcomingEMI: upcomingEMIVal,
      },
      charts: {
        expenseBreakdown,
        cashFlow,
      },
      goals,
      budgets,
      recentTransactions,
      aiInsights,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download PDF, Excel, or CSV report
// @route   GET /api/v1/reports/download
// @access  Private
const downloadReport = async (req, res, next) => {
  try {
    const { format = 'pdf', range = 'monthly' } = req.query;
    const userId = req.user._id;

    // Filter time range
    const today = new Date();
    let startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    let endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

    if (range === 'yearly') {
      startDate = new Date(today.getFullYear(), 0, 1);
      endDate = new Date(today.getFullYear(), 11, 31, 23, 59, 59);
    } else if (range === 'weekly') {
      startDate = new Date();
      startDate.setDate(today.getDate() - 7);
    }

    const transactions = await Transaction.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
    }).sort('-date');

    const accounts = await Account.find({ user: userId });
    const cashBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const assetsList = await Asset.find({ user: userId });
    const totalAssetsVal = assetsList.reduce((sum, ast) => sum + ast.currentPrice, 0);
    const investmentsList = await Investment.find({ user: userId });
    const totalInvestmentsVal = investmentsList.reduce((sum, inv) => sum + inv.currentValue, 0);
    const loansList = await Loan.find({ user: userId, status: 'active' });
    const totalLoansVal = loansList.reduce((sum, loan) => sum + loan.remainingBalance, 0);

    const netWorth = (cashBalance + totalAssetsVal + totalInvestmentsVal) - totalLoansVal;

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    const reportData = {
      user: req.user,
      transactions,
      summary: {
        totalIncome,
        totalExpense,
        netCashFlow: totalIncome - totalExpense,
        netWorth,
      },
    };

    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=FinVault_Report_${range}_${Date.now()}.pdf`);
      generateFinancialReportPDF(reportData, res);
    } else if (format === 'excel') {
      const buffer = await generateFinancialReportExcel(reportData);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=FinVault_Report_${range}_${Date.now()}.xlsx`);
      res.send(buffer);
    } else if (format === 'csv') {
      const buffer = generateFinancialReportCSV(reportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=FinVault_Report_${range}_${Date.now()}.csv`);
      res.send(buffer);
    } else {
      res.status(400);
      throw new Error('Unsupported report format');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardAnalytics,
  downloadReport,
};
