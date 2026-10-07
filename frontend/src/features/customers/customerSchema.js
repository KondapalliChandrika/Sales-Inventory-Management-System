import { z } from 'zod';

import { isValidPhone, PHONE_ERROR } from '@/constants/validation';

const optional = (schema) => z.preprocess((v) => (typeof v === 'string' && v.trim() === '' ? null : v), schema.nullable());

export const customerSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(150),
  email: optional(z.string().trim().email('Enter a valid email')),
  phone: optional(z.string().trim().refine(isValidPhone, PHONE_ERROR)),
  address: optional(z.string().trim().max(500)),
  gstin: optional(
    z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[0-9]{2}[A-Z0-9]{13}$/, 'GSTIN must be 15 characters, e.g. 29ABCDE1234F1Z5'),
  ),
});
