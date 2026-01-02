# Persona System Documentation

## Overview

The Corbez persona system dynamically adapts marketing content, UI components, and user flows based on three distinct user personas:

- **Employee**: End users who save money at restaurants
- **Merchant**: Restaurant owners who offer discounts to attract corporate customers
- **Company Admin**: HR/Benefits managers who provide dining perks to employees

This system ensures each persona sees relevant messaging, benefits, and social proof tailored to their specific needs.

---

## Architecture

### Cookie-Based Persistence

The system uses a **functional cookie** (`corbez_persona`) to remember user selection across sessions:

- **Cookie name**: `corbez_persona`
- **Values**: `'employee'` | `'merchant'` | `'company'` | `null`
- **Expiry**: 30 days
- **Scope**: Entire site (path: `/`)
- **Security**: `sameSite: 'lax'`, `secure` in production
- **Consent**: Not required (functional cookie for UX, not tracking)

### Fallback Chain

When determining persona, the system follows this priority:

1. **URL parameter**: `?type=employee` (highest priority)
2. **Cookie**: `corbez_persona` cookie value
3. **Default**: `'employee'` (fallback if nothing set)

### Hybrid Approach

- **URL-based routing**: Dedicated pages (`/for-employees`, `/for-restaurants`, `/for-companies`)
- **Cookie persistence**: Selection remembered across pages
- **Dynamic rendering**: Components adapt based on selected persona

---

## File Structure

### Core Files

```
src/
├── lib/
│   ├── content/
│   │   └── personas.ts              # Content schema & data (SINGLE SOURCE OF TRUTH)
│   └── utils/
│       ├── persona.ts                # Server-side cookie utilities
│       └── persona-helpers.ts        # Styling & mapping utilities (NEW)
├── contexts/
│   └── PersonaContext.tsx            # Client-side state management
├── components/
│   └── landing/
│       ├── PersonaGateway.tsx        # 3-button persona selector
│       ├── PersonaSwitcher.tsx       # Floating "Change Audience" button
│       ├── Hero.tsx                  # Persona-aware hero section
│       ├── Stats.tsx                 # Persona-specific metrics
│       └── Benefits.tsx              # Persona-filtered benefits
├── app/
│   ├── for-employees/page.tsx        # Employee landing page
│   ├── for-restaurants/page.tsx      # Merchant landing page
│   ├── for-companies/page.tsx        # Company Admin landing page (NEW)
│   └── (auth)/
│       └── register/page.tsx         # Dynamic registration (REFACTORED)
└── lib/
    └── analytics/
        └── persona-events.ts         # Analytics tracking
```

### New Files Created (Refactoring)

1. **`/src/lib/utils/persona-helpers.ts`** (NEW)
   - Color mapping utilities (`getPersonaColor`, `getPersonaBgColor`, etc.)
   - Persona-to-role mapping (`personaToRole`, `roleToPersona`)
   - Registration banner classes (`getRegistrationBannerClasses`)
   - Reduces code duplication across 5+ components

---

## Content Schema

### personas.ts - Single Source of Truth

All persona-specific content lives in `/src/lib/content/personas.ts`:

```typescript
export type PersonaType = 'employee' | 'merchant' | 'company'

export interface PersonaContent {
  hero: {
    badge: string
    headline: string
    subheadline: string
    cta: { primary: string; secondary?: string }
    trustIndicators: string[]
  }
  benefits: Array<{
    title: string
    description: string
    metric?: string
  }>
  testimonials: Array<{
    quote: string
    author: string
    role: string
    company: string
  }>
  registration: {
    headline: string
    subtitle: string
    benefits: string[]
    socialProof: string
  }
  stats: Array<{
    value: string
    label: string
  }>
}

// Content for each persona
export const employeeContent: PersonaContent = { /* ... */ }
export const merchantContent: PersonaContent = { /* ... */ }
export const companyContent: PersonaContent = { /* ... */ }

// Helper function
export function getPersonaContent(persona: PersonaType | null): PersonaContent
```

### Tone Guidelines by Persona

| Persona | Tone | Voice | Keywords | Example |
|---------|------|-------|----------|---------|
| **Employee** | Casual, warm, tribal, aspirational | Second-person, active, emotional | belong, VIP, recognition, earned, deserve | "You earned it. Now use it." |
| **Merchant** | Direct, practical, ROI-focused, no-BS | Second-person, imperative, benefit-driven | predictable, revenue, neighbors, margins, control | "You set the discount. You keep the customers." |
| **Company Admin** | Professional, data-driven, metrics-focused, reassuring | Second-person, declarative, ROI-centered | ROI, metrics, adoption, engagement, analytics | "Track adoption rates in real-time from your dashboard." |

