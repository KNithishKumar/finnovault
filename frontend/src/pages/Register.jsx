import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Shield, Lock, Mail, User } from 'lucide-react';
import { authAPI } from '../services/api';
import { authStart, authSuccess, authFailure } from '../features/authSlice';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      return toast.error('Please fill in all register fields');
    }

    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters long');
    }

    dispatch(authStart());
    try {
      const res = await authAPI.register({ name, email, password });
      if (res.data.success) {
        dispatch(authSuccess({ user: res.data, token: res.data.token }));
        toast.success(`Account created successfully! Welcome, ${res.data.name}!`);
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Try again.';
      dispatch(authFailure(msg));
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/15 rounded-full blur-[100px] animate-pulse-slow"></div>

      <div className="w-full max-w-md z-10">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <Shield className="w-12 h-12 text-primary mb-3" />
          <h2 className="text-3xl font-extrabold text-white tracking-tight text-center">
            <span className = "text-slate-900">FINNO</span><span className="text-secondary text-green-700">VAULT</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 text-slate-950">SaaS Personal Finance & Wealth Management</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-3xl p-8 border border-slate-800 shadow-2xl">
          <h3 className="text-xl font-bold text-slate-950 mb-6">Create Account</h3>

          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 text-slate-950">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="w-4 h-4 text-slate-500" />
                </span>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-300 border border-slate-800 pl-10 pr-4 py-2.5 rounded-xl text-slate-950 font-semibold focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

             {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 text-slate-950">Email Address</label>
              <div className="relative" >
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="w-4 h-4 text-slate-500" />
                </span>
                <input
                  
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-300 border border-slate-800 pl-10 pr-4 py-2.5 rounded-xl text-slate-950 font-semibold focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold text-slate-400 text-slate-950">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="w-4 h-4 text-slate-500" />
                </span>
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-300 border border-slate-800 pl-10 pr-10 py-2.5 rounded-xl text-slate-950 font-semibold focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 text-xs font-semibold text-slate-400 text-slate-950 ">Confirm Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="w-4 h-4 text-slate-500" />
                </span>
                <input
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-300 border border-slate-800 pl-10 pr-4 py-2.5 rounded-xl text-slate-950 font-semibold focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 hover:bg-green-900 text-white font-semibold py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring shadow-lg shadow-primary/20 disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating Account...' : 'Get Started for Free'}
            </button>
          </form>

          <p className="text-center text-xs v mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-green-900 font-semibold">
              Sign In Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
