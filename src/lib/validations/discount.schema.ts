import { z } from 'zod'
import { DiscountType } from '@/lib/db/models/discount.model'

/**
 * Discount Validation Schemas
 *
 * SECURITY: Prevents NoSQL injection by validating all input types
 * before using them in database queries
 */

// Base discount schema with common fields
const baseDiscountSchema = z.object({
  type: z.nativeEnum(DiscountType, {
    errorMap: () => ({ message: 'Invalid discount type' }),
  }),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be under 100 characters')
    .trim(),
  percentage: z
    .number()
    .min(0, 'Percentage cannot be negative')
    .max(100, 'Percentage cannot exceed 100')
    .optional(),
  monthlyUsageLimit: z
    .number()
    .int('Usage limit must be a whole number')
    .min(1, 'Usage limit must be at least 1')
    .max(100, 'Usage limit cannot exceed 100')
    .nullable()
    .optional(),
  isActive: z.boolean().optional(),
})

// Company discount schema
const companyDiscountSchema = baseDiscountSchema.extend({
  type: z.literal(DiscountType.COMPANY),
  percentage: z.number().min(0).max(100),
  companyName: z
    .string()
    .min(1, 'Company name is required')
    .max(200, 'Company name too long')
    .trim(),
})

// Spend threshold discount schema
const spendThresholdDiscountSchema = baseDiscountSchema.extend({
  type: z.literal(DiscountType.SPEND_THRESHOLD),
  percentage: z.number().min(0).max(100),
  minSpend: z
    .number()
    .positive('Minimum spend must be greater than 0')
    .max(10000, 'Please enter a realistic minimum spend'),
})

// Company perk schema
const companyPerkSchema = baseDiscountSchema.extend({
  type: z.literal(DiscountType.COMPANY_PERK),
  percentage: z.number().optional(), // Perks don't require percentage
  companyName: z
    .string()
    .min(1, 'Company name is required')
    .max(200, 'Company name too long')
    .trim(),
  perkItem: z
    .string()
    .min(1, 'Perk item is required')
    .max(200, 'Perk item description too long')
    .trim(),
  perkValue: z
    .number()
    .nonnegative('Perk value cannot be negative')
    .max(1000, 'Perk value too high')
    .optional(),
  perkDescription: z
    .string()
    .max(500, 'Description too long')
    .optional(),
  perkRestrictions: z
    .string()
    .max(500, 'Restrictions too long')
    .optional(),
})

// Base discount schema (no specific requirements)
const baseTypeDiscountSchema = baseDiscountSchema.extend({
  type: z.literal(DiscountType.BASE),
  percentage: z.number().min(0).max(100),
})

// Union of all discount types for creation
export const createDiscountSchema = z.discriminatedUnion('type', [
  baseTypeDiscountSchema,
  companyDiscountSchema,
  spendThresholdDiscountSchema,
  companyPerkSchema,
])

// Update discount schema - all fields optional except type-specific requirements
export const updateDiscountSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  percentage: z.number().min(0).max(100).optional(),
  companyName: z.string().min(1).max(200).trim().optional(),
  minSpend: z.number().positive().max(10000).optional(),
  perkItem: z.string().min(1).max(200).trim().optional(),
  perkValue: z.number().nonnegative().max(1000).optional(),
  perkDescription: z.string().max(500).optional(),
  perkRestrictions: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
  monthlyUsageLimit: z
    .union([
      z.number().int().min(1).max(100),
      z.null(),
      z.literal(''), // Allow empty string which will be converted to null
    ])
    .optional(),
})

// ID parameter validation
export const discountIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid discount ID'),
})

// Type exports
export type CreateDiscountInput = z.infer<typeof createDiscountSchema>
export type UpdateDiscountInput = z.infer<typeof updateDiscountSchema>
export type DiscountIdInput = z.infer<typeof discountIdSchema>
