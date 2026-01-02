'use client'

/**
 * PersonaSwitcher Component
 * Floating button that allows users to change their selected persona
 * Only shows when a persona has been selected
 */

import { usePersona } from '@/contexts/PersonaContext'
import { getPersonaDisplayName } from '@/lib/content/personas'
import { getPersonaDotColor } from '@/lib/utils/persona-helpers'

export default function PersonaSwitcher() {
  const { persona, clearPersona } = usePersona()

  // Don't show if no persona is selected
  if (!persona) {
    return null
  }

  const handleClearPersona = () => {
    clearPersona()
    // Scroll to persona gateway section
    const gateway = document.getElementById('persona-gateway')
    if (gateway) {
      gateway.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={handleClearPersona}
        className="group flex items-center gap-3 bg-white hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-full shadow-lg hover:shadow-xl border border-gray-200 transition-all duration-300 hover:scale-105"
        aria-label="Change audience selection"
      >
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getPersonaDotColor(persona)}`} />
          <span className="text-sm font-medium hidden sm:inline">
            {getPersonaDisplayName(persona)}
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-500 group-hover:text-primary transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="hidden sm:inline">Change</span>
        </div>
      </button>

      {/* Tooltip for mobile */}
      <div className="sm:hidden absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap">
          Change audience
        </div>
      </div>
    </div>
  )
}
