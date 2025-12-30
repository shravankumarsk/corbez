# Corbe - Corporate Benefits Marketplace

A multi-tenant B2B2C marketplace platform where companies enroll employees to access exclusive restaurant discounts. Corbe connects **Restaurants** (Merchants) with **Employers** (Company Admins) to provide **Employees** with real savings on meals.

## The Corbe Ecosystem

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CORBE PLATFORM                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   RESTAURANTS                EMPLOYERS                 EMPLOYEES            │
│   (Merchants)               (Company Admins)           (End Users)          │
│                                                                             │
│   ┌─────────────┐           ┌─────────────┐           ┌─────────────┐      │
│   │ Create      │           │ Register    │           │ Explore     │      │
│   │ Discounts   │──────────▶│ Company     │──────────▶│ Restaurants │      │
│   │ (BASE/      │           │             │           │             │      │
│   │ COMPANY)    │           │ Invite      │           │ Claim       │      │
│   │             │◀──────────│ Employees   │◀──────────│ Discounts   │      │
│   │ Scan QR     │           │             │           │             │      │
│   │ to Redeem   │           │ Track       │           │ Show QR     │      │
│   │             │           │ Savings     │           │ at Counter  │      │
│   └─────────────┘           └─────────────┘           └─────────────┘      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## How It Works

### For Restaurants
1. **Sign up** and complete the onboarding wizard
2. **Create discounts** - either BASE (all employees) or COMPANY-specific (negotiated rates)
3. **Set optional limits** - e.g., "Max 3 uses per employee per month"
4. **Scan QR codes** when employees visit to validate and track redemptions

### For Employers
1. **Register your company** with corporate email
2. **Invite employees** via email or CSV bulk import
3. **Negotiate exclusive rates** with partner restaurants (optional)
4. **Track engagement** and employee satisfaction (coming soon)

### For Employees
1. **Get invited** by your company's HR team
2. **Explore restaurants** in your area with available discounts
3. **Claim discounts** with one click - they go to your wallet
4. **Show QR code** at the restaurant counter to redeem

### Key Benefits

| Stakeholder | Value Proposition |
|-------------|-------------------|
| **Restaurants** | Attract steady stream of corporate customers, build loyalty |
| **Employers** | Zero-cost employee perk that boosts satisfaction and retention |
| **Employees** | Real savings (10-20%+) on everyday meals, no hassle |

## Architecture

- **Frontend**: Next.js 15 (App Router, React Server Components)
- **Database**: MongoDB with Mongoose ORM
- **Authentication**: NextAuth.js v5 with JWT sessions
- **Caching**: Redis with in-memory fallback
- **Job Queue**: BullMQ for background processing
- **Events**: Custom event bus with pub/sub pattern
- **Styling**: Tailwind CSS
- **Validation**: Zod schemas
- **Deployment**: Vercel

## Project Structure

```
corbe/
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── (auth)/             # Auth routes (login, register)
│   │   ├── dashboard/
│   │   │   ├── employee/       # Employee dashboard & profile
│   │   │   ├── merchant/       # Merchant dashboard & onboarding
│   │   │   └── company/        # Company admin portal
│   │   └── api/                # API routes
│   ├── components/
│   │   ├── layout/             # DashboardLayout, navigation
│   │   ├── merchant/           # Merchant-specific components
│   │   └── ui/                 # Reusable UI components
│   ├── lib/
│   │   ├── db/                 # Database connection and models
│   │   ├── auth/               # Authentication configuration
│   │   ├── cache/              # Redis caching layer
│   │   ├── audit/              # Audit logging system
│   │   ├── events/             # Event bus & handlers
│   │   ├── jobs/               # BullMQ background jobs
│   │   ├── middleware/         # Rate limiting & other middleware
│   │   ├── services/           # Domain service layer
│   │   └── validations/        # Zod validation schemas
│   ├── types/                  # TypeScript type definitions
│   └── middleware.ts           # Next.js middleware for route protection
├── .env.example                # Environment variables template
└── package.json                # Project dependencies
```

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB Atlas account (free tier available)
- npm or pnpm