---

## Persona Helpers (Refactored)

### Color Mapping Utilities

Located in `/src/lib/utils/persona-helpers.ts`:

```typescript
// Text colors
getPersonaColor(persona)
// 'employee' → 'text-primary'
// 'merchant' → 'text-orange-600'
// 'company' → 'text-blue-600'

// Background colors (light)
getPersonaBgColor(persona)
// 'employee' → 'bg-primary/10'
// 'merchant' → 'bg-orange-100'
// 'company' → 'bg-blue-100'

// Background colors (solid)
getPersonaBgColorSolid(persona)
// 'employee' → 'bg-primary'
// 'merchant' → 'bg-orange-600'
// 'company' → 'bg-blue-600'

// Gradients
getPersonaBgGradient(persona)
// 'employee' → 'bg-gradient-to-r from-primary/10 to-primary/5'
// 'merchant' → 'bg-gradient-to-r from-orange-50 to-amber-50'
// 'company' → 'bg-gradient-to-r from-blue-50 to-indigo-50'

// Button colors
getPersonaButtonColor(persona)
// 'employee' → 'bg-primary hover:bg-primary-dark'
// 'merchant' → 'bg-orange-600 hover:bg-orange-700'
// 'company' → 'bg-blue-600 hover:bg-blue-700'

// Icon backgrounds (with hover)
getPersonaIconBgClasses(persona)
// 'employee' → 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'
// etc.

// Registration banner (combined)
getRegistrationBannerClasses(persona)
// Returns: { container: string, heading: string, icon: string }
```

### Role Mapping Utilities

```typescript
// Maps persona to database role
personaToRole('merchant') // → 'MERCHANT'
personaToRole('company')  // → 'COMPANY_ADMIN'
personaToRole('employee') // → 'EMPLOYEE'

// Maps database role to persona
roleToPersona('COMPANY_ADMIN') // → 'company'
roleToPersona('MERCHANT')      // → 'merchant'
roleToPersona('EMPLOYEE')      // → 'employee'
```

### Usage Example

**Before refactoring** (duplicated code):

```tsx
// Component 1
<div className={
  persona === 'employee' ? 'bg-primary/10 text-primary' :
  persona === 'merchant' ? 'bg-orange-100 text-orange-700' :
  'bg-blue-100 text-blue-700'
}>

// Component 2
<div className={
  persona === 'employee' ? 'bg-primary/10 text-primary' :
  persona === 'merchant' ? 'bg-orange-100 text-orange-700' :
  'bg-blue-100 text-blue-700'
}>
```

**After refactoring** (DRY):

```tsx
import { getPersonaBadgeStyles } from '@/lib/utils/persona-helpers'

<div className={getPersonaBadgeStyles(persona)}>
```

---

## Server-Side Utilities

Located in `/src/lib/utils/persona.ts`:

```typescript
import { cookies } from 'next/headers'

// Get persona from cookie (Server Components)
export async function getServerPersona(): Promise<PersonaType> {
  const cookieStore = await cookies()
  const personaCookie = cookieStore.get('corbez_persona')
  return personaCookie?.value as PersonaType || null
}

// Set persona cookie (Server Actions)
export async function setServerPersona(persona: PersonaType): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('corbez_persona', persona, {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
}

// Get persona with fallback (URL → Cookie → Default)
export async function getPersonaWithFallback(
  urlParam?: string | null
): Promise<PersonaType> {
  if (urlParam && isValidPersona(urlParam)) return urlParam
  const cookiePersona = await getServerPersona()
  if (cookiePersona) return cookiePersona
  return 'employee' // Default
}
```

---

## Client-Side Context

Located in `/src/contexts/PersonaContext.tsx`:

### Setup

```tsx
// app/layout.tsx
import { PersonaProvider } from '@/contexts/PersonaContext'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <PersonaProvider>
          {children}
        </PersonaProvider>
      </body>
    </html>
  )
}
```

### Usage in Components

```tsx
import { usePersona } from '@/contexts/PersonaContext'
import { getPersonaContent } from '@/lib/content/personas'
import { getPersonaColor } from '@/lib/utils/persona-helpers'

function MyComponent() {
  const { persona, setPersona, clearPersona, isLoading } = usePersona()

  if (isLoading) {
    return <div>Loading...</div>
  }

  const content = persona ? getPersonaContent(persona) : null

  return (
    <div>
      <h1 className={getPersonaColor(persona)}>
        {content ? content.hero.headline : 'Default headline'}
      </h1>

      <button onClick={() => setPersona('employee')}>
        I'm an employee
      </button>

      <button onClick={clearPersona}>
        Change persona
      </button>
    </div>
  )
}
```

