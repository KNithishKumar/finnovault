import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PlusCircle, PieChart, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { budgetsAPI } from '../services/api';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form Fields
  const [category, setCategory] = useState('Food');
  const [limit, setLimit] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const categories = ['Food', 'Travel', 'Fuel', 'Medical', 'Education', 'Shopping', 'Entertainment', 'Bills', 'Investment', 'Others'];

  const fetchBudgets = async () => {
    try {
      const res = await budgetsAPI.getBudgets({ month, year });
      if (res.data.success) {
        setBudgets(res.data.budgets);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [month, year]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget category cap?')) return;
    try {
      const res = await budgetsAPI.deleteBudget(id);
      if (res.data.success) {
        toast.success('Budget cap removed');
        fetchBudgets();
      }
    } catch (err) {
      toast.error('Error deleting budget');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!limit || Number(limit) <= 0) {
      return toast.error('Please enter a valid budget limit');
    }

    try {
      const res = await budgetsAPI.createBudget({
        category,
        limit: Number(limit),
        month: Number(month),
        year: Number(year),
      });

      if (res.data.success) {
        toast.success('Budget cap registered successfully');
        setLimit('');
        setShowAddForm(false);
        fetchBudgets();
      }
    } catch (err) {
      toast.error('Error registering budget');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Category Budgets</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Establish and monitor monthly category limits.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Month / Year pickers */}
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 px-3 py-2 rounded-xl text-xs font-semibold text-slate-750 dark:text-slate-300 focus:outline-none"
          >
            {Array.from({ length: 12 }, (_, idx) => (
              <option key={idx + 1} value={idx + 1}>
                {new Date(0, idx).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 px-3 py-2 rounded-xl text-xs font-semibold text-slate-750 dark:text-slate-300 focus:outline-none"
          >
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-xs font-semibold transition shadow-soft"
          >
            <PlusCircle className="w-4 h-4" />
            Set Budget
          </button>
        </div>
      </div>

      {/* Add Budget Form */}
      {showAddForm && (
        <div className="glass-card rounded-3xl p-5 md:p-6 border border-slate-200 dark:border-slate-900 shadow-soft animate-fadeIn max-w-xl">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4">Set Category Monthly Limit</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Select Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-800 dark:text-white"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Monthly Budget (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-800 dark:text-white font-medium"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-350 px-3.5 py-2 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-soft"
              >
                Save Limit
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Budgets Progress Bar Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgets.length === 0 ? (
          <p className="text-sm text-slate-400">No active budgets registered for this month.</p>
        ) : (
          budgets.map((bud) => {
            const pct = Math.min(((bud.spent / bud.limit) * 105), 105);
            const isBreached = bud.spent > bud.limit;
            const isNearLimit = bud.spent >= bud.limit * 0.8 && !isBreached;

            let barColor = 'bg-slate-500';
            if (isBreached) barColor = 'bg-red-500';
            else if (isNearLimit) barColor = 'bg-yellow-500';

            return (
              <div
                key={bud._id}
                className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-900 shadow-soft space-y-4"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-slate-400" />
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">{bud.category}</h4>
                  </div>
                  <div className="flex items-center gap-3">
                    {isBreached ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Breached
                      </span>
                    ) : isNearLimit ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-550 bg-yellow-550/10 px-2 py-0.5 rounded-full border border-yellow-555/20">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Warning (80%)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Safe
                      </span>
                    )}
                    <button
                      onClick={() => handleDelete(bud._id)}
                      className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
  <div className="flex justify-between text-xs font-semibold">
    <span className="text-slate-500 dark:text-slate-400">
      Monthly Spending Cap
    </span>

    <span
      className={
        isBreached
          ? "text-red-500 font-bold"
          : "text-slate-700 dark:text-slate-300"
      }
    >
      {((bud.spent / bud.limit) * 100).toFixed(0)}%
    </span>
  </div>

  {/* Progress Bar */}
  <div className="relative w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
    <div
      className={`${barColor} h-full rounded-full transition-all duration-500`}
      style={{ width: `${pct}%` }}
    />
  </div>

  <div className="flex justify-between text-[10px] text-slate-450 font-medium">
    <span>
      Spent: ₹
      {bud.spent.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </span>

    <span>
      Limit: ₹{bud.limit.toLocaleString()}
    </span>
  </div>
</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Budgets;
