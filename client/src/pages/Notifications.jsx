import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { formatDate } from '../utils/formatters';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  AlertOctagon,
  Repeat,
  Info,
  ExternalLink,
} from 'lucide-react';

export default function Notifications() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const getIcon = (type) => {
    switch (type) {
      case 'payment_success':
        return <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />;
      case 'payment_failed':
        return <AlertOctagon className="w-5 h-5 text-danger flex-shrink-0" />;
      case 'subscription_created':
        return <Repeat className="w-5 h-5 text-info flex-shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-brass-400 flex-shrink-0" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-display flex items-center gap-2">
            <Bell className="w-6 h-6 text-brass-400" />
            Notification center
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Real-time event logs, payment captures, failure alerts, and customer subscriptions
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-ink-800 hover:bg-ink-700 text-slate-200 text-xs font-semibold border border-ink-border transition"
          >
            <CheckCheck className="w-4 h-4 text-brass-400" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-ink-border bg-ink-800 text-slate-400">
            <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="font-semibold text-white">No notifications</p>
            <p className="text-xs mt-1">{"You're all caught up with your business activity."}</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => {
                markAsRead(n._id);
                if (n.link) navigate(n.link);
              }}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                n.isRead
                  ? 'bg-ink-800 border-ink-border hover:bg-ink-700/60'
                  : 'bg-brass-500/10 border-brass-500/25 hover:bg-brass-500/15'
              }`}
            >
              <div className="p-2 rounded-lg bg-ink-700 border border-ink-border mt-0.5">
                {getIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className={`text-sm font-semibold ${n.isRead ? 'text-slate-200' : 'text-white'}`}>
                    {n.title}
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono flex-shrink-0">
                    {formatDate(n.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{n.message}</p>
              </div>

              {n.link && (
                <div className="self-center text-slate-500 hover:text-white">
                  <ExternalLink className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
