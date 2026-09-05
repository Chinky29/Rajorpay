import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ink-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-xl bg-ink-700 border border-brass-500/40 flex items-center justify-center mb-6">
        <Layers className="w-8 h-8 text-brass-400" />
      </div>
      <h1 className="text-6xl font-display text-white tabular tracking-tight">404</h1>
      <h2 className="text-xl font-bold text-slate-200 mt-2 font-display">Page not found</h2>
      <p className="text-sm text-slate-400 max-w-sm mt-2 mb-8">
        The page or resource you are searching for does not exist or has been relocated.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brass-500 hover:bg-brass-400 text-ink-950 text-sm font-semibold transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to dashboard</span>
      </Link>
    </div>
  );
}
