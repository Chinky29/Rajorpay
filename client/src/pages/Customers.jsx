import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatDateShort } from '../utils/formatters';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  Building,
  Trash2,
  Edit2,
} from 'lucide-react';

export default function Customers() {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchCustomers = async (currentPage = 1, searchQuery = '') => {
    try {
      setLoading(true);
      const res = await api.get(
        `/api/customers?page=${currentPage}&limit=10&search=${encodeURIComponent(searchQuery)}`
      );
      setCustomers(res.data.data.customers || []);
      setPagination(res.data.data.pagination);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCustomers(page, search);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [page, search]);

  const handleOpenCreate = () => {
    setEditingCustomer(null);
    setFormData({ name: '', email: '', phone: '', company: '', notes: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (customer, e) => {
    e.stopPropagation();
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      company: customer.company || '',
      notes: customer.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await api.delete(`/api/customers/${id}`);
      success('Customer removed successfully');
      fetchCustomers(page, search);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete customer');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingCustomer) {
        await api.put(`/api/customers/${editingCustomer._id}`, formData);
        success('Customer updated successfully');
      } else {
        await api.post('/api/customers', formData);
        success('Customer created successfully');
      }
      setIsModalOpen(false);
      fetchCustomers(page, search);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save customer');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Customer',
      accessor: 'name',
      render: (c) => (
        <div>
          <div className="font-medium text-white">{c.name}</div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
            <Mail className="w-3 h-3 text-slate-500" />
            {c.email}
          </div>
        </div>
      ),
    },
    {
      header: 'Company / phone',
      accessor: 'company',
      render: (c) => (
        <div className="text-xs">
          <div className="text-slate-300 font-medium">{c.company || '—'}</div>
          {c.phone && (
            <div className="text-slate-400 flex items-center gap-1 mt-0.5">
              <Phone className="w-3 h-3 text-slate-500" />
              {c.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Orders',
      accessor: 'totalOrders',
      render: (c) => (
        <span className="tabular font-mono text-xs text-slate-300">
          {c.totalOrders || 0} orders
        </span>
      ),
    },
    {
      header: 'Total spent',
      accessor: 'totalSpent',
      render: (c) => (
        <span className="font-semibold text-white tabular">
          {formatCurrency(c.totalSpent)}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (c) => <Badge status={c.status} size="sm" />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (c) => (
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => handleOpenEdit(c, e)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-ink-700 transition"
            title="Edit customer"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => handleDelete(c._id, e)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-danger hover:bg-danger-soft transition"
            title="Delete customer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-display">Customer management</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Profiles, lifetime order metrics, and payment records
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brass-500 hover:bg-brass-400 text-ink-950 font-semibold text-sm active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add customer</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, phone, company..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-ink-border bg-ink-800 text-sm text-white placeholder-slate-500 focus:border-brass-500 focus:outline-none focus:ring-1 focus:ring-brass-500 transition"
          />
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={customers}
        loading={loading}
        pagination={pagination}
        onPageChange={(newPage) => setPage(newPage)}
        onRowClick={(c) => navigate(`/customers/${c._id}`)}
        emptyTitle="No customers registered"
        emptyDescription="Create your first customer profile or search using a different keyword."
      />

      {/* Add / Edit Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? 'Edit customer profile' : 'Add new customer'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Full name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. John Doe"
              className="w-full rounded-lg border border-ink-border bg-ink-800 px-3.5 py-2.5 text-sm text-white focus:border-brass-500 focus:outline-none focus:ring-1 focus:ring-brass-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Email address <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
              className="w-full rounded-lg border border-ink-border bg-ink-800 px-3.5 py-2.5 text-sm text-white focus:border-brass-500 focus:outline-none focus:ring-1 focus:ring-brass-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Phone number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full rounded-lg border border-ink-border bg-ink-800 px-3.5 py-2.5 text-sm text-white focus:border-brass-500 focus:outline-none focus:ring-1 focus:ring-brass-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Company / organization
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Acme Global Inc"
                className="w-full rounded-lg border border-ink-border bg-ink-800 px-3.5 py-2.5 text-sm text-white focus:border-brass-500 focus:outline-none focus:ring-1 focus:ring-brass-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Customer notes
            </label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add internal merchant notes or account tier details..."
              className="w-full rounded-lg border border-ink-border bg-ink-800 px-3.5 py-2.5 text-sm text-white focus:border-brass-500 focus:outline-none focus:ring-1 focus:ring-brass-500"
            />
          </div>

          <div className="pt-4 border-t border-ink-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-lg bg-brass-500 hover:bg-brass-400 text-ink-950 font-semibold text-sm transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingCustomer ? 'Update customer' : 'Create customer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
