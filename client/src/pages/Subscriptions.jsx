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
          <div className="font-medium text-white">{s.customer?.name || 'Customer'}</div>
          <div className="text-xs text-slate-400">{s.customer?.email}</div>
        </div>
      ),
    },
    {
      header: 'Plan',
      accessor: 'plan',
      render: (s) => (
        <span className="font-medium text-xs bg-brass-500/10 text-brass-400 border border-brass-500/20 px-2.5 py-1 rounded-lg">
          {s.plan} tier
        </span>
      ),
    },
    {
      header: 'Recurring amount',
      accessor: 'amount',
      render: (s) => (
        <div>
          <span className="font-semibold text-white tabular">
            {formatCurrency(s.amount, s.currency)}
          </span>
          <span className="text-[11px] text-slate-400 ml-1">/{s.interval}</span>
        </div>
      ),
    },
    {
      header: 'Next billing cycle',
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
              className="p-1.5 rounded-lg text-warn hover:bg-warn-soft transition"
              title="Pause subscription"
            >
              <PauseCircle className="w-4 h-4" />
            </button>
          )}
          {s.status === 'paused' && (
            <button
              onClick={() => handleStatusChange(s._id, 'active')}
              className="p-1.5 rounded-lg text-success hover:bg-success-soft transition"
              title="Resume subscription"
            >
              <PlayCircle className="w-4 h-4" />
            </button>
          )}
          {s.status !== 'canceled' && (
            <button
              onClick={() => handleStatusChange(s._id, 'canceled')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-danger hover:bg-danger-soft transition"
              title="Cancel subscription"
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
          <h1 className="text-2xl font-bold text-white tracking-tight font-display">Recurring subscriptions</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            SaaS recurring billing schedules, MRR tracking, and renewal management
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brass-500 hover:bg-brass-400 text-ink-950 font-semibold text-sm active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New subscription</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="rounded-xl border border-ink-border bg-ink-800 p-5 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:divide-x sm:divide-ink-border">
          <div className="sm:pr-6">
            <StatCard
              title="Monthly recurring revenue (MRR)"
              value={formatCurrency(mrrTotal)}
              subtitle="Normalized active recurring volume"
              icon={DollarSign}
              color="brass"
            />
          </div>

          <div className="sm:px-6 pt-4 sm:pt-0 border-t sm:border-t-0 border-ink-border">
            <StatCard
              title="Active subscribers"
              value={activeCount}
              subtitle="Customer renewal rate 96%"
              icon={Users}
              color="brass"
            />
          </div>

          <div className="sm:pl-6 pt-4 sm:pt-0 border-t sm:border-t-0 border-ink-border">
            <StatCard
              title="Renewal interval"
              value="30 Days"
              subtitle="Automated billing cycle"
              icon={Calendar}
              color="info"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-ink-border bg-ink-800 px-3.5 py-2 text-sm text-slate-300 focus:border-brass-500 focus:outline-none focus:ring-1 focus:ring-brass-500"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="canceled">Canceled</option>
          <option value="past_due">Past due</option>
        </select>

        <select
          value={planFilter}
          onChange={(e) => {
            setPlanFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-ink-border bg-ink-800 px-3.5 py-2 text-sm text-slate-300 focus:border-brass-500 focus:outline-none focus:ring-1 focus:ring-brass-500"
        >
          <option value="">All plans</option>
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
        title="Create customer subscription"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Select customer <span className="text-danger">*</span>
            </label>
            <select
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              required
              className="w-full rounded-lg border border-ink-border bg-ink-800 px-3.5 py-2.5 text-sm text-white focus:border-brass-500 focus:outline-none focus:ring-1 focus:ring-brass-500"
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
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Plan tier
              </label>
              <select
                value={formData.plan}
                onChange={(e) => {
                  const plan = e.target.value;
                  const price = plan === 'Basic' ? 999 : plan === 'Pro' ? 4999 : 19999;
                  setFormData({ ...formData, plan, amount: price });
                }}
                className="w-full rounded-lg border border-ink-border bg-ink-800 px-3.5 py-2.5 text-sm text-white focus:border-brass-500 focus:outline-none focus:ring-1 focus:ring-brass-500"
              >
                <option value="Basic">Basic (₹999)</option>
                <option value="Pro">Pro (₹4,999)</option>
                <option value="Enterprise">Enterprise (₹19,999)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Interval
              </label>
              <select
                value={formData.interval}
                onChange={(e) => setFormData({ ...formData, interval: e.target.value })}
                className="w-full rounded-lg border border-ink-border bg-ink-800 px-3.5 py-2.5 text-sm text-white focus:border-brass-500 focus:outline-none focus:ring-1 focus:ring-brass-500"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Custom amount (₹ INR)
            </label>
            <input
              type="number"
              min="0"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full rounded-lg border border-ink-border bg-ink-800 px-3.5 py-2.5 text-sm text-white tabular font-mono focus:border-brass-500 focus:outline-none focus:ring-1 focus:ring-brass-500"
            />
          </div>

          <div className="pt-4 border-t border-ink-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || customers.length === 0}
              className="px-5 py-2.5 rounded-lg bg-brass-500 hover:bg-brass-400 text-ink-950 font-semibold text-sm transition disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Start subscription'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
