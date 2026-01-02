/**
 * Persona Helper Utilities
 * Centralized functions for persona-related styling, mapping, and components
 * Eliminates duplication across Hero, Stats, Benefits, PersonaGateway, PersonaSwitcher, and Registration
 */

import type { PersonaType } from '@/lib/content/personas'

/**
 * Maps persona to text color classes
 * @example getPersonaColor('employee') // 'text-primary'
 */
export function getPersonaColor(persona: PersonaType | null): string {
  if (!persona) return 'text-primary'

  switch (persona) {
    case 'employee':
      return 'text-primary'
    case 'merchant':
      return 'text-orange-600'
    case 'company':
      return 'text-blue-600'
    default:
      return 'text-primary'
  }
}

/**
 * Maps persona to background color classes (light variant)
 * @example getPersonaBgColor('merchant') // 'bg-orange-100'
 */
export function getPersonaBgColor(persona: PersonaType | null): string {
  if (!persona) return 'bg-primary/10'

  switch (persona) {
    case 'employee':
      return 'bg-primary/10'
    case 'merchant':
      return 'bg-orange-100'
    case 'company':
      return 'bg-blue-100'
    default:
      return 'bg-primary/10'
  }
}

/**
 * Maps persona to background color classes (solid variant)
 * @example getPersonaBgColorSolid('company') // 'bg-blue-600'
 */
export function getPersonaBgColorSolid(persona: PersonaType | null): string {
  if (!persona) return 'bg-primary'

  switch (persona) {
    case 'employee':
      return 'bg-primary'
    case 'merchant':
      return 'bg-orange-600'
    case 'company':
      return 'bg-blue-600'
    default:
      return 'bg-primary'
  }
}

/**
 * Maps persona to gradient background classes
 * @example getPersonaBgGradient('employee') // 'bg-gradient-to-r from-primary/10 to-primary/5'
 */
export function getPersonaBgGradient(persona: PersonaType | null): string {
  if (!persona) return 'bg-gradient-to-r from-primary/10 to-primary/5'

  switch (persona) {
    case 'employee':
      return 'bg-gradient-to-r from-primary/10 to-primary/5'
    case 'merchant':
      return 'bg-gradient-to-r from-orange-50 to-amber-50'
    case 'company':
      return 'bg-gradient-to-r from-blue-50 to-indigo-50'
    default:
      return 'bg-gradient-to-r from-primary/10 to-primary/5'
  }
}

/**
 * Maps persona to border color classes
 * @example getPersonaBorderColor('merchant') // 'border-orange-200'
 */
export function getPersonaBorderColor(persona: PersonaType | null): string {
  if (!persona) return 'border-primary/20'

  switch (persona) {
    case 'employee':
      return 'border-primary/20'
    case 'merchant':
      return 'border-orange-200'
    case 'company':
      return 'border-blue-200'
    default:
      return 'border-primary/20'
  }
}

/**
 * Maps persona to hover border color classes
 * @example getPersonaHoverBorderColor('company') // 'hover:border-blue-200'
 */
export function getPersonaHoverBorderColor(persona: PersonaType | null): string {
  if (!persona) return 'hover:border-primary/20'

  switch (persona) {
    case 'employee':
      return 'hover:border-primary/20'
    case 'merchant':
      return 'hover:border-orange-200'
    case 'company':
      return 'hover:border-blue-200'
    default:
      return 'hover:border-primary/20'
  }
}

/**
 * Maps persona to hover background color classes (solid)
 * @example getPersonaHoverBgColor('employee') // 'hover:bg-primary'
 */
export function getPersonaHoverBgColor(persona: PersonaType | null): string {
  if (!persona) return 'hover:bg-primary'

  switch (persona) {
    case 'employee':
      return 'hover:bg-primary'
    case 'merchant':
      return 'hover:bg-orange-600'
    case 'company':
      return 'hover:bg-blue-600'
    default:
      return 'hover:bg-primary'
  }
}

/**
 * Maps persona to button background color classes
 * @example getPersonaButtonColor('merchant') // 'bg-orange-600 hover:bg-orange-700'
 */
export function getPersonaButtonColor(persona: PersonaType | null): string {
  if (!persona) return 'bg-primary hover:bg-primary-dark'

  switch (persona) {
    case 'employee':
      return 'bg-primary hover:bg-primary-dark'
    case 'merchant':
      return 'bg-orange-600 hover:bg-orange-700'
    case 'company':
      return 'bg-blue-600 hover:bg-blue-700'
    default:
      return 'bg-primary hover:bg-primary-dark'
  }
}

