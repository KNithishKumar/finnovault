import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, PieChart, Pie, Cell } from 'recharts';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Coins,
  ShieldCheck,
  IndianRupee,
  Percent,
  LineChart,
  Brain,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { reportsAPI } from '../services/api';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await reportsAPI.getDashboard();
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const summary = data?.summary || {
    currentBalance: 0,
    totalAssets: 0,
    totalInvestments: 0,
    totalLoans: 0,
    borrowedAmount: 0,
    lentAmount: 0,
    netWorth: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    monthlySavings: 0,
    upcomingEMI: 0,
  };

  const statCards = [
    { title: 'Net Worth', amount: summary.netWorth, icon: ShieldCheck, color: 'text-primary bg-primary/10 border-primary/20', desc: 'Total Assets - Liabilities' },
    { title: 'Current Balance', amount: summary.currentBalance, icon: Wallet, color: 'text-teal-500 bg-teal-500/10 border-teal-500/20', desc: 'Liquid Cash & Bank balance' },
    { title: 'Monthly Income', amount: summary.monthlyIncome, icon: TrendingUp, color: 'text-accent bg-accent/10 border-accent/20', desc: 'Logged salary/freelance' },
    { title: 'Monthly Expenses', amount: summary.monthlyExpense, icon: TrendingDown, color: 'text-red-500 bg-red-500/10 border-red-500/20', desc: 'Spent this month' },
    { title: 'Total Assets', amount: summary.totalAssets, icon: Coins, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', desc: 'Properties, vehicles, metal' },
    { title: 'Investments', amount: summary.totalInvestments, icon: Percent, color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20', desc: 'Stocks, mutual funds, EPF' },
    { title: 'Active Loans', amount: summary.totalLoans, icon: LineChart, color: 'text-rose-500 bg-rose-500/10 border-rose-500/20', desc: 'Owed to bank' },
    { title: 'Upcoming EMI', amount: summary.upcomingEMI, icon: LineChart, color: 'text-violet-500 bg-violet-500/10 border-violet-500/20', desc: 'Due this month' },
  ];

  // Recharts Colors
  const COLORS = ['#2563EB', '#14B8A6', '#22C55E', '#EAB308', '#EF4444', '#8B5CF6', '#EC4899', '#64748B'];

  const getInsightIcon = (type) => {
    if (type === 'success') return <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />;
    if (type === 'danger') return <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />;
    return <Brain className="w-5 h-5 text-primary flex-shrink-0" />;
  };

  const getInsightColor = (type) => {
    if (type === 'success') return 'bg-accent/5 border-accent/20 dark:bg-accent/10';
    if (type === 'danger') return 'bg-red-500/5 border-red-500/20 dark:bg-red-500/10';
    return 'bg-primary/5 border-primary/20 dark:bg-primary/10';
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Financial Overview</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Welcome to your personal wealth dashboard.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400">
            Next cron check: Daily at midnight
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
  {statCards.map((card, idx) => {
    const formattedAmount = card.amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const amountLength = formattedAmount.length;

    return (
      <motion.div
        key={card.title}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.05 }}
        className="glass-card min-w-0 rounded-2xl p-4 md:p-5 border border-slate-200 dark:border-slate-900 shadow-soft flex flex-col justify-between"
      >
        <div className="flex items-center justify-between gap-3 mb-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-450 truncate">
            {card.title}
          </span>

          <div
            className={`p-2 rounded-xl border ${card.color} shrink-0`}
          >
            <card.icon className="w-4 h-4" />
          </div>
        </div>

        <div className="min-w-0">
          <h3
            className={`font-bold text-slate-800 dark:text-white leading-tight break-all ${
              amountLength > 18
                ? "text-xs md:text-base"
                : amountLength > 15
                  ? "text-sm md:text-lg"
                  : amountLength > 12
                    ? "text-base md:text-xl"
                    : "text-lg md:text-2xl"
            }`}
          >
            ₹{formattedAmount}
          </h3>

          <p className="text-[10px] text-slate-400 dark:text-slate-550 mt-1 truncate">
            {card.desc}
          </p>
        </div>
      </motion.div>
    );
  })}
</div>

      {/* AI Spending Insights Section */}
      <div className="glass-card rounded-3xl p-5 md:p-6 border border-slate-200 dark:border-slate-900 shadow-soft">
        <h2 className="text-base font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          AI Wealth & Spending Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.aiInsights?.map((insight, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-4 p-4 rounded-2xl border ₹{getInsightColor(insight.type)}`}
            >
              {getInsightIcon(insight.type)}
              <div>
                <h4 className="text-sm font-bold text-slate-850 dark:text-white">{insight.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{insight.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Chart */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-5 md:p-6 border border-slate-200 dark:border-slate-900 shadow-soft">
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-6">Cash Flow Analytics (Past 6 Months)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.charts?.cashFlow || []}>
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <ChartTooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="income" fill="#22C55E" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Pie Chart */}
        <div className="glass-card rounded-3xl p-5 md:p-6 border border-slate-200 dark:border-slate-900 shadow-soft">
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-6">Monthly Category Expenses</h3>
          <div className="h-60 relative flex items-center justify-center">
            {data?.charts?.expenseBreakdown?.length === 0 ? (
              <p className="text-xs text-slate-400">No expense records logged this month.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.charts?.expenseBreakdown || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {data?.charts?.expenseBreakdown?.map((entry, index) => (
                      <Cell key={`cell-₹{index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-2">
            {data?.charts?.expenseBreakdown?.slice(0, 4).map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                <span>{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Goals & Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions Table */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-5 md:p-6 border border-slate-200 dark:border-slate-900 shadow-soft overflow-hidden">
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">Recent Transactions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-900 text-slate-400 font-semibold uppercase">
                  <th className="py-3 px-2">Date</th>
                  <th className="py-3 px-2">Category</th>
                  <th className="py-3 px-2">Account</th>
                  <th className="py-3 px-2">Type</th>
                  <th className="py-3 px-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-900 text-slate-700 dark:text-slate-350">
                {data?.recentTransactions?.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-slate-400">No transactions recorded yet.</td>
                  </tr>
                ) : (
                  data?.recentTransactions?.map((tx) => (
                    <tr key={tx._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                      <td className="py-3.5 px-2">{new Date(tx.date).toLocaleDateString()}</td>
                      <td className="py-3.5 px-2 font-semibold text-slate-900 dark:text-white">{tx.category}</td>
                      <td className="py-3.5 px-2">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
                          style={{ backgroundColor: tx.account?.color || '#2563EB' }}
                        >
                          {tx.account?.name || 'Cash'}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 uppercase font-bold text-[10px]">
                        <span className={tx.type === 'income' ? 'text-accent' : 'text-red-500'}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-right font-bold text-slate-900 dark:text-white">
                        ₹{tx.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Savings Goals Widgets */}
        <div className="glass-card rounded-3xl p-5 md:p-6 border border-slate-200 dark:border-slate-900 shadow-soft">
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">Savings Progress</h3>
          <div className="space-y-4">
            {data?.goals?.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No active savings goals.</p>
            ) : (
              data?.goals?.slice(0, 3).map((goal) => {
                const pct = Math.min(((goal.currentAmount / goal.targetAmount) * 100), 100);
                return (
                  <div key={goal._id} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-300">{goal.name}</span>
                      <span className="text-slate-500">{pct.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: `₹{pct}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Saved: ₹{goal.currentAmount.toLocaleString()}</span>
                      <span>Target: ₹{goal.targetAmount.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
