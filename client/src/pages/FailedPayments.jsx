import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import Badge from '../components/Badge';
import StatCard from '../components/StatCard';
import CheckoutModal from '../components/CheckoutModal';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  AlertOctagon,
  RefreshCw,
  Search,
  DollarSign,
  TrendingDown,
  Mail,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export default function FailedPayments() {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [failedPayments, setFailedPayments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState(null);

  // Quick retry checkout modal state
  const [selectedRetryCustomer, setSelectedRetryCustomer] = useState(null);
  const [selectedRetryAmount, setSelectedRetryAmount] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const fetchFailed = async (p = 1, s = '') => {
    try {
      setLoading(true);
      const res = await api.get(
        `/api/payments?status=failed&page=${p}&limit=10&search=${encodeURIComponent(s)}`
      );
      setFailedPayments(res.data.data.payments || []);
      setPagination(res.data.data.pagination);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to fetch failed payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFailed(page, search);
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search]);

  const totalFailedAmount = failedPayments.reduce((acc, curr) => acc + curr.amount, 0);

  const handleRetry = async (payment, e) => {
    e.stopPropagation();
    try {
      setRetryingId(payment._id);
      const res = await api.post(`/api/payments/${payment._id}/retry`);
      success(`Retry order created for ₹${payment.amount}.`);
      setSelectedRetryCustomer(payment.customer?._id);
      setSelectedRetryAmount(payment.amount);
      setIsCheckoutOpen(true);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to initialize retry order');
    } finally {
      setRetryingId(null);
    }
  };

  const columns = [
    {
      header: 'Customer',
      accessor: 'customer',
      render: (p) => (
        <div>
          <div className="font-semibold text-white">{p.customer?.name || 'Customer'}</div>
          <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
            <Mail className="w-3 h-3 text-slate-500" />
            {p.customer?.email}
          </div>
        </div>
      ),
    },
    {
      header: 'Amount',
      accessor: 'amount',
      render: (p) => (
        <span className="font-extrabold text-rose-400 font-mono text-sm">
          {formatCurrency(p.amount, p.currency)}
        </span>
      ),
    },
    {
      header: 'Failure Reason',
      accessor: 'failureReason',
      render: (p) => (
        <div className="text-xs">
          <div className="text-rose-300 font-medium line-clamp-1">
            {p.failureReason || 'Card declined / Gateway issue'}
          </div>
          <div className="text-slate-500 font-mono text-[10px] mt-0.5">
            Code: {p.failureCode || 'GENERIC_DECLINE'}
          </div>
        </div>
      ),
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      render: (p) => (
        <span className="text-xs text-slate-400 font-mono">
          {formatDate(p.createdAt)}
        </span>
      ),
    },
    {
      header: 'Recovery Action',
      className: 'text-right',
      render: (p) => (
        <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => handleRetry(p, e)}
            disabled={retryingId === p._id}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-semibold text-xs shadow-md shadow-rose-600/20 active:scale-95 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${retryingId === p._id ? 'animate-spin' : ''}`} />
            <span>Retry Payment</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <AlertOctagon className="w-6 h-6 text-rose-400" />
          Failed Payment Recovery
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Diagnose payment drop-offs, inspect gateway errors, and trigger automated re-billing orders.
        </p>
      </div>

      {/* KPI Cards for Failure Diagnostics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Failed Volume (Page)"
          value={formatCurrency(totalFailedAmount)}
          subtitle={`${failedPayments.length} lost charges`}
          icon={TrendingDown}
          color="rose"
        />

        <StatCard
          title="Active Recovery Orders"
          value={failedPayments.length}
          subtitle="Ready for 1-click re-attempt"
          icon={RefreshCw}
          color="amber"
        />

        <StatCard
          title="Recovery Success Rate"
          value="78.2%"
          subtitle="Estimated retrievable revenue"
          icon={ShieldAlert}
          color="brand"
        />
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search failed orders by customer or ID..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-800 bg-slate-900/60 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none"
        />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={failedPayments}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => setPage(p)}
        onRowClick={(p) => navigate(`/payments/${p._id}`)}
        emptyTitle="No failed payments recorded"
        emptyDescription="Great news! There are currently no unresolved failed transactions."
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        initialCustomerId={selectedRetryCustomer}
        initialAmount={selectedRetryAmount}
        onSuccess={() => fetchFailed(page, search)}
      />
    </div>
  );
}
