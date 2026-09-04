export const formatCurrency = (amount, currency = 'INR') => {
  if (amount === undefined || amount === null) return '₹0';
  const num = Number(amount);
  
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 2,
  }).format(num);
};

export const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatDateShort = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const getStatusBadgeVariant = (status) => {
  switch (status?.toLowerCase()) {
    case 'captured':
    case 'active':
    case 'success':
      return 'success';
    case 'failed':
    case 'past_due':
    case 'critical':
      return 'danger';
    case 'created':
    case 'authorized':
    case 'pending':
    case 'paused':
    case 'moderate':
      return 'warning';
    case 'canceled':
    case 'archived':
    case 'inactive':
    default:
      return 'neutral';
  }
};
