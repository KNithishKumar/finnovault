const generateAISpendingInsights = (userData, transactions, budgets, goals) => {
  const insights = [];

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // Insight 1: Savings rate
  if (totalIncome > 0) {
    const savingsRate = ((totalIncome - totalExpense) / totalIncome) * 100;
    if (savingsRate > 20) {
      insights.push({
        type: 'success',
        title: 'Healthy Savings Rate',
        message: `Excellent job! You saved ${savingsRate.toFixed(1)}% of your income this month. Keep this up to supercharge your wealth goals.`,
      });
    } else if (savingsRate > 0) {
      insights.push({
        type: 'info',
        title: 'Room to Grow',
        message: `Your savings rate is ${savingsRate.toFixed(1)}%. Financial advisors recommend saving at least 20% of your income. Check your top spending categories for cutback options.`,
      });
    } else {
      insights.push({
        type: 'danger',
        title: 'Deficit Alert',
        message: 'Your expenses exceeded your income this month. We recommend reviewing your subscriptions or large expenses immediately to balance your budget.',
      });
    }
  }

  // Insight 2: Category warning
  const categoryExpenses = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + t.amount;
    });

  const topCategory = Object.keys(categoryExpenses).reduce((a, b) => categoryExpenses[a] > categoryExpenses[b] ? a : b, null);
  if (topCategory) {
    const topPct = (categoryExpenses[topCategory] / totalExpense) * 100;
    insights.push({
      type: 'warning',
      title: 'Top Category Distribution',
      message: `You spent ₹${categoryExpenses[topCategory].toFixed(2)} (${topPct.toFixed(1)}% of total expenses) on ${topCategory}. Consider setting a dedicated budget cap for this category next month.`,
    });
  }

  // Insight 3: Budget check
  const overBudgets = budgets.filter(b => b.spent > b.limit);
  if (overBudgets.length > 0) {
    insights.push({
      type: 'danger',
      title: 'Budget Breaches Detected',
      message: `You exceeded your budget limits in ${overBudgets.length} categories: ${overBudgets.map(b => b.category).join(', ')}. Try modifying your spending thresholds or tracking expenses weekly.`,
    });
  } else if (budgets.length > 0) {
    insights.push({
      type: 'success',
      title: 'Budgets on Track',
      message: 'Awesome! All your active budgets are within limits. Great self-discipline this month!',
    });
  }

  // Insight 4: Savings goal checklist
  const closeGoals = goals.filter(g => (g.currentAmount / g.targetAmount) >= 0.8 && g.currentAmount < g.targetAmount);
  if (closeGoals.length > 0) {
    insights.push({
      type: 'info',
      title: 'Milestone Nearby!',
      message: `You are over 80% of the way to achieving your goal: "${closeGoals[0].name}". A small final push of $${(closeGoals[0].targetAmount - closeGoals[0].currentAmount).toFixed(2)} will cross the finish line!`,
    });
  }

  // Fallback if no data
  if (insights.length === 0) {
    insights.push({
      type: 'info',
      title: 'Getting Started',
      message: 'Welcome to Finnovault! Log your first transaction or set a savings goal, and our AI scanner will analyze your spending habits to provide optimization tips.',
    });
  }

  return insights;
};

module.exports = { generateAISpendingInsights };
