import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PlusCircle, LineChart, Trash2, Calendar, Coins, History } from 'lucide-react';
import { loansAPI, accountsAPI } from '../services/api';

const Loans = () => {
  const [loans, setLoans] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // New Loan Form fields
  const [name, setName] = useState('');
  const [type, setType] = useState('Home Loan');
  const [principal, setPrincipal] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [termMonths, setTermMonths] = useState('');
  const [nextDueDate, setNextDueDate] = useState('');

  // Pay EMI modal/form
  const [payLoanId, setPayLoanId] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payAccount, setPayAccount] = useState('');

  const fetchLoans = async () => {
    try {
      const res = await loansAPI.getLoans();
      if (res.data.success) {
        setLoans(res.data.loans);
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
    fetchLoans();
    fetchAccounts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this loan record?')) return;
    try {
      const res = await loansAPI.deleteLoan(id);
      if (res.data.success) {
        toast.success('Loan record deleted');
        fetchLoans();
      }
    } catch (err) {
      toast.error('Error deleting loan');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name || !principal || !interestRate || !termMonths) {
      return toast.error('Please fill in required fields');
    }

    try {
      const res = await loansAPI.createLoan({
        name,
        type,
        principal: Number(principal),
        interestRate: Number(interestRate),
        termMonths: Number(termMonths),
        nextDueDate: nextDueDate || undefined,
      });

      if (res.data.success) {
        toast.success('Loan account registered');
        setName('');
        setPrincipal('');
        setInterestRate('');
        setTermMonths('');
        setNextDueDate('');
        setShowAddForm(false);
        fetchLoans();
      }
    } catch (err) {
      toast.error('Error registering loan');
    }
  };

  const handlePayEMI = async (e) => {
    e.preventDefault();
    if (!payAccount) return toast.error('Select source payment account');

    try {
      const res = await loansAPI.payEMI(payLoanId, {
        amount: payAmount ? Number(payAmount) : undefined, // server defaults to EMI
        accountId: payAccount,
      });

      if (res.data.success) {
        toast.success('EMI installment paid successfully!');
        setPayAmount('');
        setPayLoanId(null);
        fetchLoans();
        fetchAccounts();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'EMI Payment failed');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Active Bank Loans</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Track EMIs, principal reductions, amortization payments, and bank liabilities.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-xs font-semibold transition shadow-soft"
        >
          <PlusCircle className="w-4 h-4" />
          Log Loan Account
        </button>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Create Loan Form */}
        {showAddForm && (
          <div className="glass-card rounded-3xl p-5 md:p-6 border border-slate-200 dark:border-slate-900 shadow-soft animate-fadeIn">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4">Register Bank Loan</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 text-blue-950 dark:text-[#eff6ff]">Loan Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Chase Mortgage"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-850 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 text-blue-950 dark:text-[#eff6ff]">Loan Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-850 dark:text-white"
                  >
                    <option value="Home Loan">Home Loan</option>
                    <option value="Car Loan">Car Loan</option>
                    <option value="Education Loan">Education Loan</option>
                    <option value="Personal Loan">Personal Loan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 text-blue-950 dark:text-[#eff6ff]">Principal (₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={principal}
                    onChange={(e) => setPrincipal(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-850 dark:text-white font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 text-blue-950 dark:text-[#eff6ff]">APR Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 7.5"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-850 dark:text-white font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 text-blue-950 dark:text-[#eff6ff]">Term (Months)</label>
                  <input
                    type="number"
                    placeholder="e.g. 36"
                    value={termMonths}
                    onChange={(e) => setTermMonths(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-850 dark:text-white font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 text-blue-950 dark:text-[#eff6ff]">First Due Date</label>
                <input
                  type="date"
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-850 dark:text-white"
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
                  Save Loan
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Pay EMI Form */}
        {payLoanId && (
          <div className="glass-card rounded-3xl p-5 md:p-6 border border-slate-200 dark:border-slate-900 shadow-soft animate-fadeIn">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4">Pay EMI Installment</h3>
            <form onSubmit={handlePayEMI} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 text-blue-950 dark:text-[#eff6ff]">Amount (₹) <span className="text-[10px] text-slate-400 font-normal">(Leave blank for scheduled EMI)</span></label>
                  <input
                    type="number"
                    placeholder="Scheduled EMI"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-850 dark:text-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 text-blue-950 dark:text-[#eff6ff]">Debit Bank Account</label>
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
                  onClick={() => setPayLoanId(null)}
                  className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-350 px-3.5 py-2 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-soft"
                >
                  Submit Payment
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Active Loans Cards Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loans.length === 0 ? (
          <p className="text-sm text-slate-400">No active loans found.</p>
        ) : (
          loans.map((loan) => {
            const paidPct = Math.min((((loan.principal - loan.remainingBalance) / loan.principal) * 100), 100);
            return (
              <div
                key={loan._id}
                className="glass-card rounded-3xl p-5 md:p-6 border border-slate-200 dark:border-slate-900 shadow-soft space-y-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                      <LineChart className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{loan.type}</span>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">{loan.name}</h4>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(loan._id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Values */}
                <div className="grid grid-cols-3 gap-2 border-y border-slate-100 dark:border-slate-900/50 py-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Principal</span>
                    <span className="font-bold text-slate-850 dark:text-white">₹{loan.principal.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Remaining</span>
                    <span className="font-bold text-slate-850 dark:text-white">₹{loan.remainingBalance.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Monthly EMI</span>
                    <span className="font-extrabold text-rose-500">₹{loan.emi.toFixed(2)}</span>
                  </div>
                </div>

               {/* Amortization Progress */}
<div className="space-y-2">
  <div className="flex justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
    <span>Amortization Progress</span>
    <span className="text-rose-500">{paidPct.toFixed(0)}% paid</span>
  </div>

  <div className="relative w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
    {/* Paid / Current Progress */}
    <div
      className="bg-rose-500 h-full rounded-full transition-all duration-500"
      style={{ width: `${paidPct}%` }}
    />
    
    {/* Current Progress Marker */}
    <div
      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-rose-500 rounded-full shadow-sm transition-all duration-500"
      style={{ left: `calc(${paidPct}% - 6px)` }}
    />
  </div>

  <div className="flex justify-between text-[9px] text-slate-400">
    <span>Start</span>
    <span>Current</span>
    <span>Complete</span>
  </div>
</div>

                {/* Footer details */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Due: {new Date(loan.nextDueDate).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => { setPayLoanId(loan._id); setPayAmount(loan.emi.toFixed(2)); }}
                    disabled={loan.status === 'closed'}
                    className="flex items-center gap-1 bg-rose-500 hover:bg-rose-600 disabled:bg-slate-100 disabled:text-slate-450 dark:disabled:bg-slate-900 text-white font-semibold px-4 py-1.5 rounded-xl text-xs shadow-soft transition-all"
                  >
                    <Coins className="w-3.5 h-3.5" />
                    {loan.status === 'closed' ? 'Closed' : 'Pay EMI'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Loans;
