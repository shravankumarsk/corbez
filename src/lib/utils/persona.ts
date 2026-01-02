/**
 * Server-side persona utilities
 * Handles reading persona from cookies on the server
 */

import { cookies } from 'next/headers'

export type PersonaType = 'employee' | 'merchant' | 'company' | null

const PERSONA_COOKIE_NAME = 'corbez_persona'
const PERSONA_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 // 30 days in seconds

/**
 * Get the current persona from server-side cookie
 * Used in Server Components and Server Actions
 */
export async function getServerPersona(): Promise<PersonaType> {
  const cookieStore = await cookies()
  const personaCookie = cookieStore.get(PERSONA_COOKIE_NAME)

  if (personaCookie?.value && isValidPersona(personaCookie.value)) {
    return personaCookie.value as PersonaType
  }

  return null
}

/**
 * Set persona cookie from server
 * Used in Server Actions
 */
export async function setServerPersona(persona: PersonaType): Promise<void> {
  const cookieStore = await cookies()

  if (persona) {
    cookieStore.set(PERSONA_COOKIE_NAME, persona, {
      maxAge: PERSONA_COOKIE_MAX_AGE,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
  }
}

/**
 * Clear persona cookie from server
 */
export async function clearServerPersona(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(PERSONA_COOKIE_NAME)
}

/**
 * Type guard to check if a string is a valid persona
 */
function isValidPersona(value: string): boolean {
  return ['employee', 'merchant', 'company'].includes(value)
}

/**
 * Get persona from URL parameter or cookie (with priority to URL)
 * Typical usage: registration page with ?type=merchant
 */
export async function getPersonaWithFallback(
  urlParam?: string | null
): Promise<PersonaType> {
  // Priority 1: URL parameter
  if (urlParam && isValidPersona(urlParam)) {
    return urlParam as PersonaType
  }

  // Priority 2: Cookie
  const cookiePersona = await getServerPersona()
  if (cookiePersona) {
    return cookiePersona
  }

  // Priority 3: Default to employee
  return 'employee'
}

/**
 * Map persona to role enum (for pre-selecting in registration)
 */
export function personaToRole(persona: PersonaType): string {
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
 * Map role enum to persona
 */
export function roleToPersona(role: string): PersonaType {
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

export { PERSONA_COOKIE_NAME, PERSONA_COOKIE_MAX_AGE }
