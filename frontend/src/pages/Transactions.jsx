import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Search, Eye, Edit2, Trash2, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { transactionsAPI, accountsAPI } from '../services/api';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  
  // Filtering & Pagination State
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [account, setAccount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal / Form state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTxId, setEditTxId] = useState(null);

  // Edit fields
  const [editAmount, setEditAmount] = useState('');
  const [editType, setEditType] = useState('expense');
  const [editCategory, setEditCategory] = useState('');
  const [editAccount, setEditAccount] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPaymentMethod, setEditPaymentMethod] = useState('Bank');

  const categoriesByType = {
    income: ['Salary', 'Freelance', 'Business', 'Rental', 'Interest', 'Dividends', 'Others'],
    expense: ['Food', 'Travel', 'Fuel', 'Medical', 'Education', 'Shopping', 'Entertainment', 'Bills', 'Investment', 'Others'],
    investment: ['Stocks', 'Mutual Funds', 'SIP', 'FD', 'PPF', 'EPF', 'Gold', 'Crypto', 'Real Estate'],
    savings: ['Emergency Fund', 'Retirement', 'House Downpayment', 'Car Goal', 'Vacation', 'Savings Goal'],
    loan: ['Home Loan', 'Car Loan', 'Education Loan', 'Personal Loan', 'EMI Payment'],
    borrow: ['Borrowed from Friend', 'Borrowed from Family', 'Short-term Borrow'],
    lend: ['Lent to Friend', 'Lent to Family', 'Peer lending'],
    transfer: ['Transfer'],
  };

  const fetchAccounts = async () => {
    try {
      const res = await accountsAPI.getAccounts();
      if (res.data.success) {
        setAccounts(res.data.accounts);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const params = {
        page,
        limit: 10,
        search: search || undefined,
        type: type || undefined,
        category: category || undefined,
        account: account || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      const res = await transactionsAPI.getTransactions(params);
      if (res.data.success) {
        setTransactions(res.data.transactions);
        setTotalPages(res.data.pages);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [page, search, type, category, account, startDate, endDate]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction? This will adjust your account balances accordingly.')) return;
    try {
      const res = await transactionsAPI.deleteTransaction(id);
      if (res.data.success) {
        toast.success('Transaction deleted and balances reconciled');
        fetchTransactions();
      }
    } catch (err) {
      toast.error('Error deleting transaction');
    }
  };

  const openEditModal = (tx) => {
    setEditTxId(tx._id);
    setEditAmount(tx.amount.toString());
    setEditType(tx.type);
    setEditCategory(tx.category);
    setEditAccount(tx.account?._id || '');
    setEditDate(new Date(tx.date).toISOString().split('T')[0]);
    setEditDescription(tx.description || '');
    setEditPaymentMethod(tx.paymentMethod);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editAmount || Number(editAmount) <= 0) return toast.error('Please enter a valid amount');
    if (!editAccount) return toast.error('Please select an account');

    try {
      const formData = new FormData();
      formData.append('type', editType);
      formData.append('amount', Number(editAmount));
      formData.append('category', editCategory);
      formData.append('account', editAccount);
      formData.append('date', editDate);
      formData.append('description', editDescription);
      formData.append('paymentMethod', editPaymentMethod);

      const res = await transactionsAPI.updateTransaction(editTxId, formData);
      if (res.data.success) {
        toast.success('Transaction updated successfully');
        setIsEditOpen(false);
        fetchTransactions();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating transaction');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Ledger Transactions</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">View and manage your entire cash ledger.</p>
      </div>

      {/* Filter Panel */}
      <div className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-900 shadow-soft space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Search bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="w-4 h-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Search description..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-white"
            />
          </div>

          {/* Type Filter */}
          <select
            value={type}
            onChange={(e) => { setType(e.target.value); setCategory(''); setPage(1); }}
            className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-white"
          >
            <option value="">All Types</option>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
            <option value="transfer">Transfer</option>
            <option value="investment">Investment</option>
            <option value="savings">Savings</option>
            <option value="loan">Loan EMI</option>
            <option value="borrow">Borrow Debt</option>
            <option value="lend">Lend Debt</option>
          </select>

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-white"
            disabled={!type}
          >
            <option value="">All Categories</option>
            {type && categoriesByType[type]?.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Account Filter */}
          <select
            value={account}
            onChange={(e) => { setAccount(e.target.value); setPage(1); }}
            className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-white"
          >
            <option value="">All Accounts</option>
            {accounts.map((acc) => (
              <option key={acc._id} value={acc._id}>{acc.name}</option>
            ))}
          </select>
        </div>

        {/* Date Ranges */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">From</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">To</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Transactions Ledger Table */}
      <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-900 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-900 text-slate-400 font-semibold uppercase">
                <th className="py-4 px-4">Date</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Account</th>
                <th className="py-4 px-4">Type</th>
                <th className="py-4 px-4">Description</th>
                <th className="py-4 px-4">Attachment</th>
                <th className="py-4 px-4 text-right">Amount</th>
                <th className="py-4 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 dark:divide-slate-900 text-slate-700 dark:text-slate-300">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-slate-400">No transactions match filters.</td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                    <td className="py-3.5 px-4">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">{tx.category}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-white"
                        style={{ backgroundColor: tx.account?.color || '#2563EB' }}
                      >
                        {tx.account?.name || 'Cash'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 uppercase font-bold text-[10px]">
                      <span className={['income', 'borrow'].includes(tx.type) ? 'text-accent' : 'text-red-500'}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate">{tx.description || '-'}</td>
                    <td className="py-3.5 px-4">
                      {tx.attachment ? (
                        <a
                          href={`http://localhost:5000₹{tx.attachment}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-primary hover:underline font-semibold"
                        >
                          <FileText className="w-4 h-4" />
                          View
                        </a>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                      ₹{tx.amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(tx)}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(tx._id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-red-500/10 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-900">
            <span className="text-xs text-slate-400">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 disabled:opacity-50 text-slate-600 dark:text-slate-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 disabled:opacity-50 text-slate-600 dark:text-slate-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-card rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">Edit Transaction</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Type</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-850 dark:text-white"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                    <option value="investment">Investment</option>
                    <option value="savings">Savings</option>
                    <option value="loan">Loan EMI</option>
                    <option value="borrow">Borrow</option>
                    <option value="lend">Lend</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-850 dark:text-white font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-850 dark:text-white"
                  >
                    {categoriesByType[editType]?.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Account</label>
                  <select
                    value={editAccount}
                    onChange={(e) => setEditAccount(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-850 dark:text-white"
                    required
                  >
                    {accounts.map((acc) => (
                      <option key={acc._id} value={acc._id}>{acc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Date</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-850 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Description</label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-850 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-350 px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-soft"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Transactions;
