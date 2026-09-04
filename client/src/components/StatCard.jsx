import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendType = 'up',
  color = 'brand',
}) {
  const colorMap = {
    brand: 'from-brand-500/10 to-indigo-500/5 text-brand-400 border-brand-500/20',
    emerald: 'from-emerald-500/10 to-teal-500/5 text-emerald-400 border-emerald-500/20',
    rose: 'from-rose-500/10 to-red-500/5 text-rose-400 border-rose-500/20',
    amber: 'from-amber-500/10 to-orange-500/5 text-amber-400 border-amber-500/20',
    sky: 'from-sky-500/10 to-blue-500/5 text-sky-400 border-sky-500/20',
  };

  const iconBgMap = {
    brand: 'bg-brand-500/20 text-brand-300',
    emerald: 'bg-emerald-500/20 text-emerald-300',
    rose: 'bg-rose-500/20 text-rose-300',
    amber: 'bg-amber-500/20 text-amber-300',
    sky: 'bg-sky-500/20 text-sky-300',
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-b ${colorMap[color] || colorMap.brand} bg-slate-900/60 p-5 backdrop-blur-xl shadow-lg transition-all duration-200 hover:border-slate-700 hover:translate-y-[-2px]`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-xl ${iconBgMap[color] || iconBgMap.brand}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          {value}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-2 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-400">{subtitle}</span>}
          {trend && (
            <span
              className={`inline-flex items-center font-semibold ${
                trendType === 'up' ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {trendType === 'up' ? (
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              )}
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
