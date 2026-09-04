import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    customerId: z.string({ required_error: 'Customer ID is required' }),
    productId: z.string().optional(),
    amount: z
      .number({ required_error: 'Amount is required' })
      .min(1, 'Amount must be greater than or equal to 1'),
    currency: z.enum(['INR', 'USD', 'EUR', 'GBP']).optional().default('INR'),
    description: z.string().optional().default(''),
  }),
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    razorpay_order_id: z.string({ required_error: 'Razorpay Order ID is required' }),
    razorpay_payment_id: z.string({ required_error: 'Razorpay Payment ID is required' }),
    razorpay_signature: z.string({ required_error: 'Razorpay Signature is required' }),
    transactionId: z.string().optional(),
    method: z.enum(['card', 'upi', 'netbanking', 'wallet', 'unknown']).optional().default('card'),
  }),
});
