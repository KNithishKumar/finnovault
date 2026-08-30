import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { X, Upload } from 'lucide-react';
import { accountsAPI, transactionsAPI } from '../services/api';

const categoriesByType = {
  income: [
    'Salary',
    'Freelance',
    'Business',
    'Rental',
    'Interest',
    'Dividends',
    'Others',
  ],
  expense: [
    'Food',
    'Travel',
    'Fuel',
    'Medical',
    'Education',
    'Shopping',
    'Entertainment',
    'Bills',
    'Investment',
    'Others',
  ],
  investment: [
    'Stocks',
    'Mutual Funds',
    'SIP',
    'FD',
    'PPF',
    'EPF',
    'Gold',
    'Crypto',
    'Real Estate',
  ],
  savings: [
    'Emergency Fund',
    'Retirement',
    'House Downpayment',
    'Car Goal',
    'Vacation',
    'Savings Goal',
  ],
  loan: [
    'Home Loan',
    'Car Loan',
    'Education Loan',
    'Personal Loan',
    'EMI Payment',
  ],
  borrow: [
    'Borrowed from Friend',
    'Borrowed from Family',
    'Short-term Borrow',
  ],
  lend: [
    'Lent to Friend',
    'Lent to Family',
    'Peer Lending',
  ],
  transfer: ['Transfer'],
};

