import { WebhookEvent } from '../models/webhookEvent.model.js';
import { Transaction } from '../models/transaction.model.js';
import { Customer } from '../models/customer.model.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as razorpayService from '../services/razorpay.service.js';
import { createNotification } from '../services/notification.service.js';

export const handleRazorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));

  // 1. Verify Webhook Signature
  const isValid = razorpayService.verifyWebhookSignature(rawBody, signature);
  if (!isValid) {
    console.warn('[Webhook] Invalid signature received');
    throw new ApiError(400, 'Invalid webhook signature');
  }

  const { event, payload, id: eventId } = req.body;
  const webhookId = eventId || `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

  // 2. Atomic Idempotency Check & Event Creation
  let webhookRecord;
  try {
    webhookRecord = await WebhookEvent.create({
      eventId: webhookId,
      event: event || 'unknown',
      payload: req.body,
      status: 'received',
    });
  } catch (err) {
    // Handle MongoDB duplicate key error (concurrent or duplicate webhook delivery)
    if (err.code === 11000 || (err.name === 'MongoServerError' && err.code === 11000)) {
      return ApiResponse.success(res, { processed: true }, 'Event already processed (idempotent)');
    }
    throw err;
  }

  try {
    const paymentEntity = payload?.payment?.entity;
    const orderEntity = payload?.order?.entity;
    const orderId = paymentEntity?.order_id || orderEntity?.id;

    if (orderId) {
      const transaction = await Transaction.findOne({ razorpayOrderId: orderId });

      if (transaction) {
        if (event === 'payment.captured' || event === 'order.paid') {
          transaction.status = 'captured';
          if (paymentEntity?.id) transaction.razorpayPaymentId = paymentEntity.id;
          if (paymentEntity?.method) transaction.method = paymentEntity.method;
          if (paymentEntity?.fee) transaction.fee = paymentEntity.fee / 100;
          if (paymentEntity?.tax) transaction.tax = paymentEntity.tax / 100;
          await transaction.save();

          await Customer.findByIdAndUpdate(transaction.customer, {
            $inc: { totalSpent: transaction.amount, totalOrders: 1 },
          });

          await createNotification({
            user: transaction.user,
            title: 'Webhook: Payment Captured',
            message: `Order ${orderId} was captured via Razorpay webhook.`,
            type: 'payment_success',
            link: `/payments/${transaction._id}`,
          });
        } else if (event === 'payment.failed') {
          transaction.status = 'failed';
          transaction.failureReason = paymentEntity?.error_description || 'Payment failed';
          transaction.failureCode = paymentEntity?.error_code || 'PAYMENT_FAILED';
          await transaction.save();

          await createNotification({
            user: transaction.user,
            title: 'Webhook: Payment Failed',
            message: `Order ${orderId} failed: ${transaction.failureReason}`,
            type: 'payment_failed',
            link: `/payments/${transaction._id}`,
          });
        } else if (event === 'payment.authorized') {
          transaction.status = 'authorized';
          if (paymentEntity?.id) transaction.razorpayPaymentId = paymentEntity.id;
          await transaction.save();
        }
      }
    }

    webhookRecord.status = 'processed';
    webhookRecord.processedAt = new Date();
    await webhookRecord.save();

    return ApiResponse.success(res, { status: 'processed', eventId: webhookId }, 'Webhook processed successfully');
  } catch (err) {
    webhookRecord.status = 'failed';
    webhookRecord.error = err.message;
    await webhookRecord.save();
    throw err;
  }
});
