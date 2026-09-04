import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import Badge from '../components/Badge';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatDateShort } from '../utils/formatters';
import {
  Repeat,
  Plus,
  Search,
  DollarSign,
  Users,
  Calendar,
  XCircle,
  PlayCircle,
  PauseCircle,
} from 'lucide-react';

export default function Subscriptions() {
  const { success, error } = useToast();

  const [subscriptions, setSubscriptions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Add Subscription Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    customerId: '',
    plan: 'Pro',
    amount: 4999,
    interval: 'monthly',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchSubscriptions = async (p = 1, status = '', plan = '') => {
    try {
      setLoading(true);
      let url = `/api/subscriptions?page=${p}&limit=10`;
      if (status) url += `&status=${status}`;
      if (plan) url += `&plan=${plan}`;
      const res = await api.get(url);
      setSubscriptions(res.data.data.subscriptions || []);
      setPagination(res.data.data.pagination);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions(page, statusFilter, planFilter);
  }, [page, statusFilter, planFilter]);

  const handleOpenCreate = async () => {
    try {
      const res = await api.get('/api/customers?limit=50');
      setCustomers(res.data.data.customers || []);
      if (res.data.data.customers?.length > 0) {
        setFormData((prev) => ({ ...prev, customerId: res.data.data.customers[0]._id }));
      }
      setIsModalOpen(true);
    } catch (err) {
      error('Failed to load customers list');
    }
  };

  const handleStatusChange = async (subId, newStatus) => {
    try {
      await api.patch(`/api/subscriptions/${subId}`, { status: newStatus });
      success(`Subscription status updated to ${newStatus}`);
      fetchSubscriptions(page, statusFilter, planFilter);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update subscription');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/api/subscriptions', {
        ...formData,
        amount: Number(formData.amount),
      });
      success('Subscription created successfully');
      setIsModalOpen(false);
      fetchSubscriptions(page, statusFilter, planFilter);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create subscription');
    } finally {
      setSubmitting(false);
    }
  };

  const activeCount = subscriptions.filter((s) => s.status === 'active').length;
  const mrrTotal = subscriptions
    .filter((s) => s.status === 'active')
    .reduce((acc, s) => acc + (s.interval === 'yearly' ? s.amount / 12 : s.amount), 0);

  const columns = [
    {
      header: 'Customer',
      accessor: 'customer',
      render: (s) => (
        <div>
          <div className="font-semibold text-white">{s.customer?.name || 'Customer'}</div>
          <div className="text-xs text-slate-400">{s.customer?.email}</div>
        </div>
      ),
    },
    {
      header: 'Plan',
      accessor: 'plan',
      render: (s) => (
        <span className="font-bold text-white text-xs bg-brand-500/10 text-brand-300 border border-brand-500/20 px-2.5 py-1 rounded-lg">
          {s.plan} Tier
        </span>
      ),
    },
    {
      header: 'Recurring Amount',
      accessor: 'amount',
      render: (s) => (
        <div>
          <span className="font-bold text-white font-mono text-sm">
            {formatCurrency(s.amount, s.currency)}
          </span>
          <span className="text-[11px] text-slate-400 ml-1">/{s.interval}</span>
        </div>
      ),
    },
    {
      header: 'Next Billing Cycle',
      accessor: 'currentPeriodEnd',
      render: (s) => (
        <span className="text-xs text-slate-400 font-mono">
          {formatDateShort(s.currentPeriodEnd)}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (s) => <Badge status={s.status} size="sm" />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (s) => (
        <div className="flex items-center justify-end gap-1.5">
          {s.status === 'active' && (
            <button
              onClick={() => handleStatusChange(s._id, 'paused')}
              className="p-1.5 rounded-lg text-amber-400 hover:bg-amber-500/10 transition"
              title="Pause Subscription"
            >
              <PauseCircle className="w-4 h-4" />
            </button>
          )}
          {s.status === 'paused' && (
            <button
              onClick={() => handleStatusChange(s._id, 'active')}
              className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition"
              title="Resume Subscription"
            >
              <PlayCircle className="w-4 h-4" />
            </button>
          )}
          {s.status !== 'canceled' && (
            <button
              onClick={() => handleStatusChange(s._id, 'canceled')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
              title="Cancel Subscription"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Recurring Subscriptions</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            SaaS recurring billing schedules, MRR tracking, and renewal management
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-600/25 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Subscription</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Monthly Recurring Revenue (MRR)"
          value={formatCurrency(mrrTotal)}
          subtitle="Normalized active recurring volume"
          icon={DollarSign}
          color="emerald"
        />

        <StatCard
          title="Active Subscribers"
          value={activeCount}
          subtitle="Customer renewal rate 96%"
          icon={Users}
          color="brand"
        />

        <StatCard
          title="Renewal Interval"
          value="30 Days"
          subtitle="Automated billing cycle"
          icon={Calendar}
          color="sky"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2 text-sm text-slate-300 focus:border-brand-500 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="canceled">Canceled</option>
          <option value="past_due">Past Due</option>
        </select>

        <select
          value={planFilter}
          onChange={(e) => {
            setPlanFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2 text-sm text-slate-300 focus:border-brand-500 focus:outline-none"
        >
          <option value="">All Plans</option>
          <option value="Basic">Basic</option>
          <option value="Pro">Pro</option>
          <option value="Enterprise">Enterprise</option>
        </select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={subscriptions}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => setPage(p)}
        emptyTitle="No subscriptions found"
        emptyDescription="Create your first customer subscription to start recurring billing."
      />

      {/* Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Customer Subscription"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Select Customer <span className="text-rose-400">*</span>
            </label>
            <select
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
            >
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.email})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Plan Tier
              </label>
              <select
                value={formData.plan}
                onChange={(e) => {
                  const plan = e.target.value;
                  const price = plan === 'Basic' ? 999 : plan === 'Pro' ? 4999 : 19999;
                  setFormData({ ...formData, plan, amount: price });
                }}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
              >
                <option value="Basic">Basic (₹999)</option>
                <option value="Pro">Pro (₹4,999)</option>
                <option value="Enterprise">Enterprise (₹19,999)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Interval
              </label>
              <select
                value={formData.interval}
                onChange={(e) => setFormData({ ...formData, interval: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Custom Amount (₹ INR)
            </label>
            <input
              type="number"
              min="0"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white font-mono focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || customers.length === 0}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-md shadow-brand-600/25 transition disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Start Subscription'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
