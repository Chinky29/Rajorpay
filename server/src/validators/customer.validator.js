import { z } from 'zod';

export const createCustomerSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Customer name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be under 100 characters'),
    email: z
      .string({ required_error: 'Customer email is required' })
      .email('Please enter a valid email address')
      .toLowerCase(),
    phone: z.string().optional().default(''),
    company: z.string().optional().default(''),
    address: z
      .object({
        line1: z.string().optional().default(''),
        line2: z.string().optional().default(''),
        city: z.string().optional().default(''),
        state: z.string().optional().default(''),
        postalCode: z.string().optional().default(''),
        country: z.string().optional().default('India'),
      })
      .optional(),
    notes: z.string().optional().default(''),
    status: z.enum(['active', 'inactive']).optional().default('active'),
  }),
});

export const updateCustomerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be under 100 characters')
      .optional(),
    email: z
      .string()
      .email('Please enter a valid email address')
      .toLowerCase()
      .optional(),
    phone: z.string().optional(),
    company: z.string().optional(),
    address: z
      .object({
        line1: z.string().optional(),
        line2: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        postalCode: z.string().optional(),
        country: z.string().optional(),
      })
      .optional(),
    notes: z.string().optional(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});
