import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Transaction must be associated with a user/merchant'],
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Transaction must have an associated customer'],
      index: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: false,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Amount must be at least 1'],
    },
    amountInPaise: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
    },
    status: {
      type: String,
      enum: ['created', 'authorized', 'captured', 'failed', 'refunded'],
      default: 'created',
      index: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
      index: true,
    },
    razorpaySignature: {
      type: String,
      default: null,
    },
    method: {
      type: String,
      enum: ['card', 'upi', 'netbanking', 'wallet', 'unknown'],
      default: 'unknown',
    },
    bank: {
      type: String,
      default: null,
    },
    wallet: {
      type: String,
      default: null,
    },
    vpa: {
      type: String,
      default: null,
    },
    fee: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    failureReason: {
      type: String,
      default: null,
    },
    failureCode: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: '',
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    parentTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      default: null,
    },
    metadata: {
      type: Map,
      of: String,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ user: 1, status: 1 });
transactionSchema.index({ user: 1, customer: 1 });

export const Transaction = mongoose.model('Transaction', transactionSchema);
