import React from 'react';
import { getStatusBadgeVariant } from '../utils/formatters';

export default function Badge({ children, variant, status, size = 'md' }) {
  const finalVariant = variant || (status ? getStatusBadgeVariant(status) : 'neutral');

  const variantStyles = {
    success: 'bg-success-soft text-success border-success/20',
    danger: 'bg-danger-soft text-danger border-danger/20',
    warning: 'bg-warn-soft text-warn border-warn/20',
    warn: 'bg-warn-soft text-warn border-warn/20',
    info: 'bg-info-soft text-info border-info/20',
    brand: 'bg-brass-500/10 text-brass-400 border-brass-500/20',
    brass: 'bg-brass-500/10 text-brass-400 border-brass-500/20',
    neutral: 'bg-ink-700 text-slate-300 border-ink-border',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  const isPending = status === 'created' || status === 'pending' || status === 'authorized' || status === 'paused';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border capitalize tracking-tight ${
        variantStyles[finalVariant] || variantStyles.neutral
      } ${sizeStyles[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full bg-current ${isPending ? 'animate-ping opacity-75' : 'opacity-90'}`}></span>
      <span>{children || status}</span>
    </span>
  );
}
