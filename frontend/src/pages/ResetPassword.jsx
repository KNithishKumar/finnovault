import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Shield, Lock, ArrowLeft } from 'lucide-react';
import { authAPI } from '../services/api';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) return toast.error('Please fill in passwords');
    if (password !== confirmPassword) return toast.error('Passwords do not match');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');

    setLoading(true);
    try {
      const res = await authAPI.resetPassword(token, { password });
      if (res.data.success) {
        toast.success('Password reset successfully! You can now log in.');
        navigate('/login');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md z-10">
        <div className="flex flex-col items-center mb-8">
          <Shield className="w-12 h-12 text-primary mb-3" />
          <h2 className="text-3xl font-extrabold text-white tracking-tight text-center">
            Fin<span className="text-secondary">Vault</span>
          </h2>
        </div>

        <div className="glass-card rounded-3xl p-8 border border-slate-800 shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-3">Reset Password</h3>
          <p className="text-xs text-slate-400 mb-6">Enter and confirm your new account security password.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">New Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="w-4 h-4 text-slate-500" />
                </span>
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-primary text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Confirm Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="w-4 h-4 text-slate-500" />
                </span>
                <input
                  type="password"
                  placeholder="Re-type password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-primary text-white"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl text-sm transition-all shadow-lg disabled:opacity-50 mt-2"
            >
              {loading ? 'Resetting...' : 'Save New Password'}
            </button>
          </form>

          <Link to="/login" className="flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-white mt-6 font-semibold transition">
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
