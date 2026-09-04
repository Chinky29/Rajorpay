import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import { CardSkeleton } from '../components/Skeleton';
import { formatCurrency } from '../utils/formatters';
import {
  BarChart3,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  DollarSign,
  PieChart as PieIcon,
  ShieldCheck,
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

export default function Analytics() {
  const [days, setDays] = useState(30);
  const [overview, setOverview] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [oRes, tRes, hRes] = await Promise.all([
        api.get('/api/analytics/overview'),
        api.get(`/api/analytics/revenue?days=${days}`),
        api.get('/api/analytics/payment-health'),
      ]);
      setOverview(oRes.data.data);
      setTimeline(tRes.data.data.timeline || []);
      setHealthData(hRes.data.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-brand-400" />
            Financial Analytics & Telemetry
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Real-time conversion metrics, gross settlement volume, and health diagnostics
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          {[7, 14, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                days === d
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stats */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Gross Revenue"
            value={formatCurrency(overview?.totalRevenue)}
            subtitle={`${overview?.successfulPayments || 0} captures`}
            icon={DollarSign}
            color="emerald"
          />

          <StatCard
            title="Avg Transaction Value"
            value={formatCurrency(overview?.avgTransactionValue)}
            subtitle="Per successful charge"
            icon={TrendingUp}
            color="brand"
          />

          <StatCard
            title="Success Conversion"
            value={`${overview?.successRate || 0}%`}
            subtitle={`${overview?.totalTransactions || 0} total attempts`}
            icon={CheckCircle2}
            color="sky"
          />

          <StatCard
            title="Failure Rate"
            value={`${overview?.failureRate || 0}%`}
            subtitle="Checkout drop-offs"
            icon={AlertTriangle}
            color="rose"
          />
        </div>
      )}

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Timeline (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-400" />
                Revenue Growth Timeline ({days} Days)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Daily captured settlement volume</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-semibold">
              Live Ingestion
            </span>
          </div>

          <div className="h-72 w-full">
            {timeline.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No revenue recorded in the selected window.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#F8FAFC',
                      fontSize: '12px',
                    }}
                    formatter={(val) => [`₹${val}`, 'Daily Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6366F1"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#analyticsGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Deep Health & Recommendations (1 col) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Health Diagnostics
              </span>
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>

            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div>
                <span className="text-3xl font-extrabold text-white font-mono">
                  {healthData?.score || 100}
                </span>
                <span className="text-slate-500 text-sm font-bold ml-1">/100</span>
              </div>
              <Badge variant={healthData?.score >= 80 ? 'success' : 'warning'}>
                {healthData?.status || 'Good'}
              </Badge>
            </div>

            <div className="space-y-3 text-xs">
              <span className="font-semibold text-slate-300 block uppercase tracking-wider text-[11px]">
                System Recommendations:
              </span>
              {healthData?.recommendations?.map((rec, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-slate-300 flex items-start gap-2.5"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500">
            * PayFlow Payment Health Score evaluates success velocity, failure frequency, and webhook synchronization.
          </div>
        </div>
      </div>
    </div>
  );
}
