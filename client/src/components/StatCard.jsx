import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendType = 'up',
  color = 'brass',
}) {
  const iconColorMap = {
    brand: 'bg-brass-500/15 text-brass-400 border border-brass-500/25',
    brass: 'bg-brass-500/15 text-brass-400 border border-brass-500/25',
    emerald: 'bg-success-soft text-success border border-success/25',
    success: 'bg-success-soft text-success border border-success/25',
    rose: 'bg-danger-soft text-danger border border-danger/25',
    danger: 'bg-danger-soft text-danger border border-danger/25',
    amber: 'bg-warn-soft text-warn border border-warn/25',
    warn: 'bg-warn-soft text-warn border border-warn/25',
    sky: 'bg-info-soft text-info border border-info/25',
    info: 'bg-info-soft text-info border border-info/25',
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-slate-500">
          {title}
        </span>
        {Icon && (
          <div className={`p-1.5 rounded-lg ${iconColorMap[color] || iconColorMap.brass}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-1">
        <div className="text-xl font-display text-white tabular">
          {value}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-1 flex items-center justify-between text-[11px]">
          {subtitle && <span className="text-slate-500">{subtitle}</span>}
          {trend && (
            <span
              className={`inline-flex items-center font-medium ${
                trendType === 'up' ? 'text-success' : 'text-danger'
              }`}
            >
              {trendType === 'up' ? (
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-3 h-3 mr-0.5" />
              )}
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
