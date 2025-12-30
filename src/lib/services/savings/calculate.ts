export interface SavingsParams {
  avgOrderValue: number      // From merchant business metrics
  discountPercentage: number // From Discount model
  employeeCount: number      // From Company stats
  estimatedMonthlyVisits?: number // Default: 2 visits per employee
}

export interface SavingsResult {
  monthlyTotal: number      // Total potential monthly savings for all employees
  perEmployee: number       // Savings per employee per month
  perVisit: number          // Savings per visit
  annualTotal: number       // Yearly potential savings
}

/**
 * Calculate potential employee savings based on merchant metrics and discount
 *
 * Formula: avgOrderValue × (discountPercentage / 100) × employeeCount × estimatedMonthlyVisits
 *
 * Example:
 * - Avg order: $15
 * - Discount: 10%
 * - Employees: 200
 * - Monthly visits: 2
 * Result: $15 × 0.10 × 200 × 2 = $600/month
 */
export function calculatePotentialSavings(params: SavingsParams): SavingsResult {
  const {
    avgOrderValue,
    discountPercentage,
    employeeCount,
    estimatedMonthlyVisits = 2
  } = params

  // Savings per visit = average order × discount percentage
  const perVisit = avgOrderValue * (discountPercentage / 100)

  // Savings per employee per month = per visit × monthly visits
  const perEmployee = perVisit * estimatedMonthlyVisits

  // Total monthly savings = per employee × employee count
  const monthlyTotal = perEmployee * employeeCount

  // Annual total
  const annualTotal = monthlyTotal * 12

  return {
    monthlyTotal: Math.round(monthlyTotal * 100) / 100,
    perEmployee: Math.round(perEmployee * 100) / 100,
    perVisit: Math.round(perVisit * 100) / 100,
    annualTotal: Math.round(annualTotal * 100) / 100,
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format currency with cents for smaller amounts
 */
export function formatCurrencyPrecise(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
