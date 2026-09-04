import { Transaction } from '../models/transaction.model.js';
import { Customer } from '../models/customer.model.js';
import { Product } from '../models/product.model.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { config } from '../config/env.js';
import * as razorpayService from '../services/razorpay.service.js';
import { createNotification } from '../services/notification.service.js';

export const createOrder = asyncHandler(async (req, res) => {
  const { customerId, productId, amount, currency = 'INR', description } = req.body;

  // Verify customer belongs to merchant
  const customer = await Customer.findOne({ _id: customerId, user: req.user._id });
  if (!customer) {
    throw new ApiError(404, 'Customer not found in your account');
  }

  // If product specified, verify it
  let product = null;
  if (productId) {
    product = await Product.findOne({ _id: productId, user: req.user._id });
    if (!product) {
      throw new ApiError(404, 'Product not found in your account');
    }
  }

  // Convert amount to integer paise
  const amountInPaise = Math.round(Number(amount) * 100);
  const receipt = `rcpt_${Date.now().toString().slice(-8)}`;

  // Create Razorpay Order
  const rzpOrder = await razorpayService.createOrder({
    amountInPaise,
    currency,
    receipt,
    notes: {
      userId: req.user._id.toString(),
      customerId: customer._id.toString(),
      customerName: customer.name,
      customerEmail: customer.email,
    },
  });

  // Create local Transaction record
  const transaction = await Transaction.create({
    user: req.user._id,
    customer: customer._id,
    product: product ? product._id : undefined,
    amount: Number(amount),
    amountInPaise,
    currency,
    status: 'created',
    razorpayOrderId: rzpOrder.id,
    description: description || (product ? `Payment for ${product.name}` : `Invoice ${receipt}`),
  });

  return ApiResponse.created(
    res,
    {
      order: rzpOrder,
      transaction,
      keyId: config.razorpayKeyId,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
    },
    'Payment order created successfully'
  );
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    method = 'card',
  } = req.body;

  // Find transaction
  const transaction = await Transaction.findOne({
    razorpayOrderId: razorpay_order_id,
    user: req.user._id,
  });

  if (!transaction) {
    throw new ApiError(404, 'Transaction with this order ID was not found');
  }

  // Verify signature
  const isValid = razorpayService.verifyPaymentSignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  if (!isValid) {
    transaction.status = 'failed';
    transaction.failureReason = 'Signature verification failed';
    transaction.failureCode = 'BAD_SIGNATURE';
    await transaction.save();

    await createNotification({
      user: req.user._id,
      title: 'Payment Verification Failed',
      message: `Payment attempt of ₹${transaction.amount} failed signature verification.`,
      type: 'payment_failed',
      link: `/payments/${transaction._id}`,
    });

    throw new ApiError(400, 'Payment signature verification failed');
  }

  // Update transaction status
  transaction.status = 'captured';
  transaction.razorpayPaymentId = razorpay_payment_id;
  transaction.razorpaySignature = razorpay_signature;
  transaction.method = method;
  await transaction.save();

  // Update customer totals
  await Customer.findByIdAndUpdate(transaction.customer, {
    $inc: {
      totalSpent: transaction.amount,
      totalOrders: 1,
    },
  });

  // Create notification
  await createNotification({
    user: req.user._id,
    title: 'Payment Received',
    message: `Payment of ₹${transaction.amount} received successfully for Order ${transaction.razorpayOrderId}.`,
    type: 'payment_success',
    link: `/payments/${transaction._id}`,
  });

  return ApiResponse.success(res, { transaction }, 'Payment verified successfully');
});

export const getPayments = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  const { status, method, search, customerId } = req.query;

  const query = { user: req.user._id };

  if (status && ['created', 'authorized', 'captured', 'failed', 'refunded'].includes(status)) {
    query.status = status;
  }

  if (method && ['card', 'upi', 'netbanking', 'wallet', 'unknown'].includes(method)) {
    query.method = method;
  }

  if (customerId) {
    query.customer = customerId;
  }

  if (search && search.trim() !== '') {
    const s = search.trim();
    // Search on transaction IDs or customer name/email
    const matchingCustomers = await Customer.find({
      user: req.user._id,
      $or: [
        { name: new RegExp(s, 'i') },
        { email: new RegExp(s, 'i') },
      ],
    }).select('_id');

    const customerIds = matchingCustomers.map((c) => c._id);

    query.$or = [
      { razorpayOrderId: new RegExp(s, 'i') },
      { razorpayPaymentId: new RegExp(s, 'i') },
      { customer: { $in: customerIds } },
    ];
  }

  const [payments, totalItems] = await Promise.all([
    Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('customer', 'name email phone company')
      .populate('product', 'name price category'),
    Transaction.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return ApiResponse.success(
    res,
    {
      payments,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
    'Payments retrieved successfully'
  );
});

export const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await Transaction.findOne({
    _id: req.params.id,
    user: req.user._id,
  })
    .populate('customer', 'name email phone company address')
    .populate('product', 'name price category type');

  if (!payment) {
    throw new ApiError(404, 'Payment transaction not found');
  }

  return ApiResponse.success(res, { payment }, 'Payment retrieved successfully');
});

export const retryPayment = asyncHandler(async (req, res) => {
  const original = await Transaction.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).populate('customer');

  if (!original) {
    throw new ApiError(404, 'Original transaction not found');
  }

  // Create new order
  const amountInPaise = original.amountInPaise;
  const receipt = `retry_${Date.now().toString().slice(-8)}`;

  const rzpOrder = await razorpayService.createOrder({
    amountInPaise,
    currency: original.currency,
    receipt,
    notes: {
      retryFor: original._id.toString(),
      originalOrderId: original.razorpayOrderId,
    },
  });

  const retryTransaction = await Transaction.create({
    user: req.user._id,
    customer: original.customer._id,
    product: original.product,
    amount: original.amount,
    amountInPaise,
    currency: original.currency,
    status: 'created',
    razorpayOrderId: rzpOrder.id,
    description: `Retry for ${original.razorpayOrderId}`,
    retryCount: (original.retryCount || 0) + 1,
    parentTransactionId: original._id,
  });

  return ApiResponse.created(
    res,
    {
      order: rzpOrder,
      transaction: retryTransaction,
      keyId: config.razorpayKeyId,
      customer: {
        id: original.customer._id,
        name: original.customer.name,
        email: original.customer.email,
        phone: original.customer.phone,
      },
    },
    'Retry payment order created'
  );
});
