import mongoose from 'mongoose';
import { Transaction } from '../models/transaction.model.js';
import { Customer } from '../models/customer.model.js';
import { Subscription } from '../models/subscription.model.js';

export const getOverviewMetrics = async (userId, startDate, endDate) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const dateFilter = { user: userObjectId };
  if (startDate || endDate) {
    dateFilter.createdAt = {};
    if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
    if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
  }

  const [
    transactionAgg,
    customerCount,
    subscriptionAgg,
    recentTransactions,
  ] = await Promise.all([
    // Transaction aggregation by status
    Transaction.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]),

    // Total Customers
    Customer.countDocuments({ user: userObjectId }),

    // Active Subscriptions & MRR
    Subscription.aggregate([
      { $match: { user: userObjectId, status: 'active' } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          mrr: {
            $sum: {
              $cond: [
                { $eq: ['$interval', 'yearly'] },
                { $divide: ['$amount', 12] },
                '$amount',
              ],
            },
          },
        },
      },
    ]),

    // Recent 5 transactions
    Transaction.find({ user: userObjectId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('customer', 'name email')
      .populate('product', 'name price'),
  ]);

  let totalRevenue = 0;
  let successfulCount = 0;
  let failedCount = 0;
  let pendingCount = 0;
  let totalCount = 0;
  let failedAmount = 0;

  transactionAgg.forEach((group) => {
    totalCount += group.count;
    if (group._id === 'captured') {
      totalRevenue += group.totalAmount;
      successfulCount += group.count;
    } else if (group._id === 'failed') {
      failedCount += group.count;
      failedAmount += group.totalAmount;
    } else if (['created', 'authorized'].includes(group._id)) {
      pendingCount += group.count;
    }
  });

  const successRate = totalCount > 0 ? Number(((successfulCount / totalCount) * 100).toFixed(1)) : 100;
  const failureRate = totalCount > 0 ? Number(((failedCount / totalCount) * 100).toFixed(1)) : 0;
  const pendingRate = totalCount > 0 ? Number(((pendingCount / totalCount) * 100).toFixed(1)) : 0;
  const avgTransactionValue = successfulCount > 0 ? Math.round(totalRevenue / successfulCount) : 0;

  // PayFlow Payment Health Score (0 - 100)
  // Formula: Success Rate * 0.7 + (100 - Failure Rate) * 0.2 + (100 - Pending Rate) * 0.1
  let healthScore = 100;
  if (totalCount > 0) {
    healthScore = Math.round(
      successRate * 0.7 + (100 - failureRate) * 0.2 + (100 - pendingRate) * 0.1
    );
    healthScore = Math.max(0, Math.min(100, healthScore));
  }

  let healthStatus = 'Excellent';
  if (healthScore < 60) healthStatus = 'Critical';
  else if (healthScore < 80) healthStatus = 'Moderate';
  else if (healthScore < 90) healthStatus = 'Good';

  const activeSubscriptions = subscriptionAgg[0]?.count || 0;
  const mrr = Math.round(subscriptionAgg[0]?.mrr || 0);

  return {
    totalRevenue,
    failedAmount,
    totalTransactions: totalCount,
    successfulPayments: successfulCount,
    failedPayments: failedCount,
    pendingPayments: pendingCount,
    successRate,
    failureRate,
    pendingRate,
    avgTransactionValue,
    totalCustomers: customerCount,
    activeSubscriptions,
    mrr,
    paymentHealth: {
      score: healthScore,
      status: healthStatus,
      successRate,
      failureRate,
      pendingRate,
      disputeRate: 0.0,
    },
    recentTransactions,
  };
};

export const getRevenueTimeline = async (userId, days = 30) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const timeline = await Transaction.aggregate([
    {
      $match: {
        user: userObjectId,
        status: 'captured',
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        revenue: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return timeline.map((item) => ({
    date: item._id,
    revenue: item.revenue,
    orders: item.count,
  }));
};
