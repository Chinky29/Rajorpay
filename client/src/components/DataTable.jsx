import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TableSkeleton } from './Skeleton';
import EmptyState from './EmptyState';

export default function DataTable({
  columns,
  data = [],
  loading = false,
  pagination,
  onPageChange,
  emptyTitle = 'No data available',
  emptyDescription = 'No records match your criteria.',
  onRowClick,
}) {
  if (loading) {
    return (
      <div className="rounded-xl border border-ink-border bg-ink-800 backdrop-blur-xl overflow-hidden">
        <TableSkeleton rows={pagination?.limit || 5} cols={columns.length} />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-ink-border bg-ink-800 backdrop-blur-xl overflow-hidden p-6">
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-ink-border bg-ink-800 backdrop-blur-xl overflow-hidden shadow-xl card-hover">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink-900 border-b border-ink-border text-xs font-medium text-slate-400">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-6 py-4 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-border">
            {data.map((row, rowIdx) => (
              <tr
                key={row._id || row.id || rowIdx}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors duration-150 hover:bg-ink-700/60 ${
                  onRowClick ? 'cursor-pointer group' : ''
                }`}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={`px-6 py-4 text-slate-300 ${col.className || ''}`}>
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between border-t border-ink-border px-6 py-4 text-xs text-slate-400 bg-ink-850/50">
          <div>
            Showing <span className="font-semibold text-white tabular">{data.length}</span> of{' '}
            <span className="font-semibold text-white tabular">{pagination.totalItems}</span> results
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={!pagination.hasPrevPage}
              onClick={() => onPageChange(pagination.page - 1)}
              className="p-1.5 rounded-lg border border-ink-border bg-ink-900 hover:bg-ink-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition shadow-sm"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2.5 py-1 rounded bg-ink-900 border border-ink-border font-mono text-[11px] text-slate-300">
              {pagination.page} / {pagination.totalPages || 1}
            </span>
            <button
              disabled={!pagination.hasNextPage}
              onClick={() => onPageChange(pagination.page + 1)}
              className="p-1.5 rounded-lg border border-ink-border bg-ink-900 hover:bg-ink-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition shadow-sm"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