/**
 * Maps persona to button shadow color classes
 * @example getPersonaButtonShadow('company') // 'hover:shadow-blue-600/25'
 */
export function getPersonaButtonShadow(persona: PersonaType | null): string {
  if (!persona) return 'hover:shadow-primary/25'

  switch (persona) {
    case 'employee':
      return 'hover:shadow-primary/25'
    case 'merchant':
      return 'hover:shadow-orange-600/25'
    case 'company':
      return 'hover:shadow-blue-600/25'
    default:
      return 'hover:shadow-primary/25'
  }
}

/**
 * Maps persona to badge styling (combined background + text)
 * @example getPersonaBadgeStyles('merchant') // 'bg-orange-100 text-orange-700'
 */
export function getPersonaBadgeStyles(persona: PersonaType | null): string {
  if (!persona) return 'bg-primary/10 text-primary'

  switch (persona) {
    case 'employee':
      return 'bg-primary/10 text-primary'
    case 'merchant':
      return 'bg-orange-100 text-orange-700'
    case 'company':
      return 'bg-blue-100 text-blue-700'
    default:
      return 'bg-primary/10 text-primary'
  }
}

/**
 * Maps persona to heading color classes (for registration banner)
 * @example getPersonaHeadingColor('company') // 'text-blue-800'
 */
export function getPersonaHeadingColor(persona: PersonaType | null): string {
  if (!persona) return 'text-primary'

  switch (persona) {
    case 'employee':
      return 'text-primary'
    case 'merchant':
      return 'text-orange-800'
    case 'company':
      return 'text-blue-800'
    default:
      return 'text-primary'
  }
}

/**
 * Database role type matching Prisma schema
 */
export type DatabaseRole = 'EMPLOYEE' | 'MERCHANT' | 'COMPANY_ADMIN'

/**
 * Maps persona type to database role
 * @example personaToRole('merchant') // 'MERCHANT'
 */
export function personaToRole(persona: PersonaType): DatabaseRole {
  switch (persona) {
    case 'merchant':
      return 'MERCHANT'
    case 'company':
      return 'COMPANY_ADMIN'
    case 'employee':
    default:
      return 'EMPLOYEE'
  }
}

/**
 * Maps database role to persona type
 * @example roleToPersona('COMPANY_ADMIN') // 'company'
 */
export function roleToPersona(role: DatabaseRole): PersonaType {
  switch (role) {
    case 'MERCHANT':
      return 'merchant'
    case 'COMPANY_ADMIN':
      return 'company'
    case 'EMPLOYEE':
    default:
      return 'employee'
  }
}

/**
 * Gets combined classes for persona-aware icon backgrounds
 * @example getPersonaIconBgClasses('employee') // 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'
 */
export function getPersonaIconBgClasses(persona: PersonaType | null): string {
  if (!persona) return 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'

  switch (persona) {
    case 'employee':
      return 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'
    case 'merchant':
      return 'bg-orange-100 text-orange-600 group-hover:bg-orange-600 group-hover:text-white'
    case 'company':
      return 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
    default:
      return 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'
  }
}

/**
 * Gets the dot color for persona indicator (PersonaSwitcher)
 * @example getPersonaDotColor('merchant') // 'bg-orange-600'
 */
export function getPersonaDotColor(persona: PersonaType | null): string {
  if (!persona) return 'bg-primary'

  switch (persona) {
    case 'employee':
      return 'bg-primary'
    case 'merchant':
      return 'bg-orange-600'
    case 'company':
      return 'bg-blue-600'
    default:
      return 'bg-primary'
  }
}

/**
 * Generates full registration banner classes (gradient + border)
 * @example getRegistrationBannerClasses('company') // { container: '...', heading: '...' }
 */
export function getRegistrationBannerClasses(persona: PersonaType): {
  container: string
  heading: string
  icon: string
} {
  switch (persona) {
    case 'employee':
      return {
        container: 'bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20',
        heading: 'text-primary',
        icon: 'text-primary',
      }
    case 'merchant':
      return {
        container: 'bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200',
        heading: 'text-orange-800',
        icon: 'text-orange-600',
      }
    case 'company':
      return {
        container: 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200',
        heading: 'text-blue-800',
        icon: 'text-blue-600',
      }
    default:
      return {
        container: 'bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20',
        heading: 'text-primary',
        icon: 'text-primary',
      }
  }
}
