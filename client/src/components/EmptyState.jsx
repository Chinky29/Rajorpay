import React from 'react';
import { Layers } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Layers,
  title = 'No items found',
  description = 'Get started by creating your first entry.',
  actionText,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-ink-border bg-ink-900/40">
      <div className="p-3.5 rounded-xl bg-ink-800 border border-ink-border text-slate-400 mb-4">
        <Icon className="w-7 h-7 text-slate-400" />
      </div>
      <h3 className="text-base font-semibold text-white mb-1 font-display">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-6">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brass-500 hover:bg-brass-400 text-ink-950 font-semibold text-sm transition active:scale-95"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
