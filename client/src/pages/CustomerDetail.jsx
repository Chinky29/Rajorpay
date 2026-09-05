import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import api from '../api/axios';
import Badge from '../components/Badge';
import CheckoutModal from '../components/CheckoutModal';
import { CardSkeleton, TableSkeleton } from '../components/Skeleton';
import { formatCurrency, formatDate, formatDateShort } from '../utils/formatters';
import { useToast } from '../context/ToastContext';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building,
  CreditCard,
  Repeat,
  Plus,
  MapPin,
} from 'lucide-react';

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { error } = useToast();

  const [customer, setCustomer] = useState(null);
  const [payments, setPayments] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      const [custRes, payRes, subRes] = await Promise.all([
        api.get(`/api/customers/${id}`),
        api.get(`/api/payments?customerId=${id}&limit=20`),
        api.get(`/api/subscriptions?customerId=${id}`),
      ]);
      setCustomer(custRes.data.data.customer);
      setPayments(payRes.data.data.payments || []);
      setSubscriptions(subRes.data.data.subscriptions || []);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to load customer profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <TableSkeleton rows={4} cols={4} />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>Customer not found</p>
        <button
          onClick={() => navigate('/customers')}
          className="mt-4 px-4 py-2 rounded-lg bg-brass-500 hover:bg-brass-400 text-ink-950 text-xs font-semibold"
        >
          Back to customers
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Breadcrumb & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/customers')}
            className="p-2 rounded-lg border border-ink-border bg-ink-800 hover:bg-ink-700 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight font-display">{customer.name}</h1>
              <Badge status={customer.status} size="sm" />
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {customer._id}</p>
          </div>
        </div>

        <button
          onClick={() => setIsCheckoutOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brass-500 hover:bg-brass-400 text-ink-950 font-semibold text-sm active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Charge customer</span>
        </button>
      </div>

      {/* Customer Info & Metrics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="rounded-xl border border-ink-border bg-ink-800 p-6 backdrop-blur-xl space-y-4">
          <h2 className="text-sm font-semibold text-white">Contact & company</h2>
          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2.5 text-slate-300">
              <Mail className="w-4 h-4 text-brass-400" />
              <span>{customer.email}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-300">
              <Phone className="w-4 h-4 text-success" />
              <span>{customer.phone || 'No phone recorded'}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-300">
              <Building className="w-4 h-4 text-info" />
              <span>{customer.company || 'Individual account'}</span>
            </div>
            {customer.address?.city && (
              <div className="flex items-center gap-2.5 text-slate-300">
                <MapPin className="w-4 h-4 text-warn" />
                <span>
                  {customer.address.city}, {customer.address.state} ({customer.address.country})
                </span>
              </div>
            )}
          </div>
          {customer.notes && (
            <div className="pt-3 border-t border-ink-border">
              <span className="text-[11px] font-medium text-slate-400 block mb-1">
                Merchant notes
              </span>
              <p className="text-xs text-slate-300 bg-ink-700 p-2.5 rounded-lg border border-ink-border">
                {customer.notes}
              </p>
            </div>
          )}
        </div>

        {/* Financial Metrics */}
        <div className="rounded-xl border border-ink-border bg-ink-800 p-6 backdrop-blur-xl space-y-4">
          <h2 className="text-sm font-semibold text-white">Lifetime financials</h2>
          <div className="space-y-3">
            <div>
              <span className="text-xs text-slate-400">Total settled volume</span>
              <div className="text-2xl font-display text-white tabular mt-0.5">
                {formatCurrency(customer.totalSpent)}
              </div>
            </div>
            <div className="pt-2 border-t border-ink-border flex justify-between">
              <span className="text-xs text-slate-400">Orders captured:</span>
              <span className="text-xs font-semibold text-white tabular">{customer.totalOrders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-400">Joined:</span>
              <span className="text-xs text-slate-300 font-mono">{formatDateShort(customer.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Active Subscriptions Card */}
        <div className="rounded-xl border border-ink-border bg-ink-800 p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Active subscriptions</h2>
            <Repeat className="w-4 h-4 text-brass-400" />
          </div>
          {subscriptions.length === 0 ? (
            <p className="text-xs text-slate-400 py-4">No active recurring subscriptions.</p>
          ) : (
            <div className="space-y-2">
              {subscriptions.map((sub) => (
                <div key={sub._id} className="p-3 rounded-lg bg-ink-700 border border-ink-border text-xs flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">{sub.plan} Plan</div>
                    <div className="text-slate-400 tabular mt-0.5">
                      {formatCurrency(sub.amount)} / {sub.interval}
                    </div>
                  </div>
                  <Badge status={sub.status} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payments History Ledger */}
      <div className="rounded-xl border border-ink-border bg-ink-800 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-ink-border flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-brass-400" />
            Transaction history
          </h3>
          <span className="text-xs text-slate-400 font-mono">{payments.length} records</span>
        </div>

        {payments.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No transactions found for this customer.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-ink-900 border-b border-ink-border text-xs font-medium text-slate-400">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Payment ID</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-border">
                {payments.map((p) => (
                  <tr
                    key={p._id}
                    onClick={() => navigate(`/payments/${p._id}`)}
                    className="hover:bg-ink-700/50 cursor-pointer transition"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-white">{p.razorpayOrderId}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{p.razorpayPaymentId || '—'}</td>
                    <td className="px-6 py-4 font-semibold text-white tabular">{formatCurrency(p.amount, p.currency)}</td>
                    <td className="px-6 py-4 text-xs capitalize text-slate-300">{p.method}</td>
                    <td className="px-6 py-4"><Badge status={p.status} size="sm" /></td>
                    <td className="px-6 py-4 text-xs text-slate-400">{formatDate(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={() => fetchCustomerDetails()}
        initialCustomerId={customer._id}
      />
    </div>
  );
}