### Installation

1. Clone the repository:
```bash
cd ~/Desktop/corbe
```

2. Copy environment variables:
```bash
cp .env.example .env.local
```

3. Update `.env.local` with your MongoDB URI and other credentials:
```bash
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/corbe
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
```

4. Install dependencies:
```bash
npm install
```

5. Run the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## Product Features by User Type

### Restaurants (Merchants)

Restaurants join Corbe to attract corporate customers with exclusive discounts.

#### Onboarding Flow
1. **Register** with business email
2. **Complete 3-step wizard:**
   - Basic Info (business name, description, logo)
   - Location (address, coordinates for map)
   - Business Metrics (avg order value, price tier, seating, peak hours)
3. **Select categories** (Italian, Mexican, Fast Casual, etc.)
4. **Account activated** after onboarding completion

#### Discount Management (`/dashboard/merchant/discounts`)

| Feature | Description |
|---------|-------------|
| **BASE Discounts** | Default discount available to ALL employees on the platform (e.g., "10% off for all Corbe users") |
| **COMPANY Discounts** | Negotiated rates for specific companies (e.g., "15% off for Google employees") |
| **Monthly Usage Limits** | Optional limit per employee (e.g., "Max 3 uses per month") |
| **Discount Activation** | Toggle discounts on/off without deleting |

```
Discount Types:
┌──────────────────────────────────────────────────────┐
│  BASE DISCOUNT        │  COMPANY DISCOUNT            │
│  - Available to all   │  - Negotiated with specific  │
│  - Lower percentage   │    company                   │
│  - No company filter  │  - Higher percentage         │
│                       │  - Company-specific          │
└──────────────────────────────────────────────────────┘
```

#### QR Scanner (`/dashboard/merchant/scanner`)
- Scan employee QR codes at the counter
- Verify coupon validity in real-time
- Track redemption with automatic usage counting
- View employee name and discount details

#### Dashboard Features
- **Analytics**: Track claims, redemptions, redemption rate
- **Locations**: Manage multiple restaurant locations
- **Profile**: Update business information, logo, description
- **Settings**: Business hours, contact info

---

### Employers (Company Admins)

Companies register to provide meal benefits to their employees at no cost.

#### Company Registration
1. **Register** with company email domain
2. **Set up company profile** (name, logo, industry, size)
3. **Start inviting employees** immediately

#### Employee Management (`/dashboard/company/employees`)

| Feature | Description |
|---------|-------------|
| **Email Invitations** | Send individual invites to employees |
| **Bulk Import (CSV)** | Upload spreadsheet with employee emails |
| **Employee Status** | View ACTIVE, PENDING, SUSPENDED employees |
| **Remove Employees** | Deactivate employees who leave the company |

#### Admin Features
- **Invite Admins**: Add other HR team members as co-admins
- **Company Profile**: Update company branding and info
- **Moderation**: Suspend employees for policy violations
- **Negotiated Discounts**: Work with restaurants for exclusive company rates

#### Analytics Dashboard (Coming Soon)
- Total employee savings
- Most popular restaurants
- Engagement metrics
- ROI reports for leadership

---

### Employees (End Users)

Employees access exclusive restaurant discounts through their company's Corbe enrollment.

#### Getting Started
1. **Receive invite** from company admin (or register with company email)
2. **Complete profile** (name, optional backup email/phone)
3. **Explore restaurants** and claim discounts
4. **Show QR code** at restaurant to redeem

#### Explore Restaurants (`/dashboard/employee/explore`)

| Feature | Description |
|---------|-------------|
| **Restaurant Grid** | Browse all partner restaurants with discounts |
| **Search** | Find restaurants by name |
| **Location Sorting** | Enable GPS to see nearest restaurants first |
| **Discount Badges** | See discount percentage and "Negotiated Rate" tag for company-specific deals |
| **Claim Button** | One-click to add discount to your wallet |

