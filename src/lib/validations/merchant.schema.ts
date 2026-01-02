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

// Step 4: Security & Compliance Terms
export const securityTermsSchema = z.object({
  securityTermsAccepted: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the security terms to complete onboarding' }),
  }),
  securityTermsVersion: z.string().min(1, 'Terms version is required'),
})

// Complete onboarding schema (legacy - without security terms)
export const onboardingCompleteSchema = basicInfoSchema
  .merge(locationSchema)
  .merge(businessMetricsSchema)

// Complete onboarding schema with security terms (NEW - required for onboarding completion)
export const onboardingCompleteWithTermsSchema = basicInfoSchema
  .merge(locationSchema)
  .merge(businessMetricsSchema)
  .merge(securityTermsSchema)

// Partial update schema for saving step progress
export const onboardingStepSchema = z.object({
  step: z.enum(['1', '2', '3', '4']),
  data: z.union([basicInfoSchema, locationSchema, businessMetricsSchema, securityTermsSchema]),
})

export type BasicInfoInput = z.infer<typeof basicInfoSchema>
export type LocationInput = z.infer<typeof locationSchema>
export type BusinessMetricsInput = z.infer<typeof businessMetricsSchema>
export type SecurityTermsInput = z.infer<typeof securityTermsSchema>
export type OnboardingCompleteInput = z.infer<typeof onboardingCompleteSchema>
export type OnboardingCompleteWithTermsInput = z.infer<typeof onboardingCompleteWithTermsSchema>
