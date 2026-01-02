/**
 * Analytics tracking for persona-related events
 * Tracks persona selection, changes, and conversion funnel
 */

type PersonaType = 'employee' | 'merchant' | 'company'

interface PersonaEvent {
  persona: PersonaType
  source: 'gateway' | 'url_param' | 'cookie' | 'manual'
  timestamp: Date
  previousPersona?: PersonaType | null
}

/**
 * Track persona selection
 * Called when user selects a persona via PersonaGateway or URL parameter
 */
export function trackPersonaSelection(event: PersonaEvent): void {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] Persona Selected:', event)
  }

  // Send to analytics platform (Google Analytics, Mixpanel, etc.)
  if (typeof window !== 'undefined') {
    // Google Analytics 4 (gtag)
    if (window.gtag) {
      window.gtag('event', 'persona_selected', {
        persona_type: event.persona,
        selection_source: event.source,
        previous_persona: event.previousPersona || 'none',
      })
    }

    // Mixpanel
    if (window.mixpanel) {
      window.mixpanel.track('Persona Selected', {
        persona: event.persona,
        source: event.source,
        previousPersona: event.previousPersona || 'none',
        timestamp: event.timestamp.toISOString(),
      })
    }

    // Custom analytics endpoint (optional)
    sendToCustomAnalytics('persona_selected', event)
  }
}

/**
 * Track persona change
 * Called when user changes their persona selection
 */
export function trackPersonaChange(
  from: PersonaType | null,
  to: PersonaType
): void {
  trackPersonaSelection({
    persona: to,
    source: 'manual',
    timestamp: new Date(),
    previousPersona: from,
  })

  // Additional tracking for persona switches
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'persona_changed', {
      from_persona: from || 'none',
      to_persona: to,
    })
  }
}

/**
 * Track persona gateway view
 * Called when PersonaGateway component is displayed
 */
export function trackPersonaGatewayView(): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] Persona Gateway Viewed')
  }

  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'persona_gateway_viewed', {
      page_path: window.location.pathname,
    })
  }
}

/**
 * Track registration with persona context
 * Called when user completes registration after persona selection
 */
export function trackPersonaRegistration(persona: PersonaType): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] Registration Started with Persona:', persona)
  }

  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'registration_started', {
      persona_type: persona,
      conversion_source: 'persona_flow',
    })
  }
}

/**
 * Track persona-specific page view
 * Called when user views a persona-specific landing page
 */
export function trackPersonaPageView(
  page: '/for-employees' | '/for-restaurants' | '/for-companies',
  persona?: PersonaType
): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: page,
      persona_context: persona || 'none',
    })
  }
}

/**
 * Send event to custom analytics endpoint
 * Replace with your own analytics service
 */
async function sendToCustomAnalytics(
  eventName: string,
  data: unknown
): Promise<void> {
  try {
    // Optional: Send to your own analytics API
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
      await fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: eventName,
          data,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          referrer: document.referrer,
        }),
      })
    }
  } catch (error) {
    // Silently fail - don't break user experience for analytics
    if (process.env.NODE_ENV === 'development') {
      console.error('[Analytics] Failed to send event:', error)
    }
  }
}

/**
 * Type declarations for analytics libraries
 */
declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      params?: Record<string, unknown>
    ) => void
    mixpanel?: {
      track: (eventName: string, properties?: Record<string, unknown>) => void
    }
  }
}