---

## Components

### PersonaGateway

**Location**: `/src/components/landing/PersonaGateway.tsx`

**Purpose**: 3-button card interface for user self-selection

**Features**:
- Displays 3 persona options with icons, descriptions, benefits
- Sets persona cookie and redirects to persona-specific page
- Tracks analytics when persona is selected

**Usage**:

```tsx
import PersonaGateway from '@/components/landing/PersonaGateway'

<PersonaGateway />
```

**Placement**: Typically after Hero section on landing page

---

### PersonaSwitcher

**Location**: `/src/components/landing/PersonaSwitcher.tsx`

**Purpose**: Floating button to change selected persona

**Features**:
- Shows current persona (colored dot + name)
- Only visible when persona is selected
- Clears persona and scrolls to PersonaGateway
- Fixed bottom-right positioning

**Usage**:

```tsx
import PersonaSwitcher from '@/components/landing/PersonaSwitcher'

<PersonaSwitcher />
```

**Placement**: At the end of layout (floats over content)

---

### Persona-Aware Components

#### Hero Component

```tsx
// Adapts badge, headline, CTAs based on persona
const { persona } = usePersona()
const content = persona ? getPersonaContent(persona).hero : null

<div className={getPersonaBadgeStyles(persona)}>
  {content ? content.badge : 'Default badge'}
</div>
```

#### Benefits Component

```tsx
// Shows only relevant benefits for selected persona
const { persona } = usePersona()
const benefits = persona ? getPersonaContent(persona).benefits : defaultBenefits

{benefits.map(benefit => (
  <div className={getPersonaHoverBorderColor(persona)}>
    <h3>{benefit.title}</h3>
    <p>{benefit.description}</p>
  </div>
))}
```

#### Stats Component

```tsx
// Displays persona-specific metrics
const stats = persona ? getPersonaContent(persona).stats : defaultStats
```

---

## Analytics Tracking

Located in `/src/lib/analytics/persona-events.ts`:

### Events Tracked

```typescript
// When user selects persona
trackPersonaSelection({
  persona: 'employee',
  source: 'gateway', // or 'url_param', 'cookie', 'manual'
  timestamp: new Date(),
  previousPersona: null,
})

// When user changes persona
trackPersonaChange('employee', 'merchant')

// When PersonaGateway is viewed
trackPersonaGatewayView()

// When user registers with a persona
trackPersonaRegistration('employee')
```

### Integration

```typescript
// Google Analytics (gtag)
window.gtag('event', 'persona_selected', {
  persona_type: 'employee',
  selection_source: 'gateway',
})

// Mixpanel
window.mixpanel.track('Persona Selected', {
  persona: 'employee',
  source: 'gateway',
})
```

---

## Adding a New Persona

### Step 1: Update personas.ts

```typescript
// Add content
export const investorContent: PersonaContent = {
  hero: {
    badge: 'For Venture Capitalists',
    headline: 'Fund the future of dining',
    // ...
  },
  // ...
}

// Update function
export function getPersonaContent(persona: PersonaType | null): PersonaContent {
  switch (persona) {
    case 'investor': return investorContent
    // ...
  }
}
```

### Step 2: Update persona-helpers.ts

```typescript
export function getPersonaColor(persona: PersonaType | null): string {
  switch (persona) {
    case 'investor':
      return 'text-purple-600'
    // ...
  }
}

// Update all other helper functions similarly
```

### Step 3: Add Landing Page

Create `/src/app/for-investors/page.tsx` following existing patterns

### Step 4: Add to Navigation

```tsx
// navbar.tsx
const navLinks = [
  // ...
  { href: '/for-investors', label: 'For Investors' },
]
```

### Step 5: Add to PersonaGateway

```tsx
const personaCards: PersonaCardData[] = [
  // ...
  {
    persona: 'investor',
    icon: <InvestorIcon />,
    description: 'Fund innovative dining',
    benefits: ['High ROI', 'Growth potential', 'Market insights'],
    cta: 'Learn More',
  },
]
```

---

## Best Practices

### DO ✅

- **Use persona helpers** for ALL persona-specific styling
- **Read from personas.ts** for ALL content (single source of truth)
- **Track analytics** when persona changes
- **Provide fallbacks** if no persona selected
- **Test all 3 personas** when making changes
- **Use TypeScript types** (`PersonaType`, `PersonaContent`)
- **Keep components generic** - let content drive differences

### DON'T ❌

- **Hard-code colors** - use `getPersonaColor()` instead
- **Duplicate content** - always reference personas.ts
- **Skip analytics** - track all persona interactions
- **Assume persona exists** - always check for null
- **Mix persona logic** - keep it centralized
- **Hard-code persona-to-role mapping** - use `personaToRole()`
- **Inline ternaries for colors** - use helper functions

