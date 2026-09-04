import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Product name is required' })
      .min(2, 'Product name must be at least 2 characters')
      .max(150, 'Product name must be under 150 characters'),
    description: z.string().max(1000).optional().default(''),
    sku: z.string().optional().default(''),
    price: z
      .number({ required_error: 'Product price is required' })
      .min(0, 'Price must be greater than or equal to 0'),
    currency: z.enum(['INR', 'USD', 'EUR', 'GBP']).optional().default('INR'),
    category: z.string().optional().default('General'),
    type: z.enum(['one_time', 'recurring']).optional().default('one_time'),
    status: z.enum(['active', 'inactive', 'archived']).optional().default('active'),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(150).optional(),
    description: z.string().max(1000).optional(),
    sku: z.string().optional(),
    price: z.number().min(0).optional(),
    currency: z.enum(['INR', 'USD', 'EUR', 'GBP']).optional(),
    category: z.string().optional(),
    type: z.enum(['one_time', 'recurring']).optional(),
    status: z.enum(['active', 'inactive', 'archived']).optional(),
  }),
});
