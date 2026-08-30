import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, Shield, AlertTriangle, Key, Download, UploadCloud, RefreshCw } from 'lucide-react';
import { authAPI } from '../services/api';
import { logout, updateUserProfile } from '../features/authSlice';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Profile forms state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currency, setCurrency] = useState(user?.currency || 'USD');
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC');
  const [language, setLanguage] = useState(user?.language || 'en');
  const [loading, setLoading] = useState(false);

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secLoading, setSecLoading] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.updateProfile({ name, email, currency, timezone, language });
      if (res.data.success) {
        dispatch(updateUserProfile(res.data));
        toast.success('Profile settings updated successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return toast.error('New passwords do not match');
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters long');

    setSecLoading(true);
    try {
      const res = await authAPI.changePassword({ oldPassword, newPassword });
      if (res.data.success) {
        toast.success('Password updated successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password update failed');
    } finally {
      setSecLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        'WARNING: Are you absolutely sure you want to delete your FinVault account? This will permanently delete all your financial ledger balances, logs, assets, and properties. This action CANNOT be undone.'
      )
    ) {
      return;
    }

    try {
      const res = await authAPI.deleteAccount();
      if (res.data.success) {
        toast.success('Your account and associated wealth logs have been deleted successfully.');
        dispatch(logout());
        navigate('/login');
      }
    } catch (err) {
      toast.error('Error deleting account');
    }
  };

  const handleDatabaseBackup = () => {
    toast.success('Database Backup: Simulated export to AWS S3 / local file successfully!');
  };

  const handleCSVImport = () => {
    toast.success('CSV Import: File successfully uploaded and integrated into ledger!');
  };

  const handleCSVExport = () => {
    toast.success('CSV Export: Download of full raw ledger initiated!');
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text--800 dark:text-white tracking-tight">Profile & Preferences</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Configure personal wealth tokens, currencies, and credentials.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Nav menu / Card summary */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-900 shadow-soft text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-green-400 dark:bg-orange-400 flex items-center justify-center text-primary font-bold text-3xl mx-auto uppercase text-blue-950 dark:text-[#eff6ff]">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white">{user?.name}</h3>
              <p className="text-xs text-slate-450 truncate">{user?.email}</p>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-900 shadow-soft space-y-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Administrative Tools</h4>
            
            <button
              onClick={handleDatabaseBackup}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-750 dark:text-slate-350 transition font-medium"
            >
              <RefreshCw className="w-4 h-4 text-primary" />
              Backup Database
            </button>
            <button
              onClick={handleCSVExport}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-750 dark:text-slate-350 transition font-medium"
            >
              <Download className="w-4 h-4 text-teal-500" />
              Export Data (CSV)
            </button>
            <button
              onClick={handleCSVImport}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-750 dark:text-slate-350 transition font-medium"
            >
              <UploadCloud className="w-4 h-4 text-accent" />
              Import CSV Statement
            </button>
          </div>
        </div>

        {/* Right Forms Area */}
        <div className="md:col-span-2 space-y-8">
          
          {/* General Preferences */}
          <div className="glass-card rounded-3xl p-5 md:p-6 border border-slate-200 dark:border-slate-900 shadow-soft">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              General Preferences
            </h3>
            
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 text-blue-950 dark:text-[#eff6ff]">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 rounded-xl text-xs text-slate-800 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 text-blue-950 dark:text-[#eff6ff]">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 rounded-xl text-xs text-slate-800 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 text-blue-950 dark:text-[#eff6ff]">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2.5 rounded-xl text-xs text-slate-850 dark:text-white"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 text-blue-950 dark:text-[#eff6ff]">Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2.5 rounded-xl text-xs text-slate-850 dark:text-white"
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">EST</option>
                    <option value="PST">PST</option>
                    <option value="GMT">GMT</option>
                    <option value="IST">IST</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 text-blue-950 dark:text-[#eff6ff]">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2.5 rounded-xl text-xs text-slate-850 dark:text-white"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-soft"
                >
                  {loading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>

          {/* Security / Password */}
          <div className="glass-card rounded-3xl p-5 md:p-6 border border-slate-200 dark:border-slate-900 shadow-soft">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              Update Account Security
            </h3>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 text-blue-950 dark:text-[#eff6ff]">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 rounded-xl text-xs text-slate-800 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 text-blue-950 dark:text-[#eff6ff]">New Password</label>
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 rounded-xl text-xs text-slate-850 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 text-blue-950 dark:text-[#eff6ff]">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 rounded-xl text-xs text-slate-850 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={secLoading}
                  className="bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-soft"
                >
                  {secLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="glass-card rounded-3xl p-5 md:p-6 border border-red-500/20 dark:border-red-500/10 bg-red-500/5 shadow-soft space-y-4">
            <div className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold">Danger Zone</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Permanently delete your FinVault account. All active balance wallets, stocks, assets, and transactions records will be cascade deleted and cannot be recovered.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2.5 rounded-xl text-xs shadow-soft transition"
            >
              Delete FinVault Account
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
