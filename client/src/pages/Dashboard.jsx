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
  Users,
  Repeat,
  Activity,
  Plus,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
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

  const health = data?.paymentHealth || { score: 100, status: 'Excellent' };

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Financial & Payment Overview
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time telemetry, transaction flows, and health metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCheckoutOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-brand-600/25 active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Test Checkout</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(data?.totalRevenue)}
            subtitle={`${data?.successfulPayments || 0} successful charges`}
            icon={DollarSign}
            color="emerald"
            trend="+18.4% vs last mo"
            trendType="up"
          />

          <StatCard
            title="Success Rate"
            value={`${data?.successRate || 0}%`}
            subtitle={`${data?.totalTransactions || 0} total attempts`}
            icon={CheckCircle2}
            color="brand"
            trend="Industry top tier"
            trendType="up"
          />

          <StatCard
            title="Failed Payments"
            value={formatCurrency(data?.failedAmount)}
            subtitle={`${data?.failedPayments || 0} lost attempts`}
            icon={AlertOctagon}
            color="rose"
            trend="Recovery available"
            trendType="down"
          />

          <StatCard
            title="Active Subscriptions"
            value={data?.activeSubscriptions || 0}
            subtitle={`MRR: ${formatCurrency(data?.mrr)}`}
            icon={Repeat}
            color="sky"
            trend="Predictable ARR"
            trendType="up"
          />
        </div>
      )}

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Velocity Chart (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Revenue Trajectory (14 Days)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Gross settlement volume over time
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
              Razorpay Test Ingestion
            </span>
          </div>

          <div className="h-64 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono">
                Rendering timeline...
              </div>
            ) : timeline.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No revenue records in this timeframe
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#F8FAFC',
                      fontSize: '12px',
                    }}
                    formatter={(val) => [`₹${val}`, 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#revenueGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* PayFlow Payment Health Score Card (1 col) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Proprietary Metric
              </span>
              <Activity className="w-5 h-5 text-brand-400" />
            </div>

            <h2 className="text-lg font-bold text-white tracking-tight">
              Payment Health Score
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-dimensional conversion metric (0–100)
            </p>

            <div className="my-6 text-center">
              <div className="inline-flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-white tracking-tight">
                  {health.score}
                </span>
                <span className="text-slate-500 font-bold text-lg">/100</span>
              </div>
              <div className="mt-2">
                <Badge variant={health.score >= 80 ? 'success' : health.score >= 60 ? 'warning' : 'danger'}>
                  {health.status} Status
                </Badge>
              </div>
            </div>

            {/* Contributing factors breakdown */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Capture Rate</span>
                <span className="font-mono font-semibold text-emerald-400">{health.successRate}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${health.successRate}%` }}></div>
              </div>

              <div className="flex justify-between items-center text-slate-300 pt-1">
                <span>Failure Risk</span>
                <span className="font-mono font-semibold text-rose-400">{health.failureRate}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-rose-400 h-full rounded-full" style={{ width: `${health.failureRate}%` }}></div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80">
            <NavLink
              to="/analytics"
              className="flex items-center justify-between text-xs font-semibold text-brand-400 hover:text-brand-300 transition"
            >
              <span>View deep health diagnostics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
        </div>
      </div>

      {/* Recent Transactions & Quick Actions */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Recent Payment Transactions</h3>
            <p className="text-xs text-slate-400 mt-0.5">Live order captures and settlements</p>
          </div>
          <NavLink
            to="/payments"
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition"
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
              <thead className="bg-slate-900/80 border-b border-slate-800 text-xs uppercase font-semibold text-slate-400">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Order / Payment ID</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data?.recentTransactions?.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-800/30 transition">
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
                    <td className="px-6 py-4 font-bold text-white">
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
