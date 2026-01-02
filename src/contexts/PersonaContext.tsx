'use client'

/**
 * PersonaContext - Client-side persona state management
 *
 * Manages user persona selection and persistence across the application.
 * Persona determines which marketing content, benefits, and features are shown to the user.
 *
 * Three persona types:
 * - 'employee': End users who save money at restaurants
 * - 'merchant': Restaurant owners who offer discounts
 * - 'company': HR/Benefits managers who provide perks to employees
 *
 * Persistence:
 * - Uses 'corbez_persona' cookie with 30-day expiry
 * - Cookie is functional (UX enhancement), no consent required
 * - Works across server and client components
 *
 * @example
 * ```tsx
 * // Wrap app with provider in layout.tsx
 * export default function RootLayout({ children }) {
 *   return (
 *     <PersonaProvider>
 *       {children}
 *     </PersonaProvider>
 *   )
 * }
 *
 * // Use in components
 * function MyComponent() {
 *   const { persona, setPersona, clearPersona } = usePersona()
 *
 *   return (
 *     <button onClick={() => setPersona('employee')}>
 *       I'm an employee
 *     </button>
 *   )
 * }
 * ```
 *
 * @module PersonaContext
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import Cookies from 'js-cookie'
import { trackPersonaChange } from '@/lib/analytics/persona-events'

/**
 * Valid persona types in the system
 * @typedef {'employee' | 'merchant' | 'company' | null} PersonaType
 */
type PersonaType = 'employee' | 'merchant' | 'company' | null

/**
 * Shape of the persona context value provided to consuming components
 * @interface PersonaContextValue
 */
interface PersonaContextValue {
  /** Current selected persona, or null if not yet selected */
  persona: PersonaType
  /** Set the persona and persist to cookie. Triggers analytics tracking. */
  setPersona: (persona: PersonaType) => void
  /** Clear persona selection and remove cookie */
  clearPersona: () => void
  /** Whether persona is being initialized from cookie (prevents flash of wrong content) */
  isLoading: boolean
}

const PersonaContext = createContext<PersonaContextValue | undefined>(undefined)

/** Cookie name for persona persistence */
const PERSONA_COOKIE_NAME = 'corbez_persona'
/** Cookie expiry in days (30 days) */
const PERSONA_COOKIE_EXPIRY = 30

/**
 * Props for PersonaProvider component
 * @interface PersonaProviderProps
 */
interface PersonaProviderProps {
  /** Child components that will have access to persona context */
  children: ReactNode
  /** Optional initial persona (used for SSR hydration) */
  initialPersona?: PersonaType
}

/**
 * PersonaProvider - Root provider for persona context
 *
 * Must wrap your application (typically in root layout).
 * Initializes persona from cookie on mount to ensure consistency across pages.
 *
 * @param props - Component props
 * @returns Provider component wrapping children
 *
 * @example
 * ```tsx
 * <PersonaProvider initialPersona="employee">
 *   <App />
 * </PersonaProvider>
 * ```
 */
export function PersonaProvider({ children, initialPersona = null }: PersonaProviderProps) {
  const [persona, setPersonaState] = useState<PersonaType>(initialPersona)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize persona from cookie on mount
  useEffect(() => {
    const savedPersona = Cookies.get(PERSONA_COOKIE_NAME) as PersonaType

    if (savedPersona && isValidPersona(savedPersona)) {
      setPersonaState(savedPersona)
    } else if (initialPersona) {
      setPersonaState(initialPersona)
    }

    setIsLoading(false)
  }, [initialPersona])

  /**
   * Set the current persona
   * - Updates state
   * - Persists to cookie (30-day expiry)
   * - Triggers analytics tracking if persona changed
   * - Removes cookie if persona is set to null
   *
   * @param newPersona - The persona to set, or null to clear
   */
  const setPersona = (newPersona: PersonaType) => {
    // Track persona change if it's different
    if (newPersona && newPersona !== persona) {
      trackPersonaChange(persona, newPersona)
    }

    setPersonaState(newPersona)

    if (newPersona) {
      Cookies.set(PERSONA_COOKIE_NAME, newPersona, {
        expires: PERSONA_COOKIE_EXPIRY,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })
    } else {
      Cookies.remove(PERSONA_COOKIE_NAME)
    }
  }

  /**
   * Clear the current persona selection
   * - Sets persona to null
   * - Removes the cookie
   * - Typically used when user wants to switch personas
   */
  const clearPersona = () => {
    setPersonaState(null)
    Cookies.remove(PERSONA_COOKIE_NAME)
  }

  return (
    <PersonaContext.Provider
      value={{
        persona,
        setPersona,
        clearPersona,
        isLoading,
      }}
    >
      {children}
    </PersonaContext.Provider>
  )
}

/**
 * usePersona - Hook to access persona context in components
 *
 * Provides access to current persona state and methods to update it.
 * Must be used within a PersonaProvider (will throw error if not).
 *
 * @throws {Error} If used outside PersonaProvider
 * @returns PersonaContextValue with persona state and methods
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { persona, setPersona, clearPersona, isLoading } = usePersona()
 *
 *   if (isLoading) return <div>Loading...</div>
 *
 *   return (
 *     <div>
 *       <p>Current persona: {persona || 'None'}</p>
 *       <button onClick={() => setPersona('employee')}>
 *         Select Employee
 *       </button>
 *       <button onClick={clearPersona}>
 *         Clear Selection
 *       </button>
 *     </div>
 *   )
 * }
 * ```
 */
export function usePersona() {
  const context = useContext(PersonaContext)

  if (context === undefined) {
    throw new Error('usePersona must be used within PersonaProvider')
  }

  return context
}

/**
 * Type guard to validate if a string is a valid persona type
 *
 * @param value - String to check
 * @returns True if value is 'employee', 'merchant', or 'company'
 *
 * @example
 * ```tsx
 * const userInput = 'employee'
 * if (isValidPersona(userInput)) {
 *   setPersona(userInput) // TypeScript knows it's valid
 * }
 * ```
 */
function isValidPersona(value: string): value is Exclude<PersonaType, null> {
  return ['employee', 'merchant', 'company'].includes(value)
}
