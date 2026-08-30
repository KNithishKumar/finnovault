import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as ChartTooltip } from 'recharts';
import { PlusCircle, Trash2, TrendingUp, HelpCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { investmentsAPI } from '../services/api';

const Investments = () => {
  const [investments, setInvestments] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [type, setType] = useState('Stocks');
  const [investedAmount, setInvestedAmount] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [units, setUnits] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchInvestments = async () => {
    try {
      const res = await investmentsAPI.getInvestments();
      if (res.data.success) {
        setInvestments(res.data.investments);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this investment entry?')) return;
    try {
      const res = await investmentsAPI.deleteInvestment(id);
      if (res.data.success) {
        toast.success('Investment entry deleted');
        fetchInvestments();
      }
    } catch (err) {
      toast.error('Error deleting investment');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name || !investedAmount || !currentValue) {
      return toast.error('Please enter name, invested amount, and current value');
    }

    try {
      const res = await investmentsAPI.createInvestment({
        name,
        type,
        investedAmount: Number(investedAmount),
        currentValue: Number(currentValue),
        units: Number(units) || 0,
        purchaseDate,
      });

      if (res.data.success) {
        toast.success('Investment logged successfully');
        setName('');
        setInvestedAmount('');
        setCurrentValue('');
        setUnits('');
        setShowAddForm(false);
        fetchInvestments();
      }
    } catch (err) {
      toast.error('Error creating investment');
    }
  };

  // Aggregated totals
  const totalInvested = investments.reduce((sum, i) => sum + i.investedAmount, 0);
  const totalCurrent = investments.reduce((sum, i) => sum + i.currentValue, 0);
  const totalProfitLoss = totalCurrent - totalInvested;
  const overallROI = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

  // Chart data: Group by type
  const typeMap = {};
  investments.forEach((inv) => {
    typeMap[inv.type] = (typeMap[inv.type] || 0) + inv.currentValue;
  });
  const allocationData = Object.keys(typeMap).map((key) => ({
    name: key,
    value: typeMap[key],
  }));

  const COLORS = ['#2563EB', '#14B8A6', '#10B981', '#EAB308', '#EF4444', '#8B5CF6', '#EC4899', '#64748B'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Investment Portfolios</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Track mutual funds, shares, FD, EPF, crypto, and calculate live compounding rates.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-xs font-semibold transition shadow-soft"
        >
          <PlusCircle className="w-4 h-4" />
          Log Investment
        </button>
      </div>

      {/* Add Investment Form */}
      {showAddForm && (
        <div className="glass-card rounded-3xl p-5 md:p-6 border border-slate-200 dark:border-slate-900 shadow-soft animate-fadeIn max-w-xl">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4">Log Portfolio Asset</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 text-blue-950 dark:text-[#eff6ff]">Investment Name</label>
                <input
                  type="text"
                  placeholder="e.g. Apple Stock, Vanguard ETF"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-800 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 text-blue-950 dark:text-[#eff6ff]">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-800 dark:text-white"
                >
                  <option value="Stocks">Stocks</option>
                  <option value="Mutual Funds">Mutual Funds</option>
                  <option value="SIP">SIP Contribution</option>
                  <option value="FD">Fixed Deposit (FD)</option>
                  <option value="PPF">PPF</option>
                  <option value="EPF">EPF</option>
                  <option value="Gold">Gold Bond</option>
                  <option value="Crypto">Cryptocurrency</option>
                  <option value="Real Estate">Real Estate portfolio</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 text-blue-950 dark:text-[#eff6ff]">Invested Principal (₹)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={investedAmount}
                  onChange={(e) => setInvestedAmount(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-800 dark:text-white font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 text-blue-950 dark:text-[#eff6ff]">Current Balance Valuation (₹)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-800 dark:text-white font-medium"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 text-blue-950 dark:text-[#eff6ff]">Units (optional)</label>
                <input
                  type="number"
                  step="0.001"
                  placeholder="0"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-800 dark:text-white font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 text-blue-950 dark:text-[#eff6ff]">Purchase Date</label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
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
                Log Asset
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Aggregate Valuation Header Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-900 shadow-soft">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Invested Principal</span>
          <h3 className="text-xl md:text-2xl font-black mt-1 text-slate-800 dark:text-white">₹{totalInvested.toLocaleString()}</h3>
        </div>
        <div className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-900 shadow-soft">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Current Value</span>
          <h3 className="text-xl md:text-2xl font-black mt-1 text-slate-800 dark:text-white">₹{totalCurrent.toLocaleString()}</h3>
        </div>
        <div className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-900 shadow-soft">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Net Gain / Loss</span>
          <div className={`flex items-center gap-1 text-xl md:text-2xl font-black mt-1 ₹{totalProfitLoss >= 0 ? 'text-accent' : 'text-red-500'}`}>
            <span>₹{totalProfitLoss.toLocaleString()}</span>
          </div>
        </div>
        <div className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-900 shadow-soft">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Total ROI</span>
          <h3 className={`text-xl md:text-2xl font-black mt-1 ₹{overallROI >= 0 ? 'text-accent' : 'text-red-500'}`}>{overallROI.toFixed(1)}%</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allocation chart */}
        <div className="glass-card rounded-3xl p-5 md:p-6 border border-slate-200 dark:border-slate-900 shadow-soft flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Investment Allocation</h3>
          {allocationData.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-10">No records to calculate allocation.</p>
          ) : (
            <div className="h-60 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart >
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-₹{index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    contentStyle={{
                      backgroundColor: 'rgba(245, 184, 18, 0.9)',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {allocationData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1 text-[10px] text-slate-500">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                <span>{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Portfolio details table */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-900 shadow-soft overflow-hidden">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Asset Portfolio Ledger</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-900 text-slate-400 font-semibold uppercase">
                  <th className="py-3 px-3 text-blue-950 dark:text-[#eff6ff]">Name</th>
                  <th className="py-3 px-3 text-blue-950 dark:text-[#eff6ff]">Type</th>
                  <th className="py-3 px-3 text-right text-blue-950 dark:text-[#eff6ff]">Invested</th>
                  <th className="py-3 px-3 text-right text-blue-950 dark:text-[#eff6ff]">Current Val</th>
                  <th className="py-3 px-3 text-right text-blue-950 dark:text-[#eff6ff]">ROI</th>
                  <th className="py-3 px-3 text-right text-blue-950 dark:text-[#eff6ff]">CAGR</th>
                  <th className="py-3 px-3 text-center text-blue-950 dark:text-[#eff6ff]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-900 text-blue-950 dark:text-[#eff6ff]">
                {investments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-slate-400 text-blue-950 dark:text-[#eff6ff]">No investment records loaded.</td>
                  </tr>
                ) : (
                  investments.map((inv) => {
                    const isProfit = inv.profitLoss >= 0;
                    return (
                      <tr key={inv._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                        <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">{inv.name}</td>
                        <td className="py-3 px-3">{inv.type}</td>
                        <td className="py-3 px-3 text-right font-medium">₹{inv.investedAmount.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">₹{inv.currentValue.toLocaleString()}</td>
                        <td className={`py-3 px-3 text-right font-bold ₹{isProfit ? 'text-accent' : 'text-red-500'}`}>
                          {inv.roi.toFixed(1)}%
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-blue-950 dark:text-[#eff6ff]">
                          {inv.cagr.toFixed(1)}%
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => handleDelete(inv._id)}
                            className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-red-500/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Investments;
