import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Layers, ArrowRight, Building, User as UserIcon, Mail, Lock } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    businessName: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      error('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      await register(formData.name, formData.email, formData.password, formData.businessName);
      success('Account registered successfully! Welcome to PayFlow.');
      navigate('/');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to register account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-ink-700 border border-brass-500/40 text-brass-400 shadow-xl mb-4">
          <Layers className="w-6 h-6 text-brass-400" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-white font-display">
          Create PayFlow account
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Get started with multi-tenant payment operations in minutes
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="rounded-xl border border-ink-border bg-ink-800 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Full name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Sarah Connor"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-ink-border bg-ink-900 text-sm text-white placeholder-slate-500 focus:border-brass-500 focus:outline-none focus:ring-1 focus:ring-brass-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Business name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Building className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                  placeholder="Acme Payments Pvt Ltd"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-ink-border bg-ink-900 text-sm text-white placeholder-slate-500 focus:border-brass-500 focus:outline-none focus:ring-1 focus:ring-brass-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Work email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="sarah@business.com"
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Min 6 characters"
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
                  <span>Create account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-ink-border text-center text-xs text-slate-400">
            Already registered?{' '}
            <Link
              to="/login"
              className="font-semibold text-brass-400 hover:text-brass-300 transition"
            >
              Sign in to your account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
