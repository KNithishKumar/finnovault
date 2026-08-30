import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Shield, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { authAPI } from '../services/api';
import { authStart, authSuccess, authFailure } from '../features/authSlice';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error('Please fill in all credentials');
    }

    dispatch(authStart());
    try {
      const res = await authAPI.login({ email, password });
      if (res.data.success) {
        dispatch(authSuccess({ user: res.data, token: res.data.token }));
        toast.success(`Welcome back, ${res.data.name}!`);
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      dispatch(authFailure(msg));
      toast.error(msg);
    }
  };

  const handleGooglePlaceholder = () => {
    toast.success('Google OAuth simulation: Logged in successfully!');
    dispatch(authSuccess({
      user: { name: 'Demo Investor', email: 'investor@finvault.com', currency: 'USD', timezone: 'UTC', language: 'en' },
      token: 'mock_jwt_google_auth_token_xyz_98765',
    }));
    navigate('/dashboard');
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
          <h3 className="text-xl font-bold text-slate-950 mb-6">Sign In</h3>
          
          <form onSubmit={handleLogin} className="space-y-4">
            
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
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-400 text-slate-950">Password</label>
                <Link to="/forgot-password" className="text-xs text-slate-950 hover:text-red-900 font-medium">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="w-4 h-4 text-slate-500" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-300 border border-slate-800 pl-10 pr-10 py-2.5 rounded-xl text-slate-950 font-semibold focus:outline-none focus:border-primary"
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-500" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-800 bg-slate-900 text-primary focus:ring-primary w-4.5 h-4.5"
              />
              <label htmlFor="remember" className="text-xs text-slate-400 ml-2 cursor-pointer select-none text-slate-950">
                Remember my login details
              </label>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 hover:bg-green-900 text-white font-semibold py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring shadow-lg shadow-primary/20 disabled:opacity-50 mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Social Divider */}
          <div className="flex items-center my-6">
            <hr className="flex-1 border-slate-800" />
            <span className="text-xs text-slate-500 px-3 font-semibold uppercase text-slate-950">Or continue with</span>
            <hr className="flex-1 border-slate-800" />
          </div>

          {/* Google Button */}
          <button
            onClick={handleGooglePlaceholder}
            className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-850 border border-slate-850 text-white font-semibold py-3 rounded-xl text-sm transition focus:outline-none"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Google Cloud Onboarding
          </button>

          <p className="text-center text-xs text-slate-400 mt-6 text-slate-950">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-slate-950 hover:text-green-900 font-semibold">
              Create Free Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
