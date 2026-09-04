import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import Badge from '../components/Badge';
import CheckoutModal from '../components/CheckoutModal';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatDate, formatDateShort } from '../utils/formatters';
import {
  CreditCard,
  Search,
  Plus,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export default function Payments() {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const fetchPayments = async (p = 1, s = '', status = '', method = '') => {
    try {
      setLoading(true);
      let url = `/api/payments?page=${p}&limit=10&search=${encodeURIComponent(s)}`;
      if (status) url += `&status=${status}`;
      if (method) url += `&method=${method}`;
      const res = await api.get(url);
      setPayments(res.data.data.payments || []);
      setPagination(res.data.data.pagination);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPayments(page, search, statusFilter, methodFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search, statusFilter, methodFilter]);

  const columns = [
    {
      header: 'Customer',
      accessor: 'customer',
      render: (p) => (
        <div>
          <div className="font-semibold text-white">{p.customer?.name || 'Customer'}</div>
          <div className="text-xs text-slate-400">{p.customer?.email}</div>
        </div>
      ),
    },
    {
      header: 'Razorpay Reference',
      accessor: 'razorpayOrderId',
      render: (p) => (
        <div className="font-mono text-xs">
          <div className="text-white font-medium">{p.razorpayOrderId}</div>
          <div className="text-slate-500 mt-0.5">{p.razorpayPaymentId || 'Awaiting checkout'}</div>
        </div>
      ),
    },
    {
      header: 'Amount',
      accessor: 'amount',
      render: (p) => (
        <span className="font-extrabold text-white font-mono text-sm">
          {formatCurrency(p.amount, p.currency)}
        </span>
      ),
    },
    {
      header: 'Method',
      accessor: 'method',
      render: (p) => (
        <span className="text-xs uppercase font-semibold text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-700/60">
          {p.method}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (p) => <Badge status={p.status} size="sm" />,
    },
    {
      header: 'Created At',
      accessor: 'createdAt',
      render: (p) => (
        <span className="text-xs text-slate-400 font-mono">
          {formatDate(p.createdAt)}
        </span>
      ),
    },
    {
      header: '',
      className: 'text-right',
      render: (p) => (
        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition" />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Payments & Ledger</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Complete transaction ledger with Razorpay Orders, HMAC validation status, and audit trails
          </p>
        </div>
        <button
          onClick={() => setIsCheckoutOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-600/25 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Transaction</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Order ID, Payment ID, Customer name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-800 bg-slate-900/60 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2 text-sm text-slate-300 focus:border-brand-500 focus:outline-none flex-1 lg:flex-initial"
          >
            <option value="">All Statuses</option>
            <option value="captured">Captured / Paid</option>
            <option value="failed">Failed</option>
            <option value="created">Created (Pending)</option>
            <option value="authorized">Authorized</option>
            <option value="refunded">Refunded</option>
          </select>

          <select
            value={methodFilter}
            onChange={(e) => {
              setMethodFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2 text-sm text-slate-300 focus:border-brand-500 focus:outline-none flex-1 lg:flex-initial"
          >
            <option value="">All Methods</option>
            <option value="card">Card</option>
            <option value="upi">UPI</option>
            <option value="netbanking">Net Banking</option>
            <option value="wallet">Wallet</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <DataTable
        columns={columns}
        data={payments}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => setPage(p)}
        onRowClick={(p) => navigate(`/payments/${p._id}`)}
        emptyTitle="No payments found"
        emptyDescription="Create a test checkout order or adjust your active search filters."
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={() => fetchPayments(page, search, statusFilter, methodFilter)}
      />
    </div>
  );
}
