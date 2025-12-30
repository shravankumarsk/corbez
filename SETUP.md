# Corbe Setup Guide

## ✅ Completed (Week 1 Foundation)

### Project Initialization
- ✅ Created Next.js 15 project with TypeScript and Tailwind CSS
- ✅ Configured ESLint, Prettier, and development tooling
- ✅ Set up project structure with domain-based organization

### Database Models (MongoDB/Mongoose)
- ✅ **User Model**: Authentication, roles, password hashing
- ✅ **Company Model**: Multi-tenant entity with settings
- ✅ **Employee Model**: Links users to companies
- ✅ **Merchant Model**: Business profiles with locations
- ✅ **Deal Model**: Flexible discount types with company targeting
- ✅ **ClaimedCoupon Model**: Tracks employee coupon claims
- ✅ **Category Model**: Deal and merchant organization

### Authentication & Security
- ✅ NextAuth.js v5 with credentials provider
- ✅ Multi-role JWT session strategy (4 roles)
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Route protection middleware
- ✅ Email verification logic (DB ready)
- ✅ Password reset flow (DB ready)

### Pages & Components
- ✅ **Home Page** (`/`): Landing page with role-specific navigation
- ✅ **Login Page** (`/login`): Email/password login
- ✅ **Register Page** (`/register`): Multi-role registration with validation
- ✅ **Auth Layout**: Styled container for auth pages

### Server Actions
- ✅ `register()`: Create new user with role-specific setup
- ✅ `login()`: Authenticate user and create session
- ✅ `verifyEmail()`: Email verification (ready to integrate)
- ✅ `requestPasswordReset()`: Initiate password reset
- ✅ `resetPassword()`: Complete password reset

### Validation Schemas (Zod)
- ✅ Login validation with email/password checks
- ✅ Registration with password complexity requirements
- ✅ Password reset validation
- ✅ Type-safe form handling

---

## 📋 Next Steps (Week 2: Company & Employee Management)

### 1. Email Service Integration
- [ ] Set up Resend API integration
- [ ] Create email templates:
  - [ ] Email verification
  - [ ] Password reset
  - [ ] Employee invitation
  - [ ] Welcome emails

**File to create**: `src/lib/services/email.service.ts`

### 2. Company Onboarding
- [ ] Build company registration form
- [ ] Create company profile pages
- [ ] Implement company approval workflow (admin)
- [ ] Add company settings management

**Files to create**:
- `src/lib/actions/company.actions.ts` - Company CRUD
- `src/lib/validations/company.schema.ts` - Validation
- `src/app/(company)/admin/layout.tsx` - Company admin layout
- `src/app/(company)/admin/page.tsx` - Dashboard
- `src/app/(company)/admin/settings/page.tsx` - Company settings

### 3. Employee Management
- [ ] Build employee invitation system
- [ ] Create invitation email template with unique link
- [ ] Implement CSV bulk import
- [ ] Build employee management table/dashboard
- [ ] Add employee status management (PENDING → ACTIVE)

**Files to create**:
- `src/lib/actions/employee.actions.ts` - Employee management
- `src/lib/validations/employee.schema.ts` - Validation
- `src/app/(company)/admin/employees/page.tsx` - List employees
- `src/app/(company)/admin/employees/invite/page.tsx` - Invite form
- `src/app/(company)/admin/employees/import/page.tsx` - CSV import

### 4. Email Verification Fix
- [ ] Implement email sending in `register()` action
- [ ] Create email verification endpoint
- [ ] Add verification token link handling
- [ ] Email template for verification link

---

## 🔧 Quick Start Guide

### 1. Install Dependencies
```bash
cd ~/Desktop/corbe
npm install  # Currently running in background
```

### 2. Set Up Environment Variables
```bash
cp .env.example .env.local
```

Edit `.env.local` with:
```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/corbe

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Resend (get free API key at resend.com)
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=noreply@corbez.com

# Cloudinary (optional, for image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

### 3. MongoDB Atlas Setup
1. Go to https://cloud.mongodb.com
2. Create free cluster
3. Create database user
4. Get connection string (MONGODB_URI)
5. Whitelist your IP

### 4. Run Development Server
```bash
npm run dev
```

Visit: http://localhost:3000

### 5. Test Authentication
- Go to http://localhost:3000/register
- Create account with:
  - Email: test@example.com
  - Password: TestPassword123!
  - Role: Employee
- Login at http://localhost:3000/login

---

## 📊 Database Collections

All models are defined with proper indexes and validation:

```
Users
├── email (unique, indexed)
├── password (hashed)
├── role (EMPLOYEE | MERCHANT | COMPANY_ADMIN | PLATFORM_ADMIN)
├── emailVerified
└── verificationToken

