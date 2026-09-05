import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Plus,
  LogOut,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import CheckoutModal from './CheckoutModal';
import { formatDateShort } from '../utils/formatters';

export default function Header({ openMobile, onCheckoutSuccess }) {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const navigate = useNavigate();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 border-b border-ink-border bg-ink-950/85 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            onClick={openMobile}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-ink-800 md:hidden transition"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-ink-800/80 px-3 py-1.5 rounded-lg border border-ink-border shadow-sm">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
            <span>Business:</span>
            <span className="font-semibold text-white truncate max-w-[160px] font-display">
              {user?.businessName || 'My Business'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Create Payment Quick Button */}
          <button
            onClick={() => setIsCheckoutOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brass-500 hover:bg-brass-400 active:scale-95 text-ink-950 font-semibold text-xs transition duration-150 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New checkout</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                setIsUserMenuOpen(false);
              }}
              className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-ink-800 transition"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-brass-500 ring-2 ring-ink-950 animate-pulse" />
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-ink-border bg-ink-900/98 backdrop-blur-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-ink-border pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-brass-500/20 text-brass-300 border border-brass-500/30">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <NavLink
                    to="/notifications"
                    onClick={() => setIsNotifOpen(false)}
                    className="text-xs text-brass-400 hover:text-brass-300 transition font-medium"
                  >
                    View all
                  </NavLink>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((n) => (
                      <div
                        key={n._id}
                        onClick={() => {
                          markAsRead(n._id);
                          if (n.link) {
                            navigate(n.link);
                            setIsNotifOpen(false);
                          }
                        }}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                          n.isRead
                            ? 'bg-ink-800/60 border-ink-border text-slate-400 hover:bg-ink-700/60'
                            : 'bg-brass-500/10 border-brass-500/20 text-slate-200 hover:bg-brass-500/15'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold text-white mb-0.5">
                          <span className="truncate">{n.title}</span>
                          <span className="text-[10px] text-slate-500 font-normal">
                            {formatDateShort(n.createdAt)}
                          </span>
                        </div>
                        <p className="line-clamp-2 text-slate-400">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => {
                setIsUserMenuOpen(!isUserMenuOpen);
                setIsNotifOpen(false);
              }}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-ink-800 transition"
            >
              <div className="w-8 h-8 rounded-lg bg-ink-700 border border-brass-500/40 text-brass-400 flex items-center justify-center font-bold text-xs shadow-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-white truncate max-w-[100px]">
                  {user?.name}
                </span>
                <span className="text-[10px] text-slate-400 capitalize">
                  {user?.role || 'Merchant'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-ink-border bg-ink-900/98 backdrop-blur-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-3 border-b border-ink-border mb-1">
                  <p className="text-xs font-bold text-white font-display">{user?.name}</p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email}</p>
                </div>
                <NavLink
                  to="/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-ink-800 rounded-lg transition"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  <span>API keys & webhooks</span>
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-danger hover:bg-danger-soft rounded-lg transition text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Quick Payment Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={onCheckoutSuccess}
      />
    </>
  );
}
