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
  Calendar,
  DollarSign,
  MapPin,
  ExternalLink,
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
          className="mt-4 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold"
        >
          Back to Customers
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
            className="p-2 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">{customer.name}</h1>
              <Badge status={customer.status} size="sm" />
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {customer._id}</p>
          </div>
        </div>

        <button
          onClick={() => setIsCheckoutOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-600/25 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Charge Customer</span>
        </button>
      </div>

      {/* Customer Info & Metrics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-xl space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Contact & Company</h2>
          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2.5 text-slate-300">
              <Mail className="w-4 h-4 text-brand-400" />
              <span>{customer.email}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-300">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>{customer.phone || 'No phone recorded'}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-300">
              <Building className="w-4 h-4 text-sky-400" />
              <span>{customer.company || 'Individual account'}</span>
            </div>
            {customer.address?.city && (
              <div className="flex items-center gap-2.5 text-slate-300">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>
                  {customer.address.city}, {customer.address.state} ({customer.address.country})
                </span>
              </div>
            )}
          </div>
          {customer.notes && (
            <div className="pt-3 border-t border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Merchant Notes
              </span>
              <p className="text-xs text-slate-300 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
                {customer.notes}
              </p>
            </div>
          )}
        </div>

        {/* Financial Metrics */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-xl space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Lifetime Financials</h2>
          <div className="space-y-3">
            <div>
              <span className="text-xs text-slate-400">Total Settled Volume</span>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-0.5">
                {formatCurrency(customer.totalSpent)}
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between">
              <span className="text-xs text-slate-400">Orders Captured:</span>
              <span className="text-xs font-bold text-white">{customer.totalOrders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-400">Joined:</span>
              <span className="text-xs text-slate-300 font-mono">{formatDateShort(customer.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Active Subscriptions Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Active Subscriptions</h2>
            <Repeat className="w-4 h-4 text-brand-400" />
          </div>
          {subscriptions.length === 0 ? (
            <p className="text-xs text-slate-400 py-4">No active recurring subscriptions.</p>
          ) : (
            <div className="space-y-2">
              {subscriptions.map((sub) => (
                <div key={sub._id} className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">{sub.plan} Plan</div>
                    <div className="text-slate-400 font-mono mt-0.5">
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
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-brand-400" />
            Transaction History
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
              <thead className="bg-slate-900/80 border-b border-slate-800 text-xs uppercase font-semibold text-slate-400">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Payment ID</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {payments.map((p) => (
                  <tr
                    key={p._id}
                    onClick={() => navigate(`/payments/${p._id}`)}
                    className="hover:bg-slate-800/30 cursor-pointer transition"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-white">{p.razorpayOrderId}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{p.razorpayPaymentId || '—'}</td>
                    <td className="px-6 py-4 font-bold text-white font-mono">{formatCurrency(p.amount, p.currency)}</td>
                    <td className="px-6 py-4 text-xs uppercase text-slate-300">{p.method}</td>
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
