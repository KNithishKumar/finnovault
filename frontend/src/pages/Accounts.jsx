import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Pin, Trash2, ArrowLeftRight, PlusCircle, Check } from 'lucide-react';
import { accountsAPI } from '../services/api';

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  
  // New account form
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('Savings');
  const [balance, setBalance] = useState('');
  const [color, setColor] = useState('#2563EB');

  // Transfer form
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferDesc, setTransferDesc] = useState('');

  const colorsList = ['#2563EB', '#14B8A6', '#10B981', '#EAB308', '#EF4444', '#8B5CF6', '#EC4899', '#64748B'];

  const fetchAccounts = async () => {
    try {
      const res = await accountsAPI.getAccounts();
      if (res.data.success) {
        setAccounts(res.data.accounts);
        if (res.data.accounts.length > 0) {
          setFromAccount(res.data.accounts[0]._id);
          if (res.data.accounts.length > 1) {
            setToAccount(res.data.accounts[1]._id);
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handlePinToggle = async (acc) => {
    try {
      const res = await accountsAPI.updateAccount(acc._id, { isPinned: !acc.isPinned });
      if (res.data.success) {
        toast.success(acc.isPinned ? 'Account unpinned' : 'Account pinned to top');
        fetchAccounts();
      }
    } catch (err) {
      toast.error('Error updating pin status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this account? This will permanently delete all associated transactions.')) return;
    try {
      const res = await accountsAPI.deleteAccount(id);
      if (res.data.success) {
        toast.success('Account deleted successfully');
        fetchAccounts();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting account');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name) return toast.error('Please enter account name');

    try {
      const res = await accountsAPI.createAccount({
        name,
        type,
        balance: Number(balance) || 0,
        color,
      });

      if (res.data.success) {
        toast.success('Account created successfully');
        setName('');
        setBalance('');
        setShowAddForm(false);
        fetchAccounts();
      }
    } catch (err) {
      toast.error('Error creating account');
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!fromAccount || !toAccount) return toast.error('Select source and destination accounts');
    if (fromAccount === toAccount) return toast.error('Cannot transfer to the same account');
    if (!transferAmount || Number(transferAmount) <= 0) return toast.error('Enter valid transfer amount');

    try {
      const res = await accountsAPI.transfer({
        fromAccountId: fromAccount,
        toAccountId: toAccount,
        amount: Number(transferAmount),
        description: transferDesc,
      });

      if (res.data.success) {
        toast.success('Transfer successful!');
        setTransferAmount('');
        setTransferDesc('');
        setShowTransferForm(false);
        fetchAccounts();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transfer failed');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Bank Accounts & Wallets</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage multiple asset containers and balances.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setShowTransferForm(true); setShowAddForm(false); }}
            className="flex items-center gap-2 border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-900 px-4 py-2 rounded-xl text-xs font-semibold transition text-slate-700 dark:text-slate-300"
          >
            <ArrowLeftRight className="w-4 h-4" />
            Transfer Funds
          </button>
          <button
            onClick={() => { setShowAddForm(true); setShowTransferForm(false); }}
            className="flex items-center gap-2 bg-blue-950 dark:bg-[#eff6ff] dark:text-blue-950 hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-xs font-semibold transition shadow-soft shadow-primary/10"
          >
            <PlusCircle className="w-4 h-4" />
            New Account
          </button>
        </div>
      </div>

      {/* Forms Grid */}
      {(showAddForm || showTransferForm) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
          {/* Add Account Form */}
          {showAddForm && (
            <div className="glass-card rounded-3xl p-5 md:p-6 border border-slate-200 dark:border-slate-900 shadow-soft">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4">Create New Account</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-blue-950 dark:text-[#eff6ff] mb-1">Account Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Chase Bank, UPI Pay"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white-900 dark:bg-[#f8fafc] text-blue-950 dark:text-[#eff6ff] border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-blue-950 dark:text-[#eff6ff] mb-1">Account Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full bg-[#effbff] dark:bg-[#effbff] border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-800 dark:text-blue-950"
                    >
                      <option value="Savings">Savings Account</option>
                      <option value="Current">Current Account</option>
                      <option value="Cash Wallet">Cash Wallet</option>
                      <option value="UPI Wallet">UPI Wallet</option>
                      <option value="Credit Card">Credit Card</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-blue-950 dark:text-[#eff6ff] mb-1">Initial Balance (₹)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={balance}
                      onChange={(e) => setBalance(e.target.value)}
                      className="w-full bg-white-900 dark:bg-[#f8fafc] text-blue-950 dark:text-blue-950 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-blue-950 dark:text-[#eff6ff] mb-1">Card Accent Color</label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {colorsList.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          style={{ backgroundColor: c }}
                          className="w-6 h-6 rounded-full border border-white dark:border-slate-900 flex items-center justify-center"
                        >
                          {color === c && <Check className="w-3.5 h-3.5 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="bg-slate-100 dark:bg-slate-900 text-blue-950 dark:text-[#eff6ff] px-3.5 py-2 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-soft"
                  >
                    Save Account
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Transfer Funds Form */}
          {showTransferForm && (
            <div className="glass-card rounded-3xl p-5 md:p-6 border border-slate-200 dark:border-slate-900 shadow-soft">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4">Transfer Between Accounts</h3>
              <form onSubmit={handleTransfer} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-blue-950 dark:text-[#eff6ff] mb-1">From Account</label>
                    <select
                      value={fromAccount}
                      onChange={(e) => setFromAccount(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-800 dark:text-white"
                      required
                    >
                      {accounts.map((a) => (
                        <option key={a._id} value={a._id}>{a.name} (₹{a.balance.toFixed(2)})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-blue-950 dark:text-[#eff6ff] mb-1">To Account</label>
                    <select
                      value={toAccount}
                      onChange={(e) => setToAccount(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-800 dark:text-white"
                      required
                    >
                      {accounts.map((a) => (
                        <option key={a._id} value={a._id}>{a.name} (₹{a.balance.toFixed(2)})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-blue-950 dark:text-[#eff6ff] mb-1">Transfer Amount (₹)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-800 dark:text-white font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-blue-950 dark:text-[#eff6ff] mb-1">Memo / Note</label>
                    <input
                      type="text"
                      placeholder="Transfer description"
                      value={transferDesc}
                      onChange={(e) => setTransferDesc(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowTransferForm(false)}
                    className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-350 px-3.5 py-2 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-soft"
                  >
                    Transfer
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Accounts List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((acc) => (
          <div
            key={acc._id}
            className="rounded-3xl border border-slate-200/50 dark:border-slate-905 overflow-hidden shadow-soft flex flex-col justify-between h-48 relative text-white"
            style={{
              background: `linear-gradient(135deg, ₹{acc.color}DD, ₹{acc.color})`,
            }}
          >
            {/* Header info */}
            <div className="p-5 flex items-start justify-between text-blue-950 dark:text-[#eff6ff]">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">{acc.type}</span>
                <h3 className="text-lg font-bold truncate mt-0.5">{acc.name}</h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePinToggle(acc)}
                  className={`p-1.5 rounded-lg hover:bg-white/10 transition ₹{acc.isPinned ? 'text-yellow-300' : 'text-white/60'}`}
                >
                  <Pin className="w-4 h-4 fill-current text-blue-950 dark:text-[#eff6ff]" />
                </button>
                <button
                  onClick={() => handleDelete(acc._id)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition text-blue-950 dark:text-[#eff6ff]"
                >
                  <Trash2 className="w-4 h-4 text-blue-950 dark:text-[#eff6ff] " />
                </button>
              </div>
            </div>

            {/* Account numbers and balance */}
            <div className="p-5 border-t border-white/10 bg-black/10 flex items-center justify-between text-blue-950 dark:text-[#eff6ff]">
              <div>
                <span className="text-[10px] uppercase opacity-70 text- blue-950 dark:text-[#eff6ff]">Current Balance</span>
                <h4 className="text-xl font-extrabold tracking-tight text-blue-950 dark:text-[#eff6ff]">
                  ₹{acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h4>
              </div>
              <div className="text-[10px] text-right font-mono opacity-80 text-blue-950 dark:text-[#eff6ff]">
                **** **** **** {acc._id.slice(-4).toUpperCase()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Accounts;
