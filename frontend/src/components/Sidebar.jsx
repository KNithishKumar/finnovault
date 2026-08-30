import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/authSlice';

import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Coins,
  LineChart,
  Target,
  PieChart,
  Percent,
  Users,
  FileText,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Transactions',
      path: '/transactions',
      icon: ArrowLeftRight,
    },
    {
      name: 'Accounts',
      path: '/accounts',
      icon: Wallet,
    },
    {
      name: 'Assets',
      path: '/assets',
      icon: Coins,
    },
    {
      name: 'Investments',
      path: '/investments',
      icon: Percent,
    },
    {
      name: 'Savings Goals',
      path: '/goals',
      icon: Target,
    },
    {
      name: 'Budgets',
      path: '/budgets',
      icon: PieChart,
    },
    {
      name: 'Loans',
      path: '/loans',
      icon: LineChart,
    },
    {
      name: 'Borrow & Lend',
      path: '/borrow-lend',
      icon: Users,
    },
    {
      name: 'Reports',
      path: '/reports',
      icon: FileText,
    },
    {
      name: 'Profile Settings',
      path: '/profile',
      icon: User,
    },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <motion.aside
      animate={{
        width: isCollapsed ? 76 : 260,
      }}
      transition={{
        duration: 0.3,
        ease: 'easeInOut',
      }}
      className="
        hidden md:flex
        flex-col
        h-screen
        fixed
        left-0
        top-0
        z-30
        overflow-hidden

        bg-white
        dark:bg-slate-900

        text-slate-600
        dark:text-slate-400

        border-r
        border-slate-200
        dark:border-slate-800
      "
    >
      {/* Brand Header */}
      <div
        className="
          flex
          items-center
          justify-between
          p-5
          h-16

          border-b
          border-slate-200
          dark:border-slate-800
        "
      >
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary flex-shrink-0" />

          {!isCollapsed && (
            <span
              className="
                font-bold
                text-xl
                tracking-wider
                text-slate-900
                dark:text-white
              "
            >
    
              <span className="text-secondary text-slate-950">
                Finnovault
              </span>
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="
            text-slate-500
            dark:text-slate-400

            hover:text-slate-900
            dark:hover:text-white

            p-1
            rounded-lg

            bg-slate-100
            dark:bg-slate-800

            border
            border-slate-200
            dark:border-slate-700

            hover:bg-slate-200
            dark:hover:bg-slate-700

            focus:outline-none
            transition
          "
        >
          {isCollapsed ? (
            <ChevronRight size={16} />
          ) : (
            <ChevronLeft size={16} />
          )}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4 overflow-y-auto px-3 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `
              flex
              items-center
              gap-4
              px-3
              py-3
              rounded-xl
              transition-all
              duration-200
              group
              font-medium

              ${
                isActive
                  ? 'bg-primary text-white shadow-soft shadow-primary/30'
                  : `
                    text-slate-600
      
                    dark:text-slate-400

                    hover:bg-slate-100
                    dark:hover:bg-slate-800

                    hover:text-slate-900
                    dark:hover:text-slate-200
                  `
              }
              `
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />

            {!isCollapsed && (
              <span className="text-sm">
                {item.name}
              </span>
            )}
          </NavLink>
        ))}
      </div>

      {/* Footer / User Profile */}
      <div
        className="
          p-4
          border-t
          border-slate-200
          dark:border-slate-800
        "
      >
        {!isCollapsed && (
          <div
            className="
              flex
              items-center
              gap-3
              mb-4
              p-3
              rounded-2xl

              bg-slate-50
              dark:bg-slate-800/40

              border
              border-slate-200
              dark:border-slate-800
            "
          >
            <div
              className="
                w-10
                h-10
                rounded-full

                bg-primary/20
                border
                border-primary/30

                flex
                items-center
                justify-center

                text-primary
                font-bold
                text-lg
                uppercase
                flex-shrink-0
              "
            >
              {user?.name?.charAt(0) || 'U'}
            </div>

            <div className="truncate">
              <h4
                className="
                  text-sm
                  font-semibold
                  truncate
                  text-slate-900
                  dark:text-white
                "
              >
                {user?.name || 'User'}
              </h4>

              <p
                className="
                  text-xs
                  truncate
                  text-slate-500
                  dark:text-slate-400
                "
              >
                {user?.email || ''}
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="
            w-full
            flex
            items-center
            gap-4
            px-3
            py-3
            rounded-xl

            text-slate-600
            dark:text-slate-400

            hover:bg-red-50
            dark:hover:bg-red-500/10

            hover:text-red-500
            dark:hover:text-red-400

            transition-all
            font-medium
          "
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />

          {!isCollapsed && (
            <span className="text-sm">
              Logout
            </span>
          )}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;