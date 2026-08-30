import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShortcuts } from '../context/ShortcutContext';
import {
  Search,
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Coins,
  Percent,
  Target,
  PieChart,
  LineChart,
  Users,
  FileText,
  PlusCircle,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

const CommandPalette = ({ onOpenQuickAdd }) => {
  const { isPaletteOpen, setIsPaletteOpen } = useShortcuts();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const commandItems = [
    // Navigation
    { type: 'nav', name: 'Go to Dashboard', path: '/dashboard', icon: LayoutDashboard, keywords: 'home stats assets overview' },
    { type: 'nav', name: 'Go to Transactions', path: '/transactions', icon: ArrowLeftRight, keywords: 'history payments ledger log' },
    { type: 'nav', name: 'Go to Accounts', path: '/accounts', icon: Wallet, keywords: 'bank cash card wallet upi credit' },
    { type: 'nav', name: 'Go to Assets', path: '/assets', icon: Coins, keywords: 'house car vehicle gold silver crypto stocks property' },
    { type: 'nav', name: 'Go to Investments', path: '/investments', icon: Percent, keywords: 'stocks shares mutual funds roi cagr epf fd' },
    { type: 'nav', name: 'Go to Savings Goals', path: '/goals', icon: Target, keywords: 'save fund target progress milestone' },
    { type: 'nav', name: 'Go to Budgets', path: '/budgets', icon: PieChart, keywords: 'limit spent food travel category cap warning' },
    { type: 'nav', name: 'Go to Loans', path: '/loans', icon: LineChart, keywords: 'debt emi bank education home car principal interest' },
    { type: 'nav', name: 'Go to Borrow & Lend', path: '/borrow-lend', icon: Users, keywords: 'friends peer lent borrowed collect pay phone' },
    { type: 'nav', name: 'Go to Reports & Analytics', path: '/reports', icon: FileText, keywords: 'excel pdf csv download charts summary statement' },
    // Actions
    { type: 'action', name: 'Add Income', action: 'income', icon: TrendingUp, keywords: 'quick add transaction salary business money deposit' },
    { type: 'action', name: 'Add Expense', action: 'expense', icon: TrendingDown, keywords: 'quick add transaction purchase cost spend bills food travel shopping' },
  ];

  const filteredItems = commandItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.keywords.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleItemClick = (item) => {
    setIsPaletteOpen(false);
    setSearchQuery('');
    if (item.type === 'nav') {
      navigate(item.path);
    } else if (item.type === 'action') {
      onOpenQuickAdd(item.action);
    }
  };

  useEffect(() => {
    if (!isPaletteOpen) {
      setSearchQuery('');
    }
  }, [isPaletteOpen]);

  if (!isPaletteOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-start justify-center pt-[15vh]">
      <div className="w-full max-w-xl glass-card rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden mx-4">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200/50 dark:border-slate-800/50">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command or search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-slate-800 dark:text-white text-sm focus:outline-none placeholder-slate-400"
          />
          <button
            onClick={() => setIsPaletteOpen(false)}
            className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-400 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700"
          >
            ESC
          </button>
        </div>

        {/* Command list */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-6">No matching commands found.</p>
          ) : (
            filteredItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleItemClick(item)}
                className="w-full flex items-center justify-between text-left p-3 hover:bg-primary/10 dark:hover:bg-primary/20 rounded-xl transition duration-150 group"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4.5 h-4.5 text-slate-400 group-hover:text-primary transition" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition">
                    {item.name}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/50 dark:border-slate-700/50">
                  {item.type}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
