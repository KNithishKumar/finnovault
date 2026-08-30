import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PlusCircle, Trash2, ArrowUpRight, ArrowDownRight, Phone, Calendar, Coins } from 'lucide-react';
import { debtAPI, accountsAPI } from '../services/api';

const BorrowLend = () => {
  const [debts, setDebts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // New Debt fields
  const [personName, setPersonName] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState('borrowed');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Payment form fields
  const [payDebtId, setPayDebtId] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payAccount, setPayAccount] = useState('');

  const fetchDebts = async () => {
    try {
      const res = await debtAPI.getDebts();
      if (res.data.success) {
        setDebts(res.data.debts);
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
          setPayAccount(res.data.accounts[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDebts();
    fetchAccounts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this debt record?')) return;
    try {
      const res = await debtAPI.deleteDebt(id);
      if (res.data.success) {
        toast.success('Debt record deleted');
        fetchDebts();
      }
    } catch (err) {
      toast.error('Error deleting record');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!personName || !amount || !dueDate) {
      return toast.error('Please enter name, amount, and due date');
    }

    try {
      const res = await debtAPI.createDebt({
        personName,
        phone,
        type,
        amount: Number(amount),
        dueDate,
      });

      if (res.data.success) {
        toast.success('Debt record created');
        setPersonName('');
        setPhone('');
        setAmount('');
        setDueDate('');
        setShowAddForm(false);
        fetchDebts();
      }
    } catch (err) {
      toast.error('Error creating debt record');
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) return toast.error('Enter valid payment amount');
    if (!payAccount) return toast.error('Select account');

    try {
      const res = await debtAPI.recordPayment(payDebtId, {
        amount: Number(payAmount),
        accountId: payAccount,
      });

      if (res.data.success) {
        toast.success('Debt payment logged successfully!');
        setPayAmount('');
        setPayDebtId(null);
        fetchDebts();
        fetchAccounts();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment processing failed');
    }
  };

  const totalBorrowed = debts.filter(d => d.type === 'borrowed' && d.status === 'pending').reduce((sum, d) => sum + d.remainingAmount, 0);
  const totalLent = debts.filter(d => d.type === 'lent' && d.status === 'pending').reduce((sum, d) => sum + d.remainingAmount, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Borrow & Lend Ledger</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Track peer-to-peer interest-free borrowings, lent sums, and repayments.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-xs font-semibold transition shadow-soft"
        >
          <PlusCircle className="w-4 h-4" />
          Log Debt
        </button>
      </div>

      {/* Aggregate metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-900 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Borrowed (Liabilities)</span>
            <h3 className="text-xl md:text-2xl font-black mt-1 text-red-500">₹{totalBorrowed.toLocaleString()}</h3>
          </div>
          <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20">
            <ArrowDownRight className="w-6 h-6" />
          </div>
        </div>
        <div className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-900 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Lent (Assets)</span>
            <h3 className="text-xl md:text-2xl font-black mt-1 text-accent">₹{totalLent.toLocaleString()}</h3>
          </div>
          <div className="p-3 bg-accent/10 text-accent rounded-2xl border border-accent/20">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Create Form */}
        {showAddForm && (
          <div className="glass-card rounded-3xl p-5 md:p-6 border border-slate-200 dark:border-slate-900 shadow-soft animate-fadeIn">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4">Log Peer Debt Entry</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Contact Name</label>
                  <input
                    type="text"
                    placeholder="e.g. David, Alice"
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-850 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="Optional contact no"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-850 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Principal Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-850 dark:text-white font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-850 dark:text-white"
                  >
                    <option value="borrowed">Borrowed</option>
                    <option value="lent">Lent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Repayment Deadline</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-850 dark:text-white"
                  required
                />
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
                  Create Record
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Repayment Form */}
        {payDebtId && (
          <div className="glass-card rounded-3xl p-5 md:p-6 border border-slate-200 dark:border-slate-900 shadow-soft animate-fadeIn">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4">Record Debt Settlement</h3>
            <form onSubmit={handlePayment} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Repayment Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-850 dark:text-white font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Wallet Account</label>
                  <select
                    value={payAccount}
                    onChange={(e) => setPayAccount(e.target.value)}
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
                  onClick={() => setPayDebtId(null)}
                  className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-350 px-3.5 py-2 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-soft"
                >
                  Log Repayment
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Debt list display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {debts.map((d) => (
          <div
            key={d._id}
            className="glass-card rounded-3xl p-5 md:p-6 border border-slate-200 dark:border-slate-900 shadow-soft flex flex-col justify-between h-56"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl border ₹{d.type === 'borrowed' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-accent/10 text-accent border-accent/20'}`}>
                  {d.type === 'borrowed' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{d.type}</span>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">{d.personName}</h4>
                </div>
              </div>
              <button
                onClick={() => handleDelete(d._id)}
                className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Core figures */}
            <div className="grid grid-cols-2 gap-4 border-y border-slate-100 dark:border-slate-900/50 py-3 my-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">Total Amount</span>
                <span className="font-bold text-slate-850 dark:text-white">₹{d.amount.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">Remaining</span>
                <span className="font-bold text-slate-850 dark:text-white">₹{d.remainingAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Phone/Reminders */}
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                {d.phone && (
                  <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {d.phone}
                  </span>
                )}
                <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Due: {new Date(d.dueDate).toLocaleDateString()}
                </span>
              </div>
              <button
                onClick={() => { setPayDebtId(d._id); setPayAmount(d.remainingAmount.toString()); }}
                disabled={d.status === 'paid'}
                className="flex items-center gap-1 bg-primary/10 hover:bg-primary text-primary hover:text-white disabled:bg-slate-150 disabled:text-slate-450 dark:disabled:bg-slate-900 font-semibold px-3 py-1.5 rounded-lg text-[10px] transition-all"
              >
                <Coins className="w-3.5 h-3.5" />
                {d.status === 'paid' ? 'Settled' : d.type === 'borrowed' ? 'Pay Back' : 'Collect'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BorrowLend;