const QuickAddModal = ({
  isOpen,
  onClose,
  defaultType = 'expense',
  onTransactionAdded,
}) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);

  const [type, setType] = useState(
    categoriesByType[defaultType] ? defaultType : 'expense'
  );

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [account, setAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank');
  const [date, setDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [description, setDescription] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState('none');
  const [attachment, setAttachment] = useState(null);

  const fetchAccounts = async () => {
    try {
      const res = await accountsAPI.getAccounts();

      if (res.data.success) {
        const fetchedAccounts = res.data.accounts || [];

        setAccounts(fetchedAccounts);

        if (fetchedAccounts.length > 0) {
          setAccount(fetchedAccounts[0]._id);

          if (fetchedAccounts.length > 1) {
            setToAccount(fetchedAccounts[1]._id);
          } else {
            setToAccount('');
          }
        } else {
          setAccount('');
          setToAccount('');
        }
      }
    } catch (err) {
      console.error('Error fetching accounts:', err);
      toast.error(
        err.response?.data?.message || 'Unable to load accounts'
      );
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    fetchAccounts();

    const validType = categoriesByType[defaultType]
      ? defaultType
      : 'expense';

    setType(validType);
    setAmount('');
    setCategory(categoriesByType[validType]?.[0] || '');
    setDescription('');
    setIsRecurring(false);
    setRecurrenceFrequency('none');
    setAttachment(null);
    setPaymentMethod('Bank');
    setDate(new Date().toISOString().split('T')[0]);
  }, [isOpen, defaultType]);

  useEffect(() => {
    const categories = categoriesByType[type] || [];

    if (categories.length > 0) {
      setCategory(categories[0]);
    } else {
      setCategory('');
    }
  }, [type]);

  const handleTypeChange = (e) => {
    const newType = e.target.value;

    setType(newType);

    const categories = categoriesByType[newType] || [];

    setCategory(categories.length > 0 ? categories[0] : '');
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || Number(amount) <= 0) {
      return toast.error('Please enter a valid amount');
    }

    if (!account) {
      return toast.error('Please select an account');
    }

    setLoading(true);

    try {
      if (type === 'transfer') {
        if (!toAccount) {
          throw new Error('Please select destination account');
        }

        if (account === toAccount) {
          throw new Error(
            'Source and destination accounts cannot be the same'
          );
        }

        const res = await accountsAPI.transfer({
          fromAccountId: account,
          toAccountId: toAccount,
          amount: Number(amount),
          description,
        });

        if (res.data.success) {
          toast.success('Funds transferred successfully!');

          if (onTransactionAdded) {
            onTransactionAdded();
          }

          onClose();
        }
      } else {
        const formData = new FormData();

        formData.append('type', type);
        formData.append('amount', Number(amount));
        formData.append('category', category);
        formData.append('account', account);
        formData.append('paymentMethod', paymentMethod);
        formData.append('date', date);
        formData.append('description', description);
        formData.append('isRecurring', isRecurring);
        formData.append(
          'recurrenceFrequency',
          isRecurring ? recurrenceFrequency : 'none'
        );

        if (attachment) {
          formData.append('attachment', attachment);
        }

        const res = await transactionsAPI.createTransaction(formData);

        if (res.data.success) {
          toast.success('Transaction added successfully!');

          if (onTransactionAdded) {
            onTransactionAdded();
          }

          onClose();
        }
      }
    } catch (err) {
      console.error('Transaction Error:', err);

      toast.error(
        err.response?.data?.message ||
          err.message ||
          'Error saving transaction'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  const currentCategories = categoriesByType[type] || [];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl glass-card rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/50 dark:border-slate-800/50">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white">
            Quick Add Transaction
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Main Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Transaction Type */}
            <div>
              <label className="block text-xs font-semibold text-blue-1000 dark:text-[#eff6ff] mb-1">
                Transaction Type
              </label>

              <select
                value={type}
                onChange={handleTypeChange}
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-800 dark:text-white"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
                <option value="transfer">Transfer between Accounts</option>
                <option value="investment">Investment</option>
                <option value="savings">Savings</option>
                <option value="loan">Loan EMI</option>
                <option value="borrow">Borrow Debt</option>
                <option value="lend">Lend Debt</option>
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold  text-blue-1000 dark:text-[#eff6ff] mb-1">
                Amount (₹)
              </label>

              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-800 dark:text-white font-medium"
                required
              />
            </div>

            {/* Category */}
            {type !== 'transfer' && (
              <div>
                <label className="block text-xs font-semibold  text-blue-1000 dark:text-[#eff6ff] mb-1">
                  Category
                </label>

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-800 dark:text-white"
                  required
                >
                  {currentCategories.length > 0 ? (
                    currentCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))
                  ) : (
                    <option value="">
                      No categories available
                    </option>
                  )}
                </select>
              </div>
            )}

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-blue-1000 dark:text-[#eff6ff]  mb-1">
                Transaction Date
              </label>

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-800 dark:text-white"
                required
              />
            </div>

            {/* Source Account */}
            <div>
              <label className="block text-xs font-semibold  text-blue-1000 dark:text-[#eff6ff] mb-1">
                {type === 'transfer' ? 'Source Account' : 'Account'}
              </label>

              <select
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-800 dark:text-white"
                required
              >
                {accounts.length > 0 ? (
                  accounts.map((acc) => (
                    <option key={acc._id} value={acc._id}>
                      {acc.name} (₹{Number(acc.balance || 0).toFixed(2)})
                    </option>
                  ))
                ) : (
                  <option value="">
                    No accounts available
                  </option>
                )}
              </select>
            </div>

            {/* Destination Account */}
            {type === 'transfer' && (
              <div>
                <label className="block text-xs font-semibold text-blue-1000 dark:text-[#eff6ff] mb-1">
                  Destination Account
                </label>

                <select
                  value={toAccount}
                  onChange={(e) => setToAccount(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-800 dark:text-white"
                  required
                >
                  {accounts.length > 0 ? (
                    accounts.map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.name} (₹{Number(acc.balance || 0).toFixed(2)})
                      </option>
                    ))
                  ) : (
                    <option value="">
                      No accounts available
                    </option>
                  )}
                </select>
              </div>
            )}

            {/* Payment Method */}
            {type !== 'transfer' && (
              <div>
                <label className="block text-xs font-semibold  text-blue-1000 dark:text-[#eff6ff] mb-1">
                  Payment Method
                </label>

                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-primary  text-blue-1000 dark:text-[#eff6ff]"
                >
                  <option value="Bank">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Wallet">Wallet</option>
                </select>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold  text-blue-1000 dark:text-[#eff6ff] mb-1">
              Description / Notes
            </label>

            <input
              type="text"
              placeholder="e.g. Weekly grocery stock, utility check"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-800 dark:text-white"
            />
          </div>

          {/* Recurring */}
          {type !== 'transfer' && (
            <div className="bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary w-4 h-4"
                />

                <label
                  htmlFor="isRecurring"
                  className="text-xs font-semibold text-slate-750 dark:text-slate-200 cursor-pointer"
                >
                  Is this a recurring transaction?
                </label>
              </div>

              {isRecurring && (
                <div>
                  <label className="block text-xs font-semibold  text-blue-1000 dark:text-[#eff6ff] mb-1">
                    Frequency
                  </label>

                  <select
                    value={recurrenceFrequency}
                    onChange={(e) =>
                      setRecurrenceFrequency(e.target.value)
                    }
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-800 dark:text-white"
                  >
                    <option value="none">
                      Select frequency...
                    </option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Attachment */}
          {type !== 'transfer' && (
            <div>
              <label className="block text-xs font-semibold  text-blue-1000 dark:text-[#eff6ff] mb-1">
                Attach Receipt / Image
              </label>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-green-700  text-blue-1000 dark:text-[#eff6ff] text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer transition">
                  <Upload className="w-4 h-4" />

                  Upload file

                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {attachment && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-xs truncate">
                    {attachment.name}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-slate-200/50 dark:border-slate-800/50 pt-4 mt-6">

            <button
              type="button"
              onClick={onClose}
              className="bg-slate-100 hover:bg-red-400 hover:text-[#eff6ff] dark:bg-slate-900 dark:hover:bg-pink-800 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl text-sm font-semibold transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-slate-900 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-soft shadow-primary/20 transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Save Transaction'}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickAddModal;