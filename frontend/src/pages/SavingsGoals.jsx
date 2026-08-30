import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PlusCircle, Target, Coins, Trash2, Calendar } from 'lucide-react';
import { goalsAPI, accountsAPI } from '../services/api';

const SavingsGoals = () => {
  const [goals, setGoals] = useState([]);
  const [accounts, setAccounts] = useState([]);

  // Forms states
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [initialAmount, setInitialAmount] = useState('');

  // Contribution state
  const [contribGoalId, setContribGoalId] = useState(null);
  const [contribAmount, setContribAmount] = useState('');
  const [contribAccount, setContribAccount] = useState('');

  const fetchGoals = async () => {
    try {
      const res = await goalsAPI.getGoals();
      if (res.data.success) {
        setGoals(res.data.goals);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await accountsAPI.getAccounts();
      if (res.data.success) {
        setAccounts(res.data.accounts);
        if (res.data.accounts.length > 0) {
          setContribAccount(res.data.accounts[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGoals();
    fetchAccounts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this savings goal?')) return;
    try {
      const res = await goalsAPI.deleteGoal(id);
      if (res.data.success) {
        toast.success('Savings goal deleted');
        fetchGoals();
      }
    } catch (err) {
      toast.error('Error deleting savings goal');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name || !targetAmount || !deadline) {
      return toast.error('Please enter goal name, target amount, and deadline');
    }

    try {
      const res = await goalsAPI.createGoal({
        name,
        targetAmount: Number(targetAmount),
        deadline,
        currentAmount: Number(initialAmount) || 0,
      });

      if (res.data.success) {
        toast.success('Savings goal established');
        setName('');
        setTargetAmount('');
        setInitialAmount('');
        setDeadline('');
        setShowAddForm(false);
        fetchGoals();
      }
    } catch (err) {
      toast.error('Error creating goal');
    }
  };

  const handleContribute = async (e) => {
    e.preventDefault();
    if (!contribAmount || Number(contribAmount) <= 0) return toast.error('Enter valid contribution amount');
    if (!contribAccount) return toast.error('Select source account');

    try {
      const res = await goalsAPI.contribute(contribGoalId, {
        amount: Number(contribAmount),
        accountId: contribAccount,
      });

      if (res.data.success) {
        toast.success('Contribution successful! Keep saving!');
        setContribAmount('');
        setContribGoalId(null);
        fetchGoals();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Contribution failed');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Savings Goals</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Establish and fund your long-term wealth milestones.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-xs font-semibold transition shadow-soft"
        >
          <PlusCircle className="w-4 h-4" />
          Create Goal
        </button>
      </div>

      {/* Forms Drawer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Create Form */}
        {showAddForm && (
          <div className="glass-card rounded-3xl p-5 md:p-6 border border-slate-200 dark:border-slate-900 shadow-soft animate-fadeIn">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4">Set Savings Milestone</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Goal Name</label>
                  <input
                    type="text"
                    placeholder="e.g. New Home, Hawaii Trip"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-800 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Target Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-800 dark:text-white font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Already Saved (₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={initialAmount}
                    onChange={(e) => setInitialAmount(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-800 dark:text-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Target Date</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-800 dark:text-white"
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
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Contribution Form */}
        {contribGoalId && (
          <div className="glass-card rounded-3xl p-5 md:p-6 border border-slate-200 dark:border-slate-900 shadow-soft animate-fadeIn">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4">Contribute to Goal</h3>
            <form onSubmit={handleContribute} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Fund Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={contribAmount}
                    onChange={(e) => setContribAmount(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-800 dark:text-white font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Source Wallet Account</label>
                  <select
                    value={contribAccount}
                    onChange={(e) => setContribAccount(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-850 dark:text-white"
                    required
                  >
                    {accounts.map((a) => (
                      <option key={a._id} value={a._id}>{a.name} (₹{a.balance.toFixed(2)})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setContribGoalId(null)}
                  className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-350 px-3.5 py-2 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-soft"
                >
                  Fund Goal
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Goals Display Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const pct = Math.min(((goal.currentAmount / goal.targetAmount) * 100), 100);
          return (
            <div
              key={goal._id}
              className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-900 shadow-soft flex flex-col justify-between h-56"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate max-w-[150px]">
                      {goal.name}
                    </h4>
                    <span className="text-[9px] text-slate-400 font-semibold uppercase flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3.5 h-3.5" />
                      Due: {new Date(goal.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(goal._id)}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Progress and numbers */}
              <div className="space-y-2 mt-4">
  <div className="flex justify-between text-xs font-semibold">
    <span className="text-slate-500 dark:text-slate-400">
      Milestone Progress
    </span>

    <span className="text-primary font-bold">
      {pct.toFixed(0)}%
    </span>
  </div>

 <div className="w-full bg-slate-700 h-3 rounded-full overflow-hidden">
  <div
    className="bg-accent h-full rounded-full transition-all duration-700 ease-out"
    style={{ width: `${pct}%` }}
  />
</div>

  <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-900 font-medium">
    <span>
      Saved: ₹{goal.currentAmount.toLocaleString()}
    </span>

    <span>
      Target: ₹{goal.targetAmount.toLocaleString()}
    </span>
  </div>
</div>

              {/* Fund button */}
              <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-900/50 mt-3">
                <button
                  onClick={() => setContribGoalId(goal._id)}
                  disabled={goal.isCompleted}
                  className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-white disabled:bg-slate-100 disabled:text-slate-450 dark:disabled:bg-slate-900 font-semibold px-3 py-1.5 rounded-lg text-[10px] transition-all"
                >
                  <Coins className="w-3.5 h-3.5" />
                  {goal.isCompleted ? 'Completed!' : 'Fund Goal'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SavingsGoals;