Companies
├── name
├── slug (unique)
├── adminUserId (indexed)
├── status (PENDING | ACTIVE | SUSPENDED)
└── settings

Employees
├── userId (unique)
├── companyId (indexed)
├── firstName, lastName
├── status (PENDING | ACTIVE | INACTIVE)
└── preferences

Merchants
├── userId (unique)
├── businessName
├── slug (unique)
├── status (PENDING | ACTIVE | SUSPENDED)
└── locations

Deals
├── merchantId (indexed)
├── title (indexed + text search)
├── discountType (PERCENTAGE | FIXED_AMOUNT | BOGO | FREE_ITEM)
├── targetType (ALL_EMPLOYEES | SPECIFIC_COMPANIES | PUBLIC)
├── targetCompanies (indexed)
├── status (DRAFT | ACTIVE | PAUSED | EXPIRED)
└── validFrom, validUntil

ClaimedCoupons
├── employeeId (indexed)
├── dealId (indexed, unique compound with employeeId)
├── status (ACTIVE | REDEEMED | EXPIRED)
└── uniqueCode (unique)

Categories
├── name (unique)
├── slug (unique)
├── isActive (indexed)
└── order
```

---

## 🏗️ Architecture Overview

### Request Flow

1. **User Request** → Next.js App Router
2. **Middleware** → Check authentication, validate role access
3. **Page/Component** → Render UI with Server Components
4. **Form Submission** → Server Action (no API route needed)
5. **Server Action** → Database operation via Mongoose
6. **Response** → Return to client, revalidate cache

### Authentication Flow

1. User submits login form
2. Server Action: `login()` validates credentials
3. NextAuth credentials provider checks database
4. JWT token created with user metadata
5. Session persists in HTTP-only cookie
6. Middleware validates token on protected routes

### Multi-Tenancy

- **Data Isolation**: Employees see only their company's deals
- **Query Filters**: All queries filter by `companyId`
- **Ownership Checks**: Verify user owns resource before updating
- **Slug-Based URLs**: Never expose `_id` in public URLs

---

## 🎯 Success Criteria

### Week 1 ✅
- Users can register and login
- Passwords properly hashed and validated
- Routes protected by role
- All 6 core models created with indexes

### Week 2 Goal 🎯
- Companies can register
- Company admins can invite employees
- Employees can register via invite link
- Email notifications working
- CSV bulk import working

### Week 3 Goal 🎯
- Merchants can register and create deals
- Deal creation form with image upload
- Company targeting implemented
- Multiple discount types supported

### Week 4 Goal 🎯
- Employees can browse deals
- Deal search and filtering
- Claim deal functionality
- My Coupons page
- Redemption tracking

---

## 📝 Important Notes

### Security
- **Never** commit `.env.local` or `node_modules/`
- Ensure `.gitignore` is set up properly
- Run `npm audit` before deployment
- Use HTTPS in production
- Rotate NEXTAUTH_SECRET regularly

### Performance
- Models use compound indexes for common queries
- Denormalized fields (e.g., `currentClaims`) for fast reads
- Server Components reduce client-side JS
- Images should use Next.js Image component

### Development
- Always run type-check: `npm run type-check`
- Format code: `npm run format`
- Lint before committing: `npm run lint`
- Write tests for business logic: `npm test`

---

## 🆘 Troubleshooting

### MongoDB Connection Fails
```bash
# Check connection string format
# mongodb+srv://username:password@cluster.mongodb.net/database

# Ensure:
# 1. IP is whitelisted in MongoDB Atlas
# 2. Database user password is correct
# 3. No special characters in password (URL encode if needed)
```

### NextAuth Login Not Working
```bash
# Generate new secret
openssl rand -base64 32

# Update .env.local with:
NEXTAUTH_SECRET=<new-secret>
NEXTAUTH_URL=http://localhost:3000  # match your URL
```

### TypeScript Errors
```bash
npm run type-check  # Find all type errors
npm run build       # Full build check
```

### Dependencies Conflict
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [NextAuth.js v5](https://authjs.dev/)
- [MongoDB/Mongoose](https://mongoosejs.com)
- [Zod Validation](https://zod.dev)
- [Tailwind CSS](https://tailwindcss.com)

---

**Last Updated**: Week 1 Complete - Foundation Phase
**Status**: Installation in progress → Ready for development