```
Restaurant Card:
┌────────────────────────────────────────────┐
│  [LOGO]  Restaurant Name                   │
│          City, State  (2.5 km away)        │
│                                            │
│  ┌─────────────────────────────────────┐  │
│  │  15% off  [Negotiated] [3x/month]   │  │
│  │                    [Claim 15% Off]  │  │
│  └─────────────────────────────────────┘  │
└────────────────────────────────────────────┘
```

#### My ID Card / Wallet (`/dashboard/employee/wallet`)

| Feature | Description |
|---------|-------------|
| **Active Coupons** | All claimed discounts with QR codes |
| **QR Code Display** | Full-screen QR for easy scanning |
| **Coupon Details** | Restaurant name, discount %, usage limit |
| **Usage Tracking** | "Used 2/3 this month" indicator |
| **Unlimited Validity** | Coupons don't expire (unless restaurant sets limit) |

#### Coupon Flow

```
Claim → Show QR at Restaurant → Staff Scans → Discount Applied → Usage Tracked
                                                    ↓
                                        (If monthly limit reached)
                                                    ↓
                                    "Limit reached, resets next month"
```

#### Additional Features

| Page | Features |
|------|----------|
| **Dashboard** (`/dashboard/employee`) | Welcome message, quick stats, recent activity |
| **Refer Friends** (`/dashboard/employee/refer`) | Unique referral code, invite colleagues, track referrals |
| **Profile** (`/dashboard/employee/profile`) | Update name, backup email, phone, preferences |

---

## Multi-Role System

Corbe supports 4 distinct user roles:

| Role | Access Level | Key Capabilities |
|------|--------------|------------------|
| **EMPLOYEE** | Employee Dashboard | Browse restaurants, claim discounts, show QR codes |
| **MERCHANT** | Merchant Dashboard | Create discounts, scan QR codes, view analytics |
| **COMPANY_ADMIN** | Company Dashboard | Invite employees, manage team, view company stats |
| **PLATFORM_ADMIN** | Admin Panel | Approve merchants, manage categories, platform config |

## Database Models

### Core Collections

- **Users**: Authentication and user accounts with role-based access
- **Companies**: Corporate entities and multi-tenant containers
- **Employees**: Links users to companies, tracks employee data
- **Merchants**: Local businesses offering deals
- **Deals**: Offers/coupons with flexible discount types and company targeting
- **ClaimedCoupons**: Tracks which employees claimed which deals
- **Categories**: Organize deals and merchants

## Features (MVP)

### Week 1: Foundation
- User authentication (register, login, email verification)
- Role-based access control
- Basic role-specific dashboards
- Database setup and models

### Week 2: Company & Employee Management
- Company registration and onboarding
- Employee invitation system
- CSV bulk import
- Employee management dashboard

### Week 3: Merchant & Deal Creation
- Merchant registration
- Deal creation with targeting
- Image upload support
- Multiple discount types (%, fixed, BOGO, free item)

### Week 4: Marketplace & Discovery
- Employee marketplace with deal browsing
- Search and filtering
- Deal claiming with validation
- My Coupons page with redemption tracking

### Week 5: Analytics & Notifications
- Merchant analytics dashboard
- Company analytics dashboard
- Email notifications (Resend integration)
- Platform admin analytics

### Week 6: Polish & Launch
- UI/UX refinement
- Mobile responsive design
- Security hardening
- E2E testing
- Production deployment

## Development Scripts

```bash
# Development
npm run dev              # Start development server
npm run type-check      # Check TypeScript types
npm run lint            # Run ESLint
npm run format          # Format code with Prettier

# Testing
npm test                # Run tests
npm test:watch         # Watch mode
npm test:e2e           # E2E tests

# Database
npm run db:seed        # Seed database with sample data
```

## API Routes

All API routes use Next.js 13+ Server Actions for mutations.

### Authentication
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout
- `POST /api/auth/callback/credentials` - Credentials provider callback

### Core API
- Deals API (coming soon)
- Users API (coming soon)
- Companies API (coming soon)
- Analytics API (coming soon)

