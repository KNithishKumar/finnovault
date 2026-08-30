import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { ShortcutProvider } from './context/ShortcutContext';

// Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import CommandPalette from './components/CommandPalette';
import QuickAddModal from './components/QuickAddModal';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Accounts from './pages/Accounts';
import Assets from './pages/Assets';
import Investments from './pages/Investments';
import SavingsGoals from './pages/SavingsGoals';
import Budgets from './pages/Budgets';
import Loans from './pages/Loans';
import BorrowLend from './pages/BorrowLend';
import Reports from './pages/Reports';
import Profile from './pages/Profile';

// Protected Route Wrapper
const ProtectedLayout = ({ onOpenQuickAdd }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <Sidebar />
      <div className="flex-1 md:pl-[260px] flex flex-col min-h-screen overflow-x-hidden">
        <Navbar onOpenQuickAdd={onOpenQuickAdd} />
        <main className="flex-grow p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const App = () => {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState('expense');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleOpenQuickAdd = (type = 'expense') => {
    setQuickAddType(type);
    setIsQuickAddOpen(true);
  };

  const handleTransactionAdded = () => {
    // Increment triggers to reload active lists/charts
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <ThemeProvider>
      <ShortcutProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'dark:bg-slate-900 dark:text-white border dark:border-slate-800 rounded-xl text-sm font-semibold',
              duration: 4000,
            }}
          />
          
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Protected Application Routes */}
            <Route element={<ProtectedLayout onOpenQuickAdd={handleOpenQuickAdd} />}>
              <Route path="/dashboard" element={<Dashboard key={`dash-${refreshTrigger}`} />} />
              <Route path="/transactions" element={<Transactions key={`txs-${refreshTrigger}`} />} />
              <Route path="/accounts" element={<Accounts key={`acc-${refreshTrigger}`} />} />
              <Route path="/assets" element={<Assets key={`ast-${refreshTrigger}`} />} />
              <Route path="/investments" element={<Investments key={`inv-${refreshTrigger}`} />} />
              <Route path="/goals" element={<SavingsGoals key={`goal-${refreshTrigger}`} />} />
              <Route path="/budgets" element={<Budgets key={`bud-${refreshTrigger}`} />} />
              <Route path="/loans" element={<Loans key={`loan-${refreshTrigger}`} />} />
              <Route path="/borrow-lend" element={<BorrowLend key={`debt-${refreshTrigger}`} />} />
              <Route path="/reports" element={<Reports key={`rep-${refreshTrigger}`} />} />
              <Route path="/profile" element={<Profile key={`prof-${refreshTrigger}`} />} />
            </Route>

            {/* Default redirects */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>

          {/* Global Widgets */}
          <CommandPalette onOpenQuickAdd={handleOpenQuickAdd} />
          <QuickAddModal
            isOpen={isQuickAddOpen}
            onClose={() => setIsQuickAddOpen(false)}
            defaultType={quickAddType}
            onTransactionAdded={handleTransactionAdded}
          />
        </Router>
      </ShortcutProvider>
    </ThemeProvider>
  );
};

export default App;
