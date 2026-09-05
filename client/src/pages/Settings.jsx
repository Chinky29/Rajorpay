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
        <h1 className="text-2xl font-bold text-white tracking-tight font-display flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-brass-400" />
          Settings and gateway configuration
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Manage your merchant profile, Razorpay test mode credentials, and webhook endpoints
        </p>
      </div>

      {/* Business Profile */}
      <div className="rounded-xl border border-ink-border bg-ink-800 backdrop-blur-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-ink-border pb-4">
          <Building className="w-4 h-4 text-brass-400" />
          Merchant business profile
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-ink-900 border border-ink-border">
            <span className="text-slate-500 text-[11px] block font-medium">
              Business name
            </span>
            <span className="text-base font-semibold text-white mt-1 block font-display">
              {user?.businessName || 'PayFlow Merchant'}
            </span>
          </div>

          <div className="p-4 rounded-lg bg-ink-900 border border-ink-border">
            <span className="text-slate-500 text-[11px] block font-medium">
              Administrator name
            </span>
            <span className="text-base font-semibold text-white mt-1 block">{user?.name}</span>
          </div>

          <div className="p-4 rounded-lg bg-ink-900 border border-ink-border">
            <span className="text-slate-500 text-[11px] block font-medium">
              Account email
            </span>
            <span className="text-base font-semibold text-white mt-1 block">{user?.email}</span>
          </div>

          <div className="p-4 rounded-lg bg-ink-900 border border-ink-border">
            <span className="text-slate-500 text-[11px] block font-medium">
              Role & permissions
            </span>
            <span className="text-base font-semibold text-brass-400 mt-1 block capitalize">
              {user?.role || 'merchant'}
            </span>
          </div>
        </div>
      </div>

      {/* Razorpay Gateway Settings */}
      <div className="rounded-xl border border-ink-border bg-ink-800 backdrop-blur-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-ink-border pb-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-brass-400" />
            Razorpay test mode integration
          </h2>
          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-success-soft text-success border border-success/20">
            Test mode active
          </span>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-lg bg-ink-900 border border-ink-border space-y-1">
            <span className="text-slate-500 text-[11px] font-medium">
              Key ID (public)
            </span>
            <div className="font-mono text-sm text-slate-200">
              {import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YourKeyIdHere'}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-ink-900 border border-ink-border space-y-1">
            <span className="text-slate-500 text-[11px] font-medium">
              Key Secret (server-side)
            </span>
            <div className="font-mono text-sm text-success flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-success" />
              <span>Configured securely in backend environment (.env)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Webhook Configuration */}
      <div className="rounded-xl border border-ink-border bg-ink-800 backdrop-blur-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-ink-border pb-4">
          <Webhook className="w-4 h-4 text-info" />
          Razorpay webhook endpoint
        </h2>

        <p className="text-xs text-slate-400 leading-relaxed">
          Configure this URL in your{' '}
          <a
            href="https://dashboard.razorpay.com/app/webhooks"
            target="_blank"
            rel="noreferrer"
            className="text-brass-400 underline font-semibold"
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
            className="flex-1 font-mono text-xs text-white bg-ink-900 border border-ink-border rounded-lg px-4 py-3 focus:outline-none"
          />
          <button
            onClick={copyWebhook}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-ink-700 hover:bg-ink-600 text-white font-semibold text-xs border border-ink-border transition"
          >
            {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
