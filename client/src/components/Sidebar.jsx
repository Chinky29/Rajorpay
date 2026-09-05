import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CreditCard,
  AlertOctagon,
  Users,
  Package,
  Repeat,
  BarChart3,
  Bell,
  Settings,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export default function Sidebar({ isOpen, setIsOpen, isMobile, closeMobile }) {
  const { unreadCount } = useNotifications();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Transactions', href: '/payments', icon: CreditCard },
    { name: 'Failed Payments', href: '/failed-payments', icon: AlertOctagon, highlight: true },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Products & Plans', href: '/products', icon: Package },
    { name: 'Subscriptions', href: '/subscriptions', icon: Repeat },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Notifications', href: '/notifications', icon: Bell, badge: unreadCount },
    { name: 'Settings & API', href: '/settings', icon: Settings },
  ];

  const handleLinkClick = () => {
    if (isMobile && closeMobile) {
      closeMobile();
    }
  };

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r border-ink-border bg-ink-950/95 backdrop-blur-2xl transition-all duration-300 ${
        isMobile
          ? isOpen
            ? 'translate-x-0 w-64'
            : '-translate-x-full w-64'
          : isOpen
          ? 'w-64'
          : 'w-20'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-ink-border">
        <NavLink to="/" onClick={handleLinkClick} className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-ink-700 border border-brass-500/40 text-brass-400 flex items-center justify-center flex-shrink-0">
            <Layers className="w-5 h-5 text-brass-400" />
          </div>
          {(isOpen || isMobile) && (
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white leading-tight font-display">
                PayFlow
              </span>
              <span className="text-[11px] font-medium text-brass-400">
                Payment operations
              </span>
            </div>
          )}
        </NavLink>

        {!isMobile && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-ink-800 transition"
          >
            {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={handleLinkClick}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-ink-700/60 text-brass-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-ink-800/80'
                }`
              }
              title={!isOpen && !isMobile ? item.name : undefined}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-brass-500 rounded-r" />
                  )}
                  <Icon className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-105" />
                  {(isOpen || isMobile) && (
                    <span className="flex-1 truncate">{item.name}</span>
                  )}
                  {(isOpen || isMobile) && item.badge > 0 && (
                    <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-brass-500/20 text-brass-300">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer / Badge */}
      <div className="p-4 border-t border-ink-border">
        {(isOpen || isMobile) ? (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-ink-800 border border-ink-border text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-success flex-shrink-0" />
            <span className="truncate">Razorpay Test Mode Active</span>
          </div>
        ) : (
          <div className="flex justify-center" title="Razorpay Test Mode Active">
            <ShieldCheck className="w-5 h-5 text-success" />
          </div>
        )}
      </div>
    </aside>
  );
}