## Environment Variables

Create a `.env.local` file with:

```env
# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/corbe

# Redis (optional - falls back to in-memory cache)
REDIS_URL=redis://localhost:6379

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generated-secret>

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@corbez.com

# File Storage (Cloudinary)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Corbe
```

## Security

- Passwords hashed with bcrypt (12 salt rounds)
- Email verification required
- JWT-based sessions
- Rate limiting on all API endpoints
- Input validation with Zod
- CSRF protection (NextAuth)
- NoSQL injection prevention (Mongoose)
- Comprehensive audit logging

## Performance

- Redis caching with TTL-based invalidation
- In-memory cache fallback for development
- Denormalized data for faster reads
- Compound indexes for common queries
- Server components for reduced client JS
- Background job processing for heavy tasks
- Image optimization
- Lazy loading components

## System Architecture

### Caching Layer (`/src/lib/cache/`)
Redis-based caching with automatic in-memory fallback:
- `cache.get/set/del` - Basic cache operations
- `cache.getOrSet` - Cache-aside pattern
- `cache.invalidate` - Pattern-based cache invalidation
- `cache.incr` - Atomic counters for rate limiting
- Pre-defined cache keys for consistency

### Audit Logging (`/src/lib/audit/`)
Comprehensive audit trail for compliance and debugging:
- 30+ action types (auth, user, company, merchant, payments)
- Severity levels (INFO, WARNING, ERROR, CRITICAL)
- Batched writes (flushes every 5 seconds)
- Auto-cleanup via TTL index (90 days)
- Request context tracking (IP, user agent, session)

### Event System (`/src/lib/events/`)
Decoupled event-driven architecture:
- Typed events for all domain actions
- Pub/sub pattern with async handlers
- Event handlers for:
  - Audit logging (automatic)
  - Email notifications
  - Analytics tracking
  - Cache invalidation

### Background Jobs (`/src/lib/jobs/`)
BullMQ-powered job queue:
- Email sending (single & bulk)
- Scheduled cleanup tasks
- Analytics report generation
- Merchant stats updates
- Cron-based scheduling

### Rate Limiting (`/src/lib/middleware/`)
Configurable rate limiting:
- Default: 100 req/min
- Auth endpoints: 5 req/15min
- Strict: 10 req/hour
- Redis-backed counters
- Automatic audit logging on limit exceeded

### Service Layer (`/src/lib/services/`)
Domain-driven service abstraction:
- `userService` - User management, auth, referrals
- `merchantService` - Merchant CRUD, onboarding, search
- `discountService` - Discount management, savings calculation
- `moderationService` - Suspensions, bans, warnings, appeals
- Base service with caching and events integration

---

## Moderation & Trust System

### Status Lifecycle

#### Employee Status Flow
```
PENDING → ACTIVE → SUSPENDED → ACTIVE (or BANNED)
                 ↓
              INACTIVE (left company)
```

| Status | Can Access QR/Wallet | Can Redeem Coupons | Can Refer |
|--------|---------------------|--------------------|-----------|
| PENDING | No | No | No |
| ACTIVE | Yes | Yes | Yes |
| INACTIVE | No | No | No |
| SUSPENDED | No | No | No |
| BANNED | No | No | No |

#### Merchant Status Flow
```
PENDING → ACTIVE → SUSPENDED → ACTIVE
```

| Status | Visible in App | Can Accept Redemptions | Dashboard Access |
|--------|---------------|----------------------|------------------|
| PENDING | No | No | Limited |
| ACTIVE | Yes | Yes | Full |
| SUSPENDED | No | No | Read-only |

### Moderation Actions

#### Warning System
- Employees receive warnings for minor violations
- Warnings are cumulative and tracked
- **Auto-suspension after 3 warnings** (7-day default)

#### Suspension
- Temporary restriction of account access
- Duration: hours, days, weeks, or months
- All active coupons cancelled on suspension
- Auto-expires via scheduled job
- Appealable within 14 days

#### Ban
- Permanent account restriction
- All coupons cancelled
- Appealable within 30 days
- Requires admin approval to reverse

