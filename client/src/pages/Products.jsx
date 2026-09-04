import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatDateShort } from '../utils/formatters';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Tag,
  Repeat,
  CheckCircle2,
} from 'lucide-react';

export default function Products() {
  const { success, error } = useToast();

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    price: '',
    currency: 'INR',
    category: 'General',
    type: 'one_time',
    status: 'active',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async (currentPage = 1, searchQuery = '', status = '') => {
    try {
      setLoading(true);
      let url = `/api/products?page=${currentPage}&limit=10&search=${encodeURIComponent(searchQuery)}`;
      if (status) url += `&status=${status}`;
      const res = await api.get(url);
      setProducts(res.data.data.products || []);
      setPagination(res.data.data.pagination);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(page, search, statusFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search, statusFilter]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      sku: '',
      price: '',
      currency: 'INR',
      category: 'Subscriptions',
      type: 'one_time',
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      sku: product.sku || '',
      price: product.price,
      currency: product.currency || 'INR',
      category: product.category || 'General',
      type: product.type || 'one_time',
      status: product.status || 'active',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/api/products/${id}`);
      success('Product removed successfully');
      fetchProducts(page, search, statusFilter);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = { ...formData, price: Number(formData.price) };
      if (editingProduct) {
        await api.put(`/api/products/${editingProduct._id}`, payload);
        success('Product updated successfully');
      } else {
        await api.post('/api/products', payload);
        success('Product added to catalog');
      }
      setIsModalOpen(false);
      fetchProducts(page, search, statusFilter);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Product / Plan',
      accessor: 'name',
      render: (p) => (
        <div>
          <div className="font-semibold text-white">{p.name}</div>
          <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">{p.description || 'No description'}</div>
        </div>
      ),
    },
    {
      header: 'SKU / Category',
      accessor: 'category',
      render: (p) => (
        <div className="text-xs">
          <div className="font-mono text-slate-300">{p.sku || '—'}</div>
          <div className="text-slate-500 mt-0.5">{p.category}</div>
        </div>
      ),
    },
    {
      header: 'Pricing',
      accessor: 'price',
      render: (p) => (
        <div>
          <span className="font-bold text-white font-mono text-sm">
            {formatCurrency(p.price, p.currency)}
          </span>
          <span className="text-[11px] text-slate-400 ml-1">
            {p.type === 'recurring' ? '/ month' : '(one-time)'}
          </span>
        </div>
      ),
    },
    {
      header: 'Type',
      accessor: 'type',
      render: (p) => (
        <span className="inline-flex items-center gap-1 text-xs text-slate-300">
          {p.type === 'recurring' ? <Repeat className="w-3.5 h-3.5 text-sky-400" /> : <Tag className="w-3.5 h-3.5 text-brand-400" />}
          <span className="capitalize">{p.type.replace('_', ' ')}</span>
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (p) => <Badge status={p.status} size="sm" />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (p) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleOpenEdit(p)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Edit Product"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(p._id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
            title="Delete Product"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Products & Plans</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage your service tiers, pricing catalog, and subscription definitions
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-600/25 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Product</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products by name, SKU, or category..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-800 bg-slate-900/60 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2 text-sm text-slate-300 focus:border-brand-500 focus:outline-none w-full sm:w-auto"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Products Table */}
      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => setPage(p)}
        emptyTitle="No products in catalog"
        emptyDescription="Add your first item or subscription plan to start creating checkout invoices."
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product Catalog Item' : 'Add New Product or Plan'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Product / Plan Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Pro Suite Tier"
              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Price (₹ INR) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="4999"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white font-mono focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Product SKU / Code
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                placeholder="SKU-PRO-01"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white font-mono focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Billing Model
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
              >
                <option value="one_time">One-time Charge</option>
                <option value="recurring">Recurring Subscription</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Subscriptions / Services"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Description
            </label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Features and entitlement details included with this product..."
              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-md shadow-brand-600/25 transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Add to Catalog'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
