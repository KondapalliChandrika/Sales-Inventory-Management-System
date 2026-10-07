import { z } from 'zod';

const optionalId = z.preprocess((v) => (v === '' || v === null ? null : Number(v)), z.number().int().positive().nullable());

export const productSchema = z.object({
  sku: z
    .string()
    .trim()
    .min(2, 'SKU must be at least 2 characters')
    .max(50)
    .regex(/^[A-Za-z0-9\-_]+$/, 'Only letters, numbers, - and _'),
  name: z.string().trim().min(2, 'Name is required').max(150),
  category_id: optionalId,
  description: z.string().trim().max(1000).optional(),
  unit_price: z.coerce.number({ invalid_type_error: 'Enter a price' }).positive('Price must be greater than 0'),
  reorder_level: z.coerce.number().int('Whole number').min(0, 'Cannot be negative'),
  opening_stock: z.coerce.number().int('Whole number').min(0, 'Cannot be negative'),
  is_active: z.boolean().optional(),
});