### Violation Types

**Employee Violations:**
- `COUPON_ABUSE` - Using coupons excessively or fraudulently
- `MULTIPLE_ACCOUNTS` - Operating multiple accounts
- `SHARING_COUPONS` - Sharing QR codes with non-employees
- `FRAUDULENT_REDEMPTION` - Attempting to redeem invalid coupons
- `TERMS_VIOLATION` - General terms of service violation

**Merchant Violations:**
- `FALSE_ADVERTISING` - Misrepresenting discounts
- `REFUSING_VALID_COUPONS` - Not honoring valid coupons
- `PAYMENT_ISSUES` - Subscription payment failures
- `INACTIVE_BUSINESS` - Business no longer operating
- `QUALITY_COMPLAINTS` - Excessive customer complaints

### Access Control Matrix

| Action | Platform Admin | Company Admin | Merchant Owner |
|--------|---------------|---------------|----------------|
| Warn Employee | ✅ | ✅ (own company) | ❌ |
| Suspend Employee | ✅ | ✅ (own company) | ❌ |
| Ban Employee | ✅ | ❌ | ❌ |
| Suspend Merchant | ✅ | ❌ | ❌ |
| Suspend Company | ✅ | ❌ | ❌ |
| View Audit Logs | ✅ | ✅ (own company) | ✅ (own) |
| Handle Appeals | ✅ | ❌ | ❌ |

### Implementation

```typescript
// Check if employee can access features
const access = await moderationService.canAccessFeatures(employeeId)
if (!access.canAccess) {
  return { error: access.reason }
}

// Suspend an employee
await moderationService.suspendEmployee(employeeId, adminId, 'COMPANY_ADMIN', {
  reason: ModerationReason.COUPON_ABUSE,
  reasonDetails: 'Used 50 coupons in one day',
  duration: { value: 7, unit: 'days' },
  notifyUser: true,
})

// Ban for severe violations
await moderationService.banEmployee(employeeId, adminId, 'PLATFORM_ADMIN', {
  reason: ModerationReason.FRAUDULENT_REDEMPTION,
  reasonDetails: 'Created fake redemption codes',
  evidence: { description: 'Logs attached', attachments: ['log-url'] },
})
```

### Scheduled Jobs

| Job | Schedule | Description |
|-----|----------|-------------|
| `PROCESS_EXPIRED_SUSPENSIONS` | Every hour | Auto-unsuspend expired suspensions |
| `CLEANUP_EXPIRED_COUPONS` | Daily 2 AM | Mark expired coupons |

### Audit Trail

All moderation actions are logged in `ModerationAction` collection:
- Who performed the action
- What action was taken
- Target entity (employee/merchant/company)
- Evidence and reason
- Previous and new state snapshots
- Appeal status and deadline

## Multi-Tenancy

Multi-tenancy is implemented at the application layer:

- **Data Isolation**: Employees see only deals targeted to their company
- **Company Admins**: Can only manage their own employees and view their analytics
- **Merchants**: Can target specific companies when creating deals
- **Merchant Visibility**: Based on deal targeting configuration

## Testing

- Unit tests with Vitest
- Integration tests with MongoDB Memory Server
- E2E tests with Playwright
- Critical user flows covered

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy automatically on push

```bash
npm run build
npm start
```

## Troubleshooting

### MongoDB Connection Issues
- Verify `MONGODB_URI` is correct
- Ensure IP is whitelisted in MongoDB Atlas
- Check network connectivity

### NextAuth Issues
- Generate new `NEXTAUTH_SECRET`: `openssl rand -base64 32`
- Ensure `NEXTAUTH_URL` matches your deployment URL
- Check callback configuration

### Build Issues
- Clear `.next` directory: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run type-check`

## Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/my-feature`
4. Open pull request

## License

Proprietary - All rights reserved

## Support

For issues, questions, or business inquiries:
- **Email**: contact@corbez.com
- **Website**: https://corbez.com

---

**Status**: MVP Feature Complete ✅