---

## Testing Checklist

### Manual Testing

- [ ] Visit `/` and select each persona via PersonaGateway
- [ ] Verify cookie persists across page reloads
- [ ] Test URL parameter: `/register?type=merchant`
- [ ] Verify PersonaSwitcher appears and works
- [ ] Check all 3 landing pages render correctly
- [ ] Test registration flow for each persona
- [ ] Verify dynamic headlines in registration
- [ ] Check responsive design (mobile, tablet, desktop)

### Cross-Browser Testing

- [ ] Chrome (desktop & mobile)
- [ ] Safari (desktop & iOS)
- [ ] Firefox
- [ ] Edge

### Cookie Edge Cases

- [ ] Cookies disabled - should fallback gracefully
- [ ] Corrupt cookie value - should validate and ignore
- [ ] Cookie expires - should clear persona state
- [ ] Multiple tabs - persona should sync

---

## Troubleshooting

### Issue: Persona not persisting

**Cause**: Cookie not being set correctly

**Solution**:
1. Check browser DevTools → Application → Cookies
2. Verify `corbez_persona` cookie exists
3. Check `sameSite` and `secure` settings match environment

### Issue: Wrong content showing

**Cause**: Fallback chain not working correctly

**Solution**:
1. Check URL parameter `?type=` is valid
2. Verify cookie value is `'employee'`, `'merchant'`, or `'company'`
3. Ensure `getPersonaWithFallback()` is called in correct order

### Issue: Flash of default content

**Cause**: `isLoading` not being checked in components

**Solution**:

```tsx
const { persona, isLoading } = usePersona()

if (isLoading) {
  return <Skeleton />
}
```

### Issue: Colors not applying

**Cause**: Not using persona helper functions

**Solution**: Replace inline ternaries with helpers:

```tsx
// ❌ Before
className={persona === 'employee' ? 'text-primary' : 'text-orange-600'}

// ✅ After
className={getPersonaColor(persona)}
```

---

## Performance Considerations

### Bundle Size Impact

- **persona-helpers.ts**: ~2KB (tiny utility functions)
- **personas.ts**: ~8KB (content data)
- **PersonaContext**: ~1KB (React context)

**Total**: ~11KB (negligible)

### Optimization Tips

1. **Lazy load landing pages** - use dynamic imports if needed
2. **Memoize content lookups** - if performance becomes an issue
3. **Compress persona content** - consider moving large content to CMS
4. **Code split by route** - Next.js does this automatically

---

## Migration Guide

### From Generic to Persona-Based

**Old Code**:

```tsx
<div className="bg-primary/10 text-primary">
  <h1>Join corbez and start saving</h1>
</div>
```

**New Code**:

```tsx
import { usePersona } from '@/contexts/PersonaContext'
import { getPersonaContent } from '@/lib/content/personas'
import { getPersonaBadgeStyles } from '@/lib/utils/persona-helpers'

function MyComponent() {
  const { persona } = usePersona()
  const content = persona ? getPersonaContent(persona).registration : null

  return (
    <div className={getPersonaBadgeStyles(persona)}>
      <h1>{content ? content.headline : 'Join corbez and start saving'}</h1>
    </div>
  )
}
```

---

## FAQ

**Q: Do I need user consent for the persona cookie?**
A: No. It's a functional cookie (UX enhancement), not tracking.

**Q: Can I use persona on server components?**
A: Yes! Use `getServerPersona()` from `persona.ts`.

**Q: What if user changes persona mid-session?**
A: `setPersona()` updates cookie and triggers re-render. All components update automatically.

**Q: How do I add company-specific content?**
A: Update `companyContent` in `personas.ts`. All components will automatically show it.

**Q: Can I have more than 3 personas?**
A: Yes! Follow "Adding a New Persona" guide above. System is extensible.

**Q: Why separate `persona-helpers.ts` from `personas.ts`?**
A: `personas.ts` = content data (marketing copy). `persona-helpers.ts` = styling utilities (Tailwind classes). Separation of concerns.

---

## Related Documentation

- [Content Guidelines](./CONTENT_GUIDELINES.md) (TODO)
- [Component Architecture](./COMPONENT_ARCHITECTURE.md) (TODO)
- [Analytics Setup](./ANALYTICS.md) (TODO)
- [Cookie Policy](./COOKIES.md) (TODO)

---

## Support

For questions or issues:
1. Check this documentation
2. Review code examples in `/src/components/landing/`
3. Search existing GitHub issues
4. Ask in `#dev-frontend` Slack channel
