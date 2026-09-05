import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Layers, ArrowRight, Sparkles, Lock, Mail } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      success('Welcome back to PayFlow!');
      navigate(from, { replace: true });
    } catch (err) {
      error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('demo@payflow.test');
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen bg-ink-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-ink-700 border border-brass-500/40 text-brass-400 shadow-xl mb-4">
          <Layers className="w-6 h-6 text-brass-400" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-white font-display">
          Sign in to PayFlow
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Payment operations & Razorpay test mode dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="rounded-xl border border-ink-border bg-ink-800 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6">
          {/* Quick Demo Fill Banner */}
          <div className="p-3.5 rounded-lg bg-brass-500/10 border border-brass-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-brass-300">
              <Sparkles className="w-4 h-4 text-brass-400 flex-shrink-0" />
              <span>Use seeded demo account</span>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-brass-500 hover:bg-brass-400 text-ink-950 transition active:scale-95"
            >
              Auto-fill demo
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Business email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@business.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-ink-border bg-ink-900 text-sm text-white placeholder-slate-500 focus:border-brass-500 focus:outline-none focus:ring-1 focus:ring-brass-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-ink-border bg-ink-900 text-sm text-white placeholder-slate-500 focus:border-brass-500 focus:outline-none focus:ring-1 focus:ring-brass-500 transition font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-brass-500 hover:bg-brass-400 text-ink-950 font-semibold text-sm transition disabled:opacity-50 active:scale-95"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-ink-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-ink-border text-center text-xs text-slate-400">
            {"Don't have an account yet? "}
            <Link
              to="/register"
              className="font-semibold text-brass-400 hover:text-brass-300 transition"
            >
              Register your business
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
