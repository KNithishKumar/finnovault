import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useShortcuts } from '../context/ShortcutContext';
import { logout } from '../features/authSlice';
import { notificationsAPI } from '../services/api';
import {
  Sun,
  Moon,
  Bell,
  Search,
  Menu,
  Plus,
  ChevronDown,
  LogOut,
  User,
  Settings,
  X,
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
  Shield,
} from 'lucide-react';

const Navbar = ({ onOpenQuickAdd }) => {
  const { theme, toggleTheme } = useTheme();
  const { togglePalette } = useShortcuts();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
    { name: 'Accounts', path: '/accounts', icon: Wallet },
    { name: 'Assets', path: '/assets', icon: Coins },
    { name: 'Investments', path: '/investments', icon: Percent },
    { name: 'Savings Goals', path: '/goals', icon: Target },
    { name: 'Budgets', path: '/budgets', icon: PieChart },
    { name: 'Loans', path: '/loans', icon: LineChart },
    { name: 'Borrow & Lend', path: '/borrow-lend', icon: Users },
    { name: 'Reports', path: '/reports', icon: FileText },
  ];

  const fetchNotifications = async () => {
    try {
      const res = await notificationsAPI.getNotifications();
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll notifications every 60s
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const markAllRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const unreadCount = notifications.filter((n) => n.status === 'unread').length;

  return (
    <>
      <nav className="glass-nav sticky top-0 z-40 w-full h-16 flex items-center justify-between px-4 md:px-8 border-b border-slate-200 dark:border-slate-800">
        {/* Mobile menu trigger */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            FINNOVAULT
          </span>
        </div>

        {/* Search Input Box (Shortcut trigger) */}
        <div className="hidden md:flex items-center gap-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl cursor-pointer w-72 hover:border-slate-300 dark:hover:border-slate-700 transition" onClick={togglePalette}>
          <Search className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-400 flex-1">Search or jump to...</span>
          <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono border border-slate-300 dark:border-slate-700">Ctrl K</span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Quick Add Button */}
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm shadow-soft shadow-primary/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Quick Add</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifDropdown(!showNotifDropdown);
                setShowUserDropdown(false);
              }}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 text-slate-600 dark:text-slate-300 transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-slate-950">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-lg z-50 bg-green-50 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 pb-2 mb-2">
                  <h4 className="font-semibold text-slate-800 dark:text-white">Notifications</h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-primary hover:text-primary-dark font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-4">No notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        className={`p-2.5 rounded-xl text-xs border ${
                          n.status === 'unread'
                            ? 'bg-primary/5 border-primary/20 text-slate-800 dark:text-slate-100 font-medium'
                            : 'border-slate-100 dark:border-slate-900 text-slate-500'
                        }`}
                      >
                        <p>{n.message}</p>
                        <span className="text-[10px] text-slate-400 block mt-1">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserDropdown(!showUserDropdown);
                setShowNotifDropdown(false);
              }}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition"
            >
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm uppercase">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-48 glass-card rounded-2xl p-2 border border-slate-200 dark:border-slate-800 shadow-lg z-50">
                <Link
                  to="/profile"
                  onClick={() => setShowUserDropdown(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <Link
                  to="/profile#security"
                  onClick={() => setShowUserDropdown(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <hr className="my-1 border-slate-200 dark:border-slate-800" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm hover:bg-red-500/10 text-red-500 text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Drawer menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-grey-950/80 backdrop-blur-sm">
          <div className="w-72 dark:bg-[#5e183c] bg-orange-50 h-full p-5 flex flex-col justify-between text-slate-400 border-r border-slate-800">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <span className="font-bold text-lg text-blue-950 dark:text-white flex items-center gap-2">
                  <Shield className="w-6 h-6 text-primary dark:text-white" />
                  FINNOVAULT
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg bg-slate-800 hover:text-white "
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

             <div className="space-y-1 overflow-y-auto max-h-[70vh]">
  {menuItems.map((item) => (
    <Link
      key={item.name}
      to={item.path}
      onClick={() => setIsMobileMenuOpen(false)}
      className="
        flex items-center gap-4
        px-3 py-3
        rounded-xl
        text-sm font-medium
        text-slate-700
        bg-sky-100
        hover:bg-sky-300
        hover:text-slate-900

        dark:bg-slate-900
        dark:text-[#f8fafc]
        dark:hover:bg-[#737373]
        dark:hover:text-[#3b0764]

        transition-colors duration-200
      "
    >
      <item.icon className="w-5 h-5 flex-shrink-0" />
      <span>{item.name}</span>
    </Link>
  ))}
</div>
            </div>

            <div className="border-t border-slate-800 pt-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-400 text-sm font-medium"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