### Foundation
- ✅ Next.js 15 with App Router
- ✅ MongoDB models (User, Company, Employee, Merchant, Discount, ClaimedCoupon, Category, Referral, AuditLog)
- ✅ NextAuth v5 with multi-role support
- ✅ Route protection middleware
- ✅ Login/Register pages

### User System
- ✅ Portable user IDs (CB-XXXXXX format)
- ✅ Backup contact fields (personal email, phone)
- ✅ Referral system with unique codes
- ✅ Profile pages for employees and merchants

### Dashboard UI
- ✅ Responsive dashboard layout with fixed sidebar
- ✅ Employee dashboard (explore, wallet, referrals, profile)
- ✅ Merchant dashboard with onboarding wizard
- ✅ Company admin dashboard

### Merchant Features
- ✅ 3-step onboarding wizard (Basic Info, Location, Business Metrics)
- ✅ Business metrics collection (avg order value, price tier, seating, peak hours)
- ✅ Category selection
- ✅ Discount management (BASE & COMPANY types)
- ✅ Monthly usage limits per employee
- ✅ QR code scanner for redemptions

### Employee Coupon Flow ✅ (NEW)
- ✅ Explore restaurants page with search & location sorting
- ✅ Discount display with "Negotiated Rate" tags
- ✅ One-click coupon claiming
- ✅ QR code wallet with active coupons
- ✅ Reusable coupons (no expiry by default)
- ✅ Monthly usage tracking with auto-reset
- ✅ Usage status display ("Used 2/3 this month")

### System Architecture
- ✅ Redis caching layer with in-memory fallback
- ✅ Audit logging system (30+ action types, 90-day TTL)
- ✅ Event-driven architecture with typed events
- ✅ BullMQ background job queue
- ✅ Rate limiting middleware
- ✅ Service layer abstraction (User, Merchant, Discount, Coupon, Moderation)

### Moderation & Trust
- ✅ Employee status lifecycle (PENDING → ACTIVE → SUSPENDED/BANNED)
- ✅ Merchant status management (PENDING → ACTIVE → SUSPENDED)
- ✅ Warning system with auto-suspension after 3 warnings
- ✅ Time-based suspensions with auto-expiry
- ✅ Full audit trail for all moderation actions
- ✅ Appeal system with deadlines
- ✅ Only ACTIVE status has QR/wallet access

### Upcoming Enhancements
- ⏳ HR savings dashboard with calculated projections
- ⏳ Email service integration (Resend)
- ⏳ Stripe subscription for merchants
- ⏳ Push notifications for new restaurants

---

## Development Guidelines

### Code Architecture Principles

1. **Service Layer First**
   - All business logic goes in `/src/lib/services/`
   - API routes should only handle HTTP concerns (validation, response formatting)
   - Services emit events; handlers react to them

2. **Event-Driven Design**
   - Use `eventBus.emit()` for all significant actions
   - Keep handlers focused (audit, email, analytics separate)
   - Never block on event handlers - use `emitAsync()`

3. **Caching Strategy**
   - Cache reads, invalidate on writes
   - Use `cache.getOrSet()` for cache-aside pattern
   - Pre-define cache keys in `cacheKeys` object

4. **Error Handling**
   - Log errors to audit system with `AuditSeverity.ERROR`
   - Return user-friendly messages, log technical details
   - Use rate limiting to prevent abuse

### API Design Standards

```typescript
// Standard API response format
{ success: true, data: {...} }
{ success: false, error: "message", code: "ERROR_CODE" }

// Always validate with Zod
const schema = z.object({ ... })
const result = schema.safeParse(body)
```

### Database Conventions

- Use compound indexes for common query patterns
- Add TTL indexes for temporary data (sessions, tokens, audit logs)
- Always use `lean()` for read-only queries
- Prefer `findOneAndUpdate` with `{ new: true }` over find-then-save

---

## Viral Growth Strategy

### Overview

