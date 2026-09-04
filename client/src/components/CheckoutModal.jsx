import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

export default function CheckoutModal({ isOpen, onClose, onSuccess, initialCustomerId, initialProductId, initialAmount }) {
  const { user } = useAuth();
  const { success, error, info } = useToast();

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialCustomerId || '');
  const [selectedProductId, setSelectedProductId] = useState(initialProductId || '');
  const [amount, setAmount] = useState(initialAmount || '');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (initialCustomerId) setSelectedCustomerId(initialCustomerId);
    if (initialProductId) setSelectedProductId(initialProductId);
    if (initialAmount) setAmount(initialAmount);
  }, [initialCustomerId, initialProductId, initialAmount, isOpen]);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          setFetching(true);
          const [cRes, pRes] = await Promise.all([
            api.get('/api/customers?limit=50'),
            api.get('/api/products?limit=50&status=active'),
          ]);
          setCustomers(cRes.data.data.customers || []);
          setProducts(pRes.data.data.products || []);

          if (!initialCustomerId && !selectedCustomerId && cRes.data.data.customers?.length > 0) {
            setSelectedCustomerId(cRes.data.data.customers[0]._id);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setFetching(false);
        }
      };
      fetchData();
    }
  }, [isOpen, initialCustomerId]);

  useEffect(() => {
    if (selectedProductId) {
      const prod = products.find((p) => p._id === selectedProductId);
      if (prod) {
        setAmount(prod.price);
        setDescription(`Payment for ${prod.name}`);
      }
    }
  }, [selectedProductId, products]);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId || !amount || Number(amount) <= 0) {
      error('Please select a customer and enter a valid payment amount.');
      return;
    }

    try {
      setLoading(true);

      // 1. Create order on backend
      const res = await api.post('/api/payments/create-order', {
        customerId: selectedCustomerId,
        productId: selectedProductId || undefined,
        amount: Number(amount),
        currency: 'INR',
        description,
      });

      const { order, transaction, keyId, customer } = res.data.data;

      // 2. Open Razorpay Checkout modal
      if (window.Razorpay && keyId && !keyId.includes('placeholder')) {
        const options = {
          key: keyId,
          amount: order.amount,
          currency: order.currency,
          name: user?.businessName || 'PayFlow Fintech',
          description: description || 'Payment Checkout',
          order_id: order.id,
          prefill: {
            name: customer.name,
            email: customer.email,
            contact: customer.phone,
          },
          theme: {
            color: '#6366F1',
          },
          handler: async function (response) {
            try {
              info('Verifying payment signature with server...');
              const verifyRes = await api.post('/api/payments/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                method: 'card',
              });
              success(`Payment of ₹${amount} received and verified successfully!`);
              onClose();
              if (onSuccess) onSuccess(verifyRes.data.data.transaction);
            } catch (vErr) {
              error(vErr.response?.data?.message || 'Payment verification failed');
            }
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          error(`Payment failed: ${response.error.description}`);
          setLoading(false);
        });
        rzp.open();
      } else {
        // Test Mode Simulation for Mock environment
        info('Testing in sandbox mode: simulating payment verification...');
        const mockPaymentId = `pay_${Math.random().toString(36).substr(2, 12)}`;
        const mockSignature = `sig_${Math.random().toString(36).substr(2, 16)}`;

        const verifyRes = await api.post('/api/payments/verify', {
          razorpay_order_id: order.id,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: mockSignature,
          method: 'card',
        });

        success(`Test Payment of ₹${amount} completed and verified!`);
        setLoading(false);
        onClose();
        if (onSuccess) onSuccess(verifyRes.data.data.transaction);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to initiate checkout order');
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Initiate Razorpay Checkout" maxWidth="max-w-lg">
      {fetching ? (
        <div className="py-8 text-center text-slate-400 font-mono text-sm">Loading catalog & customer data...</div>
      ) : (
        <form onSubmit={handleCheckout} className="space-y-4">
          <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-400 flex-shrink-0" />
            <span>Razorpay Test Mode is active. No real funds will be charged.</span>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Customer <span className="text-rose-400">*</span>
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">Select a customer...</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Select Product (Optional)
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">Custom Amount / One-off Invoice</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} — ₹{p.price} ({p.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Amount (₹ INR) <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              placeholder="e.g. 2999"
              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Description / Memo
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Monthly SaaS Subscription Invoice"
              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || customers.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-brand-600/30 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing Order...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
