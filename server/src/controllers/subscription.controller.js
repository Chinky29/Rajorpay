import { Subscription } from '../models/subscription.model.js';
import { Customer } from '../models/customer.model.js';
import { Product } from '../models/product.model.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createNotification } from '../services/notification.service.js';

export const getSubscriptions = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  const { status, plan, interval } = req.query;

  const query = { user: req.user._id };

  if (status && ['active', 'canceled', 'past_due', 'paused'].includes(status)) {
    query.status = status;
  }

  if (plan && ['Basic', 'Pro', 'Enterprise'].includes(plan)) {
    query.plan = plan;
  }

  if (interval && ['monthly', 'yearly'].includes(interval)) {
    query.interval = interval;
  }

  const [subscriptions, totalItems] = await Promise.all([
    Subscription.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('customer', 'name email company')
      .populate('product', 'name price'),
    Subscription.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return ApiResponse.success(
    res,
    {
      subscriptions,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
    'Subscriptions retrieved successfully'
  );
});

export const getSubscriptionById = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findOne({
    _id: req.params.id,
    user: req.user._id,
  })
    .populate('customer', 'name email company phone address')
    .populate('product', 'name price');

  if (!subscription) {
    throw new ApiError(404, 'Subscription not found');
  }

  return ApiResponse.success(res, { subscription }, 'Subscription retrieved successfully');
});

export const createSubscription = asyncHandler(async (req, res) => {
  const { customerId, productId, plan, amount, currency = 'INR', interval = 'monthly' } = req.body;

  const customer = await Customer.findOne({ _id: customerId, user: req.user._id });
  if (!customer) {
    throw new ApiError(404, 'Customer not found in your account');
  }

  let product = null;
  if (productId) {
    product = await Product.findOne({ _id: productId, user: req.user._id });
  }

  const currentPeriodStart = new Date();
  const currentPeriodEnd = new Date();
  if (interval === 'yearly') {
    currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
  } else {
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
  }

  const subscription = await Subscription.create({
    user: req.user._id,
    customer: customer._id,
    product: product ? product._id : undefined,
    plan,
    amount,
    currency,
    interval,
    status: 'active',
    startDate: new Date(),
    currentPeriodStart,
    currentPeriodEnd,
  });

  await createNotification({
    user: req.user._id,
    title: 'New Subscription Created',
    message: `${customer.name} subscribed to the ${plan} Plan (₹${amount}/${interval}).`,
    type: 'subscription_created',
    link: `/subscriptions`,
  });

  return ApiResponse.created(res, { subscription }, 'Subscription created successfully');
});

export const updateSubscription = asyncHandler(async (req, res) => {
  const { plan, amount, status, cancelAtPeriodEnd } = req.body;

  const subscription = await Subscription.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!subscription) {
    throw new ApiError(404, 'Subscription not found');
  }

  if (plan !== undefined) subscription.plan = plan;
  if (amount !== undefined) subscription.amount = amount;
  if (status !== undefined) {
    subscription.status = status;
    if (status === 'canceled') subscription.canceledAt = new Date();
  }
  if (cancelAtPeriodEnd !== undefined) subscription.cancelAtPeriodEnd = cancelAtPeriodEnd;

  await subscription.save();

  return ApiResponse.success(res, { subscription }, 'Subscription updated successfully');
});

export const deleteSubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!subscription) {
    throw new ApiError(404, 'Subscription not found');
  }

  return ApiResponse.success(res, null, 'Subscription deleted successfully');
});
