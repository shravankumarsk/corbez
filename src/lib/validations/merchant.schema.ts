import { z } from 'zod'

// Step 1: Basic Business Info
export const basicInfoSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  description: z.string().max(500, 'Description must be under 500 characters').optional(),
  categories: z.array(z.string()).min(1, 'Select at least one category'),
})

// Step 2: Location Info
export const locationSchema = z.object({
  address: z.string().min(5, 'Please enter a valid address'),
  city: z.string().min(2, 'Please enter a city'),
  state: z.string().min(2, 'Please enter a state'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code'),
  phone: z.string().optional(),
})

// Step 3: Business Metrics
export const businessMetricsSchema = z.object({
  avgOrderValue: z.number().min(1, 'Average order value must be at least $1').max(500, 'Please enter a realistic value'),
  priceTier: z.enum(['$', '$$', '$$$', '$$$$']),
  seatingCapacity: z.enum(['SMALL', 'MEDIUM', 'LARGE']),
  seatingCapacityNumeric: z.number().optional(),
  peakHours: z.array(z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'LATE_NIGHT'])).min(1, 'Select at least one peak hour'),
  cateringAvailable: z.boolean(),
  offersDelivery: z.boolean(),
})

// Complete onboarding schema
export const onboardingCompleteSchema = basicInfoSchema
  .merge(locationSchema)
  .merge(businessMetricsSchema)

// Partial update schema for saving step progress
export const onboardingStepSchema = z.object({
  step: z.enum(['1', '2', '3']),
  data: z.union([basicInfoSchema, locationSchema, businessMetricsSchema]),
})

export type BasicInfoInput = z.infer<typeof basicInfoSchema>
export type LocationInput = z.infer<typeof locationSchema>
export type BusinessMetricsInput = z.infer<typeof businessMetricsSchema>
export type OnboardingCompleteInput = z.infer<typeof onboardingCompleteSchema>