Corbe's growth model leverages a **triple-sided viral loop**:
1. **Employees** refer colleagues for rewards
2. **Companies** see ROI and expand enrollment
3. **Merchants** attract more customers, offer better deals

### Growth Loops Implemented

#### 1. Employee Referral Loop (P2P Viral)

```
Employee joins → Uses discounts → Sees savings →
Shares referral link → Friend joins → Both get rewards → Repeat
```

**Implementation:**
- Unique referral codes per user (`CB-XXXXXX`)
- Pre-filled share messages with personalized savings stats
- Dual-sided rewards (referrer + referee)
- Real-time referral tracking in dashboard

**Trigger Points:**
- After first coupon redemption (high-value moment)
- Monthly savings summary email
- Achievement unlocks (10 coupons, $100 saved)

#### 2. Company Network Effect Loop (B2B Viral)

```
HR Admin enrolls → Employees save money → HR sees ROI dashboard →
HR shares with peer HRs → New company joins → Repeat
```

**Implementation:**
- Company savings dashboard with projections
- Exportable ROI reports for HR
- "Powered by Corbe" in employee communications
- HR referral program with SaaS credits

#### 3. Merchant Supply Loop (B2B2C)

```
Merchant joins → Offers discounts → Gets customers →
Sees analytics → Tells other merchants → More deals →
More employee value → More companies join
```

**Implementation:**
- Merchant analytics dashboard
- Success story templates
- Local merchant network effects

### Viral Mechanics Checklist

#### Frictionless Sharing
- [ ] One-tap share to SMS, WhatsApp, Email
- [ ] Pre-populated messages with personalized stats
- [ ] Deep links that auto-apply referral codes
- [ ] QR codes for in-person sharing

#### Dual-Sided Incentives
- [ ] Referrer: Bonus credits, premium features, cash
- [ ] Referee: Extended trial, bonus discount, welcome credits
- [ ] Tiered rewards (more referrals = better rewards)

#### High-Value Moment Triggers
- [ ] First successful redemption → "Share your win!"
- [ ] Monthly savings milestone → "You saved $X this month!"
- [ ] Achievement badges → "You're a Corbe Champion!"
- [ ] New merchant near you → "Your favorite spot joined!"

#### Gamification Elements
- [ ] Savings leaderboard (opt-in, company-wide)
- [ ] Achievement badges and streaks
- [ ] Referral milestones with unlocks
- [ ] "Founding member" status for early adopters

### Key Metrics to Track

| Metric | Formula | Target |
|--------|---------|--------|
| K-factor (Viral Coefficient) | Invites sent × Conversion rate | > 1.0 |
| Viral Cycle Time | Days from signup to first referral | < 7 days |
| Referral Conversion | Referred signups / Total invites | > 25% |
| Share Rate | Users who share / Total active users | > 15% |
| Network Density | Connections per user | Growing |

### Growth Experiments Backlog

1. **Referral Reward A/B Test**
   - Test: $5 credit vs 1 month premium vs extra discount %
   - Hypothesis: Cash rewards drive higher conversion

2. **Share Timing Optimization**
   - Test: Post-redemption vs weekly digest vs milestone
   - Hypothesis: Immediate post-redemption has highest conversion

3. **Social Proof Integration**
   - Test: "X colleagues joined" vs "Y saved this week"
   - Hypothesis: Social proof increases share rate

4. **Onboarding Share Prompt**
   - Test: Skip vs soft ask vs required invite
   - Hypothesis: Soft ask balances UX and virality

### Implementation Priorities

**Phase 1: Foundation (Current)**
- ✅ Unique referral codes
- ✅ Referral tracking in database
- ✅ Basic share UI in dashboard

**Phase 2: Viral Mechanics**
- [ ] One-click share with deep links
- [ ] Dual-sided reward system
- [ ] Referral dashboard with stats

**Phase 3: Optimization**
- [ ] A/B testing framework
- [ ] Automated trigger emails
- [ ] Gamification layer

**Phase 4: Scale**
- [ ] Company referral program
- [ ] Merchant referral program
- [ ] Viral analytics dashboard
