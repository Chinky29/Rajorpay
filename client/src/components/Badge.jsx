import React from 'react';
import { getStatusBadgeVariant } from '../utils/formatters';

export default function Badge({ children, variant, status, size = 'md' }) {
  const finalVariant = variant || (status ? getStatusBadgeVariant(status) : 'neutral');

  const variantStyles = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    info: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    brand: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
    neutral: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border capitalize ${
        variantStyles[finalVariant] || variantStyles.neutral
      } ${sizeStyles[size]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80"></span>
      {children || status}
    </span>
  );
}
