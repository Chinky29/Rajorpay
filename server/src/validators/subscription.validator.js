import { z } from 'zod';

export const createSubscriptionSchema = z.object({
  body: z.object({
    customerId: z.string({ required_error: 'Customer ID is required' }),
    productId: z.string().optional(),
    plan: z.enum(['Basic', 'Pro', 'Enterprise'], { required_error: 'Plan is required' }),
    amount: z.number({ required_error: 'Amount is required' }).min(0),
    currency: z.enum(['INR', 'USD', 'EUR', 'GBP']).optional().default('INR'),
    interval: z.enum(['monthly', 'yearly']).optional().default('monthly'),
  }),
});

export const updateSubscriptionSchema = z.object({
  body: z.object({
    plan: z.enum(['Basic', 'Pro', 'Enterprise']).optional(),
    amount: z.number().min(0).optional(),
    status: z.enum(['active', 'canceled', 'past_due', 'paused']).optional(),
    cancelAtPeriodEnd: z.boolean().optional(),
  }),
});
