import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Settings as SettingsIcon,
  ShieldCheck,
  Key,
  Webhook,
  Copy,
  Check,
  Building,
  User as UserIcon,
  Mail,
  Lock,
} from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const { success } = useToast();
  const [copied, setCopied] = useState(false);

  const webhookUrl = `${window.location.origin}/api/webhooks/razorpay`;

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    success('Webhook URL copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-brand-400" />
          Settings & Gateway Configuration
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Manage your merchant profile, Razorpay Test Mode credentials, and webhook endpoints
        </p>
      </div>

      {/* Business Profile */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-4">
          <Building className="w-4 h-4 text-brand-400" />
          Merchant Business Profile
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <span className="text-slate-500 uppercase tracking-wider text-[10px] block font-semibold">
              Business Name
            </span>
            <span className="text-base font-bold text-white mt-1 block">
              {user?.businessName || 'PayFlow Merchant'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <span className="text-slate-500 uppercase tracking-wider text-[10px] block font-semibold">
              Administrator Name
            </span>
            <span className="text-base font-bold text-white mt-1 block">{user?.name}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <span className="text-slate-500 uppercase tracking-wider text-[10px] block font-semibold">
              Account Email
            </span>
            <span className="text-base font-bold text-white mt-1 block">{user?.email}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <span className="text-slate-500 uppercase tracking-wider text-[10px] block font-semibold">
              Role & Permissions
            </span>
            <span className="text-base font-bold text-brand-400 mt-1 block uppercase">
              {user?.role || 'merchant'}
            </span>
          </div>
        </div>
      </div>

      {/* Razorpay Gateway Settings */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-400" />
            Razorpay Test Mode Integration
          </h2>
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Test Mode Active
          </span>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
              Key ID (Public)
            </span>
            <div className="font-mono text-sm text-slate-200">
              {import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YourKeyIdHere'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
              Key Secret (Server-Side)
            </span>
            <div className="font-mono text-sm text-emerald-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Configured securely in backend environment (.env)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Webhook Configuration */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-4">
          <Webhook className="w-4 h-4 text-sky-400" />
          Razorpay Webhook Endpoint
        </h2>

        <p className="text-xs text-slate-400 leading-relaxed">
          Configure this URL in your{' '}
          <a
            href="https://dashboard.razorpay.com/app/webhooks"
            target="_blank"
            rel="noreferrer"
            className="text-brand-400 underline font-semibold"
          >
            Razorpay Dashboard &rarr; Settings &rarr; Webhooks
          </a>{' '}
          to receive real-time updates for captured charges, payment failures, and refunds with HMAC-SHA256 signature verification.
        </p>

        <div className="flex items-center gap-3">
          <input
            type="text"
            readOnly
            value={webhookUrl}
            className="flex-1 font-mono text-xs text-white bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-3 focus:outline-none"
          />
          <button
            onClick={copyWebhook}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
