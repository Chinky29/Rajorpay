import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import CheckoutModal from '../components/CheckoutModal';
import { CardSkeleton, TableSkeleton } from '../components/Skeleton';
import { formatCurrency, formatDateShort } from '../utils/formatters';
import {
  DollarSign,
  CheckCircle2,
  AlertOctagon,
  Repeat,
  Activity,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [overviewRes, revenueRes] = await Promise.all([
        api.get('/api/analytics/overview'),
        api.get('/api/analytics/revenue?days=14'),
      ]);
      setData(overviewRes.data.data);
      setTimeline(revenueRes.data.data.timeline || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const health = data?.paymentHealth || { score: 100, status: 'Excellent', successRate: 100, failureRate: 0 };

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-display">
            Financial and payment overview
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time telemetry, transaction flows, and health metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCheckoutOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brass-500 hover:bg-brass-400 text-ink-950 font-semibold text-sm active:scale-95 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create test checkout</span>
          </button>
        </div>
      </div>

      {/* KPI Section */}
      {loading ? (
        <div className="rounded-xl border border-ink-border bg-ink-800 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-ink-border bg-gradient-to-br from-ink-800 via-ink-800 to-ink-850 p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brass-500/[0.02] rounded-full blur-3xl pointer-events-none" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:divide-x lg:divide-ink-border relative z-10">
            {/* Hero Metric: Total Revenue */}
            <div className="lg:col-span-4 flex flex-col justify-between pr-0 lg:pr-6">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Total revenue</span>
                  <div className="p-1.5 rounded-lg bg-brass-500/15 text-brass-400 border border-brass-500/25">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 text-3xl sm:text-4xl font-display text-white tabular tracking-tight">
                  {formatCurrency(data?.totalRevenue)}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="text-slate-400">{`${data?.successfulPayments || 0} successful charges`}</span>
                <span className="inline-flex items-center font-medium text-success bg-success-soft px-2 py-0.5 rounded text-[11px] border border-success/20">
                  <TrendingUp className="w-3.5 h-3.5 mr-1" />
                  +18.4% vs last mo
                </span>
              </div>
            </div>

            {/* Other three KPIs in a row */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6 pl-0 lg:pl-6 pt-6 lg:pt-0 border-t lg:border-t-0 border-ink-border">
              <StatCard
                title="Success rate"
                value={`${data?.successRate || 0}%`}
                subtitle={`${data?.totalTransactions || 0} total attempts`}
                icon={CheckCircle2}
                color="brass"
                trend="Industry top tier"
                trendType="up"
              />

              <StatCard
                title="Failed payments"
                value={formatCurrency(data?.failedAmount)}
                subtitle={`${data?.failedPayments || 0} lost attempts`}
                icon={AlertOctagon}
                color="danger"
                trend="Recovery available"
                trendType="down"
              />

              <StatCard
                title="Active subscriptions"
                value={data?.activeSubscriptions || 0}
                subtitle={`MRR: ${formatCurrency(data?.mrr)}`}
                icon={Repeat}
                color="info"
                trend="Predictable ARR"
                trendType="up"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Velocity Chart (2 cols) */}
        <div className="lg:col-span-2 rounded-xl border border-ink-border bg-ink-800 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between card-hover">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brass-400" />
                Revenue trajectory (14 days)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Gross settlement volume over time
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-ink-700 text-slate-300 border border-ink-border">
              Test mode
            </span>
          </div>

          <div className="w-full">
            {loading ? (
              <div className="h-48 flex items-center justify-center text-xs text-slate-500 font-mono">
                Rendering timeline...
              </div>
            ) : timeline.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-xs text-slate-400 gap-2 border border-dashed border-ink-border rounded-lg bg-ink-900/60 p-4">
                <TrendingUp className="w-5 h-5 text-slate-500" />
                <span>No revenue records in this timeframe</span>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C9A25D" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#C9A25D" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#1E232F" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F1319',
                        borderColor: '#262B38',
                        borderRadius: '8px',
                        color: '#F8FAFC',
                        fontSize: '12px',
                      }}
                      formatter={(val) => [`₹${val}`, 'Revenue']}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#C9A25D"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#revenueGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* PayFlow Payment Health Score Card (1 col) */}
        <div className="rounded-xl border border-ink-border bg-ink-800 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between card-hover">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-slate-500">
                {"PayFlow's own conversion metric, 0–100"}
              </span>
              <Activity className="w-5 h-5 text-brass-400" />
            </div>

            <h2 className="text-lg font-bold text-white tracking-tight font-display">
              Payment health
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-dimensional conversion metric (0–100)
            </p>

            <div className="my-6 text-center">
              <div className="inline-flex items-baseline gap-1">
                <span className="text-5xl font-display text-white tracking-tight tabular">
                  {health.score}
                </span>
                <span className="text-slate-500 font-medium text-lg">/100</span>
              </div>
              <div className="mt-2 text-sm font-semibold">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  health.score >= 80 ? 'bg-success-soft text-success border border-success/20' : health.score >= 60 ? 'bg-warn-soft text-warn border border-warn/20' : 'bg-danger-soft text-danger border border-danger/20'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                  {health.status} status
                </span>
              </div>
            </div>

            {/* Contributing factors breakdown */}
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between items-center text-slate-300 mb-1">
                  <span>Capture rate</span>
                  <span className="font-mono font-semibold text-success tabular">{health.successRate || 0}%</span>
                </div>
                <div className="w-full bg-ink-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-success h-full rounded-full transition-all duration-500" style={{ width: `${health.successRate || 0}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-slate-300 mb-1">
                  <span>Failure risk</span>
                  <span className="font-mono font-semibold text-danger tabular">{health.failureRate || 0}%</span>
                </div>
                <div className="w-full bg-ink-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-danger h-full rounded-full transition-all duration-500" style={{ width: `${health.failureRate || 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-ink-border">
            <NavLink
              to="/analytics"
              className="flex items-center justify-between text-xs font-semibold text-brass-400 hover:text-brass-300 transition group"
            >
              <span>View deep health diagnostics</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </NavLink>
          </div>
        </div>
      </div>

      {/* Recent Transactions & Quick Actions */}
      <div className="rounded-xl border border-ink-border bg-ink-800 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-ink-border flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Recent payment transactions</h3>
            <p className="text-xs text-slate-400 mt-0.5">Live order captures and settlements</p>
          </div>
          <NavLink
            to="/payments"
            className="text-xs font-semibold text-brass-400 hover:text-brass-300 flex items-center gap-1 transition"
          >
            <span>All transactions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>

        {loading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-ink-900 border-b border-ink-border text-xs font-medium text-slate-400">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Order / payment ID</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-border">
                {data?.recentTransactions?.map((tx) => (
                  <tr key={tx._id} className="hover:bg-ink-700/50 transition">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{tx.customer?.name || 'Customer'}</div>
                      <div className="text-xs text-slate-400">{tx.customer?.email}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-300">
                      <div>{tx.razorpayOrderId}</div>
                      {tx.razorpayPaymentId && (
                        <div className="text-slate-500">{tx.razorpayPaymentId}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-white tabular">
                      {formatCurrency(tx.amount, tx.currency)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={tx.status} />
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {formatDateShort(tx.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={() => fetchDashboardData()}
      />
    </div>
  );
}
