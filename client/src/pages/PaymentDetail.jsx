import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Badge from '../components/Badge';
import { CardSkeleton } from '../components/Skeleton';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useToast } from '../context/ToastContext';
import {
  ArrowLeft,
  CreditCard,
  CheckCircle2,
  AlertOctagon,
  ShieldCheck,
  RefreshCw,
  User as UserIcon,
  Receipt,
} from 'lucide-react';

export default function PaymentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  const fetchPayment = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/payments/${id}`);
      setPayment(res.data.data.payment);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to fetch transaction details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayment();
  }, [id]);

  const handleRetry = async () => {
    try {
      setRetrying(true);
      const res = await api.post(`/api/payments/${id}/retry`);
      success('Retry order initialized. Redirecting to transaction...');
      navigate(`/payments/${res.data.data.transaction._id}`);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to initialize retry');
    } finally {
      setRetrying(false);
    }
  };

  if (loading) {
    return <CardSkeleton />;
  }

  if (!payment) {
    return (
      <div className="p-12 text-center text-slate-400">
        <p>Transaction not found</p>
        <button
          onClick={() => navigate('/payments')}
          className="mt-4 px-4 py-2 rounded-lg bg-brass-500 hover:bg-brass-400 text-ink-950 text-xs font-semibold"
        >
          Back to ledger
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/payments')}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to transactions</span>
        </button>

        <div className="flex items-center gap-2">
          {payment.status === 'failed' && (
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-danger hover:bg-danger/90 text-white font-semibold text-xs transition shadow-none"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
              <span>Retry payment</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Receipt Card */}
      <div className="rounded-xl border border-ink-border bg-ink-800 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-ink-border pb-6 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-display text-white tabular tracking-tight">
                {formatCurrency(payment.amount, payment.currency)}
              </h1>
              <Badge status={payment.status} size="lg" />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Transaction created on {formatDate(payment.createdAt)}
            </p>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-ink-700 border border-ink-border text-xs">
            <ShieldCheck className="w-4 h-4 text-success flex-shrink-0" />
            <span>
              {payment.status === 'captured'
                ? 'Cryptographically verified via HMAC-SHA256'
                : 'Razorpay test mode order'}
            </span>
          </div>
        </div>

        {/* Failure reason callout if failed */}
        {payment.status === 'failed' && (
          <div className="p-4 rounded-lg bg-danger-soft border border-danger/25 text-danger text-xs flex items-start gap-3">
            <AlertOctagon className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">Payment failed reason</p>
              <p className="mt-0.5 text-danger font-mono">
                {payment.failureReason || 'Declined by payment processor or customer bank'}
              </p>
              {payment.failureCode && (
                <p className="mt-1 text-[11px] text-danger/80">Error code: {payment.failureCode}</p>
              )}
            </div>
          </div>
        )}

        {/* Key IDs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-lg bg-ink-900 border border-ink-border space-y-1">
            <span className="text-slate-500 text-[11px] font-medium">
              Razorpay order ID
            </span>
            <div className="text-white font-semibold">{payment.razorpayOrderId}</div>
          </div>

          <div className="p-4 rounded-lg bg-ink-900 border border-ink-border space-y-1">
            <span className="text-slate-500 text-[11px] font-medium">
              Razorpay payment ID
            </span>
            <div className="text-white font-semibold">{payment.razorpayPaymentId || 'Pending'}</div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="p-5 rounded-lg bg-ink-900 border border-ink-border space-y-3">
          <h2 className="text-xs font-semibold text-white flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-brass-400" />
            Customer details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block">Name:</span>
              <span className="font-medium text-white">{payment.customer?.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Email:</span>
              <span className="text-slate-300">{payment.customer?.email}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Company:</span>
              <span className="text-slate-300">{payment.customer?.company || '—'}</span>
            </div>
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="p-5 rounded-lg bg-ink-900 border border-ink-border space-y-3 text-xs">
          <h2 className="text-xs font-semibold text-white flex items-center gap-2">
            <Receipt className="w-4 h-4 text-brass-400" />
            Financial settlement breakdown
          </h2>
          <div className="space-y-2 pt-1">
            <div className="flex justify-between text-slate-300">
              <span>Gross charge:</span>
              <span className="tabular font-semibold text-white">{formatCurrency(payment.amount, payment.currency)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Gateway fee (est. 2%):</span>
              <span className="tabular text-slate-400">-{formatCurrency(payment.fee || payment.amount * 0.02)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>GST / Tax (18% on fee):</span>
              <span className="tabular text-slate-400">-{formatCurrency(payment.tax || payment.amount * 0.0036)}</span>
            </div>
            <div className="pt-2 border-t border-ink-border flex justify-between font-semibold text-success text-sm">
              <span>Net settlement:</span>
              <span className="tabular font-display">{formatCurrency(payment.amount - (payment.fee || payment.amount * 0.02) - (payment.tax || payment.amount * 0.0036))}</span>
            </div>
          </div>
        </div>

        {payment.razorpaySignature && (
          <div className="text-[11px] font-mono text-slate-500 break-all p-3 rounded-lg bg-ink-900 border border-ink-border">
            <span className="text-slate-400 font-semibold block mb-0.5">Signature hash (HMAC-SHA256):</span>
            {payment.razorpaySignature}
          </div>
        )}
      </div>
    </div>
  );
}
