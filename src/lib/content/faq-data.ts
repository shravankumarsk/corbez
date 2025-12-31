// Type definitions
export type FAQAudience = 'employee' | 'merchant' | 'company' | 'all'
export type FAQCategory = 'getting-started' | 'billing' | 'discounts' | 'technical' | 'security' | 'general'

export interface FAQItem {
  id: string
  question: string
  answer: string
  audience: FAQAudience
  category: FAQCategory
  tags?: string[]
  relatedQuestions?: string[]
  priority: number // Higher priority = shown first (1-10)
}

// Complete FAQ data with 30 strategic questions
export const faqData: FAQItem[] = [
  // ========================================
  // FOR EMPLOYEES (10 questions)
  // ========================================
  {
    id: 'employee-getting-started',
    audience: 'employee',
    category: 'getting-started',
    question: 'How do I get started with Corbez?',
    answer: `Getting started is simple:

1. Sign up with your work email at corbez.com/register
2. Verify your email by clicking the link we send you
3. Link to your company - We'll auto-detect your company from your email domain, or you can use an invite code
4. Browse restaurants - Explore exclusive discounts at local restaurants
5. Claim your first discount - Add it to your wallet
6. Show your QR code at the restaurant to redeem

That's it! You can start saving on every meal.`,
    tags: ['onboarding', 'signup', 'new user'],
    priority: 10,
    relatedQuestions: ['employee-verify-email', 'employee-add-wallet'],
  },
  {
    id: 'employee-free',
    audience: 'employee',
    category: 'billing',
    question: 'Is Corbez really free for employees?',
    answer: `Yes! Corbez is 100% free for employees.

There are no subscription fees, no hidden costs, and no catch. Your company doesn't pay either - restaurants offer you exclusive discounts because they value having corporate customers who visit regularly.

You simply sign up with your work email, claim discounts, and start saving money on every meal. No credit card required.`,
    tags: ['pricing', 'free', 'cost'],
    priority: 10,
  },
  {
    id: 'employee-verify-email',
    audience: 'employee',
    category: 'getting-started',
    question: 'How do I verify my corporate email?',
    answer: `Email verification is automatic:

1. Sign up with your company email (e.g., yourname@company.com)
2. Check your inbox for a verification email from Corbez
3. Click the verification link in the email
4. Your company will be automatically detected from your email domain

If your company uses a generic email provider (like Gmail), you may need to enter an invite code from your HR department. Can't find the email? Check your spam folder or request a new verification link.`,
    tags: ['verification', 'email', 'authentication'],
    priority: 9,
    relatedQuestions: ['employee-company-not-listed'],
  },
  {
    id: 'employee-add-wallet',
    audience: 'employee',
    category: 'technical',
    question: 'How do I add my employee pass to Apple/Google Wallet?',
    answer: `Adding your pass to your mobile wallet:

For Apple Wallet (iPhone):
1. After claiming a discount, tap "Add to Apple Wallet"
2. Review the pass details and tap "Add"
3. Your pass will appear in the Wallet app

For Google Wallet (Android):
1. After claiming a discount, tap "Add to Google Wallet"
2. Review the pass details and tap "Save"
3. Your pass will appear in the Google Wallet app

Your QR code will automatically update each time you redeem a discount, making it easy to show at restaurants.`,
    tags: ['wallet', 'mobile', 'apple wallet', 'google wallet', 'pass'],
    priority: 8,
  },
  {
    id: 'employee-which-restaurants',
    audience: 'employee',
    category: 'discounts',
    question: 'Which restaurants offer discounts?',
    answer: `You can browse all participating restaurants in the Corbez app or website. We partner with hundreds of local restaurants across major cities.

Search and filter by:
- Cuisine type (Italian, Mexican, Asian, etc.)
- Discount percentage (10%, 15%, 20%+)
- Distance from you
- Price range
- Dietary preferences

New restaurants join every week, so check back regularly! You'll also receive notifications when restaurants near you join the platform.`,
    tags: ['restaurants', 'partners', 'discounts', 'browse'],
    priority: 9,
    relatedQuestions: ['employee-redeem-discount'],
  },
  {
    id: 'employee-redeem-discount',
    audience: 'employee',
    category: 'discounts',
    question: 'How do I redeem a discount at a restaurant?',
    answer: `Redeeming is easy:

1. Browse restaurants and select one with a discount
2. Add the discount to your wallet before visiting
3. Visit the restaurant and dine as usual
4. When paying, open your Corbez pass and show your QR code
5. The server scans your code and applies the discount
6. Pay the discounted amount

Important: Your QR code must be scanned before payment is processed. Discounts cannot be applied retroactively.`,
    tags: ['redeem', 'discount', 'qr code', 'payment'],
    priority: 10,
    relatedQuestions: ['employee-which-restaurants'],
  },
  {
    id: 'employee-company-not-listed',
    audience: 'employee',
    category: 'getting-started',
    question: 'What if my company isn\'t listed?',
    answer: `If your company isn't on Corbez yet:

1. You can request to add your company during signup
2. We'll reach out to your HR department to verify and onboard
3. In the meantime, ask your HR team to contact us at partners@corbez.com
4. Onboarding typically takes 2-3 business days

Want to speed things up? Share the link corbez.com/for-companies with your HR team. They can sign up directly and invite all employees at once.`,
    tags: ['company', 'onboarding', 'not listed', 'hr'],
    priority: 7,
  },
  {
    id: 'employee-refer-friends',
    audience: 'employee',
    category: 'general',
    question: 'Can I refer friends from other companies?',
    answer: `Yes! You can refer employees from other companies:

1. Share your unique referral link (found in your profile)
2. When they sign up and verify their company email, you both get a reward
3. Your reward: Priority access to new restaurant partnerships
4. Their reward: Same as above

Note: Referrals only count when the friend works at a different company and completes email verification.`,
    tags: ['referral', 'invite', 'rewards'],
    priority: 6,
  },
  {
    id: 'employee-change-jobs',
    audience: 'employee',
    category: 'general',
    question: 'What happens if I change jobs?',
    answer: `If you switch companies:

1. Your account remains active with your old company for 30 days
2. Update your email in account settings to your new company email
3. Verify your new email address
4. Your account will be linked to your new company
5. You'll see discounts from both companies during the transition

If your new company isn't on Corbez yet, you can request to add them during the email update process.`,
    tags: ['job change', 'account', 'transition'],
    priority: 5,
  },
  {
    id: 'employee-data-security',
    audience: 'employee',
    category: 'security',
    question: 'Is my personal data secure?',
    answer: `Your data security is our top priority:

- We use bank-level 256-bit encryption for all data
- We never share your personal information with restaurants without permission
- Restaurants only see your company name and discount eligibility when you redeem
- We're GDPR and CCPA compliant
- You can delete your account and all data at any time

We only collect: name, work email, and company affiliation. We don't track your purchase history or dining habits unless you opt-in to our rewards program.`,
    tags: ['security', 'privacy', 'data', 'gdpr', 'encryption'],
    priority: 8,
  },

  // ========================================
  // FOR MERCHANTS/RESTAURANTS (10 questions)
  // ========================================
  {
    id: 'merchant-pricing',
    audience: 'merchant',
    category: 'billing',
    question: 'How much does Corbez cost for restaurants?',
    answer: `Corbez pricing is simple and affordable:

Monthly Subscription: $99/month (billed monthly)
Annual Subscription: $999/year (save $189, 2 months free)

What's included:
- Unlimited discount redemptions
- No per-transaction fees
- Restaurant dashboard and analytics
- QR code verification system
- Marketing to corporate employees in your area
- Customer insights and trends

Plus: First 6 months free for new partners! No credit card required to start your trial.`,
    tags: ['pricing', 'cost', 'subscription', 'fees'],
    priority: 10,
    relatedQuestions: ['merchant-free-trial', 'merchant-transaction-fees'],
  },
  {
    id: 'merchant-free-trial',
    audience: 'merchant',
    category: 'billing',
    question: 'Is there really a 6-month free trial?',
    answer: `Yes! We offer a genuine 6-month free trial:

- Full access to all features
- No credit card required to start
- No transaction fees during trial
- Cancel anytime with no penalties
- After 6 months, choose to continue at $99/month or cancel

Why 6 months? We want you to see real results and build a loyal corporate customer base before paying anything. Most restaurants see a 40% increase in weekday lunch traffic within 3 months.`,
    tags: ['trial', 'free trial', 'no credit card'],
    priority: 10,
    relatedQuestions: ['merchant-pricing'],
  },
  {
    id: 'merchant-transaction-fees',
    audience: 'merchant',
    category: 'billing',
    question: 'Are there any per-transaction fees?',
    answer: `No! Unlike other platforms, Corbez charges zero transaction fees.

You pay a flat monthly subscription ($99/month) with unlimited redemptions. Whether you have 10 redemptions or 1,000 redemptions per month, your cost stays the same.

This means:
- Predictable monthly expenses
- No surprise fees at month-end
- More customers = more profit (not more fees)
- Keep 100% of your revenue after the discount

Compare this to delivery apps that charge 15-30% per order. With Corbez, you control the discount and keep the rest.`,
    tags: ['fees', 'transaction fees', 'pricing'],
    priority: 9,
    relatedQuestions: ['merchant-pricing'],
  },
  {
    id: 'merchant-verify-employee',
    audience: 'merchant',
    category: 'technical',
    question: 'How do I verify an employee\'s discount?',
    answer: `Verification is instant and easy:

1. Customer shows their Corbez QR code (in Apple/Google Wallet or app)
2. Scan the QR code with your phone camera or the Corbez merchant app
3. The system instantly verifies their employee status and company
4. Apply the discount shown on screen
5. Process payment as usual

The QR code contains encrypted employee verification data and expires after single use, preventing fraud. If the code doesn't scan, ask them to refresh it in the app.`,
    tags: ['verification', 'qr code', 'fraud prevention', 'scanning'],
    priority: 9,
    relatedQuestions: ['merchant-misuse'],
  },
  {
    id: 'merchant-different-discounts',
    audience: 'merchant',
    category: 'discounts',
    question: 'Can I set different discounts for different companies?',
    answer: `Yes! You have full flexibility:

- Set a default discount for all companies (e.g., 15% off)
- Create custom discounts for specific companies you want to target
- Offer higher discounts for larger companies or those near your location
- Set different discounts for lunch vs. dinner
- Create time-limited promotional discounts

Example: 10% for most companies, but 20% for a large tech company nearby to attract their employees during lunch rush.

All discount rules are managed in your merchant dashboard.`,
    tags: ['discounts', 'customization', 'pricing', 'flexibility'],
    priority: 7,
  },
  {
    id: 'merchant-attract-customers',
    audience: 'merchant',
    category: 'discounts',
    question: 'How do I attract more corporate customers?',
    answer: `Corbez helps you reach corporate employees:

1. Your restaurant appears in the app for all nearby corporate employees
2. Employees can filter by cuisine, distance, and discount level
3. We send targeted notifications when companies join near you
4. Higher discounts = higher ranking in search results
5. Featured placement for restaurants with 20%+ discounts

Tips to maximize traffic:
- Offer 15-20% discounts to rank higher
- Update your profile with great photos and menu highlights
- Run limited-time promotions (e.g., "20% off this week only")
- Respond to customer reviews in the app

Our data shows restaurants with 20% discounts get 3x more redemptions than those with 10%.`,
    tags: ['marketing', 'customers', 'growth', 'visibility'],
    priority: 8,
  },
  {
    id: 'merchant-misuse',
    audience: 'merchant',
    category: 'security',
    question: 'What if an employee tries to misuse their discount?',
    answer: `Corbez has built-in fraud prevention:

- QR codes are single-use and expire after redemption
- Codes are tied to verified corporate emails
- Each redemption is logged with timestamp and location
- You can report suspicious activity in the merchant dashboard
- We monitor for patterns like excessive redemptions

If you suspect fraud:
1. Don't apply the discount
2. Report it in the merchant app
3. We'll investigate within 24 hours
4. Repeat offenders are banned from the platform

In our 3+ years of operation, fraud represents less than 0.1% of transactions thanks to these protections.`,
    tags: ['fraud', 'security', 'misuse', 'protection'],
    priority: 7,
  },
  {
    id: 'merchant-pause-cancel',
    audience: 'merchant',
    category: 'billing',
    question: 'Can I pause or cancel my subscription?',
    answer: `Yes, you have full control:

Pause: Temporarily hide your restaurant from the app (e.g., during renovations)
- No charges while paused
- Reactivate anytime
- Customers can't redeem discounts while paused

Cancel: End your subscription entirely
- Cancel anytime, no penalties
- Subscription remains active until end of billing period
- Can rejoin later (new 6-month trial not available)

To pause or cancel: Go to Settings > Billing in your merchant dashboard, or contact support@corbez.com.`,
    tags: ['cancel', 'pause', 'subscription', 'billing'],
    priority: 6,
  },
  {
    id: 'merchant-payments',
    audience: 'merchant',
    category: 'billing',
    question: 'How do payments work?',
    answer: `Payments are straightforward:

1. You receive full payment from the customer (after discount)
2. Corbez bills you monthly for the subscription ($99/month)
3. Billing happens on the same day each month
4. We accept all major credit cards and ACH transfers
5. Automatic receipts and invoices for your records

Example: Customer's bill is $100, you offer 20% discount, customer pays you $80 directly. Later, Corbez bills you $99 for the monthly subscription (regardless of how many discounts were redeemed).

You never pay Corbez for individual transactions - just the flat monthly fee.`,
    tags: ['payments', 'billing', 'invoices'],
    priority: 8,
  },
  {
    id: 'merchant-refer-restaurants',
    audience: 'merchant',
    category: 'general',
    question: 'How can I refer other restaurants?',
    answer: `Earn rewards by referring other restaurants:

1. Get your unique referral link from the merchant dashboard
2. Share it with restaurant owner friends
3. When they sign up and complete 6 months, you both get 1 month free

There's no limit to referrals! Refer 12 restaurants = free subscription for a year.

Best practices:
- Share with non-competing restaurants (different cuisine types)
- Explain the 6-month free trial and zero transaction fees
- Show them your dashboard analytics to prove ROI

Your referral link: Available in Settings > Referrals`,
    tags: ['referral', 'rewards', 'invite'],
    priority: 5,
  },

  // ========================================
  // FOR COMPANIES (5 questions)
  // ========================================
  {
    id: 'company-join',
    audience: 'company',
    category: 'getting-started',
    question: 'How can my company join Corbez?',
    answer: `Getting your company on Corbez is simple:

1. Visit corbez.com/for-companies and fill out the signup form
2. Verify your company email (must be from a company domain)
3. We'll verify your company within 1 business day
4. Once approved, you can invite all employees
5. Employees sign up with their work emails and get instant access

Requirements:
- Company must have 10+ employees
- Must have a company email domain (not Gmail, Yahoo, etc.)
- HR or admin contact for verification

Onboarding takes 2-3 business days from start to finish.`,
    tags: ['onboarding', 'company signup', 'hr', 'verification'],
    priority: 10,
    relatedQuestions: ['company-cost', 'company-invite-employees'],
  },
  {
    id: 'company-cost',
    audience: 'company',
    category: 'billing',
    question: 'Do we pay anything as a company?',
    answer: `No! Corbez is 100% free for companies.

There are no fees for:
- Company onboarding
- Employee activations
- Discount redemptions
- Dashboard access
- Support

Why free? Companies benefit from happier employees who save money on meals. Restaurants pay a subscription to access corporate customers. This creates a win-win-win model where everyone benefits.

Your only "cost" is a few minutes to invite your employees and set up your company profile.`,
    tags: ['pricing', 'free', 'cost', 'fees'],
    priority: 10,
  },
  {
    id: 'company-invite-employees',
    audience: 'company',
    category: 'getting-started',
    question: 'How do we invite our employees?',
    answer: `You can invite employees in multiple ways:

Bulk Email Invite (Recommended):
1. Upload a CSV of employee emails in the company dashboard
2. We send them all an invite email with a unique signup link
3. They click, verify their email, and they're in

Individual Invites:
1. Share your company invite code with employees
2. They enter it during signup to link to your company

Auto-Discovery:
1. Employees sign up with their work email
2. We auto-detect your company from the email domain
3. No invite code needed

Best practice: Use bulk invite for fastest onboarding, then let auto-discovery handle new hires.`,
    tags: ['invite', 'employees', 'onboarding', 'csv'],
    priority: 9,
    relatedQuestions: ['company-join'],
  },
  {
    id: 'company-custom-discounts',
    audience: 'company',
    category: 'discounts',
    question: 'Can we customize discount tiers?',
    answer: `Currently, discount levels are set by individual restaurants, not companies. This ensures fair access for all corporate employees.

However, you can:
- See which restaurants offer the highest discounts in your company dashboard
- Request featured restaurant partnerships for your area
- Provide feedback on restaurants you'd like to see added

Coming soon: We're developing a premium tier where companies can negotiate exclusive discounts for their employees at select restaurants. Contact partnerships@corbez.com to learn more or get early access.`,
    tags: ['discounts', 'customization', 'tiers'],
    priority: 6,
  },
  {
    id: 'company-track-engagement',
    audience: 'company',
    category: 'general',
    question: 'How do we track employee engagement?',
    answer: `Your company dashboard shows aggregated analytics:

Metrics available:
- Number of employees signed up
- Percentage of employees active monthly
- Total discounts redeemed company-wide
- Estimated total savings for all employees
- Most popular restaurants among employees
- Peak redemption times and days

Privacy: All data is anonymized. You can't see individual employee activity - only company-wide trends.

Use these insights to:
- Measure ROI of the employee benefit
- Share success stories internally
- Identify opportunities for team lunches

Export reports monthly for HR records or quarterly business reviews.`,
    tags: ['analytics', 'engagement', 'metrics', 'dashboard'],
    priority: 7,
  },

  // ========================================
  // GENERAL (5 questions)
  // ========================================
  {
    id: 'general-business-model',
    audience: 'all',
    category: 'general',
    question: 'How does Corbez make money?',
    answer: `Corbez has a transparent business model:

Revenue: Restaurants pay a monthly subscription ($99/month) to access corporate customers through our platform.

Free for:
- Employees (100% free forever)
- Companies (100% free forever)

Costs covered by restaurant subscriptions:
- Platform development and maintenance
- Customer support
- Marketing to corporate employees
- Payment processing

Why this works:
- Restaurants get high-value corporate customers
- Employees save money on meals
- Companies offer a valuable benefit at zero cost

No ads, no data selling, no hidden fees.`,
    tags: ['business model', 'revenue', 'pricing', 'how it works'],
    priority: 9,
  },
  {
    id: 'general-different',
    audience: 'all',
    category: 'general',
    question: 'What makes Corbez different from other discount programs?',
    answer: `Corbez is unique in several ways:

1. Corporate-focused: Discounts are tied to your employer, not generic coupons
2. Zero cost for employees: Unlike competitor apps that charge membership fees
3. No transaction fees for restaurants: Flat subscription vs. 15-30% per order
4. Quality over quantity: We curate local restaurants, not fast food chains
5. Privacy-first: We don't track or sell your dining data
6. Direct payment: You pay restaurants directly, not through our app
7. Sustainable: Restaurants choose to participate and set their own discounts

We're not a delivery app, a coupon clipper, or a daily deals site. We're a corporate benefits platform that connects great local restaurants with employees who dine out regularly.`,
    tags: ['comparison', 'unique', 'benefits', 'difference'],
    priority: 8,
  },
  {
    id: 'general-support',
    audience: 'all',
    category: 'general',
    question: 'How do I contact support?',
    answer: `We're here to help!

Email Support (Fastest):
- Employees: support@corbez.com
- Restaurants: merchants@corbez.com
- Companies: partners@corbez.com
- Response time: Within 24 hours (usually faster)

Live Chat:
- Available in the app Mon-Fri, 9am-6pm PST
- Instant responses during business hours

Phone Support (Premium partners only):
- Restaurants on annual plans get a dedicated account manager
- Call 1-800-CORBEZ1 (1-800-267-2391)

Self-Service:
- Browse this FAQ
- Check out our Help Center at corbez.com/help
- Watch tutorial videos in the app

For urgent issues (account locked, payment problems), email support@corbez.com with "URGENT" in the subject line.`,
    tags: ['support', 'contact', 'help', 'customer service'],
    priority: 10,
  },
  {
    id: 'general-cities',
    audience: 'all',
    category: 'general',
    question: 'What cities/regions do you serve?',
    answer: `Corbez is currently available in major metro areas:

Fully Launched:
- San Francisco Bay Area
- New York City
- Los Angeles
- Chicago
- Seattle
- Austin
- Boston
- Washington DC

Coming Soon (Q1 2026):
- Denver
- Portland
- San Diego
- Miami

Expanding to 20+ cities by end of 2026.

Not in your city? Request expansion:
1. Visit corbez.com/request-city
2. Enter your city and company
3. We'll notify you when we launch there

Cities are prioritized based on:
- Number of requests from employees and companies
- Restaurant density and variety
- Corporate office concentration`,
    tags: ['cities', 'locations', 'availability', 'expansion'],
    priority: 7,
  },
  {
    id: 'general-suggest-feature',
    audience: 'all',
    category: 'general',
    question: 'Can I suggest a feature or restaurant?',
    answer: `Absolutely! We love hearing from our community.

Suggest a Restaurant:
- Use the "Suggest a Restaurant" button in the app
- Or email merchants@corbez.com with restaurant details
- We'll reach out to them about joining

Suggest a Feature:
- Email feedback@corbez.com with your idea
- Or use the feedback form in the app Settings
- Upvote existing suggestions in our public roadmap at roadmap.corbez.com

Most requested features we've shipped:
- Apple Wallet / Google Wallet integration (launched 2024)
- Dietary filter for restaurants (launched 2024)
- Company analytics dashboard (launched 2025)

Your feedback shapes our product roadmap. We review all suggestions monthly and implement the most popular ones.`,
    tags: ['feedback', 'suggestions', 'feature request', 'roadmap'],
    priority: 6,
  },
]

// Helper functions to filter FAQs
export const getFAQsByAudience = (audience: FAQAudience) => {
  if (audience === 'all') return faqData
  return faqData.filter(faq => faq.audience === audience || faq.audience === 'all')
}

export const getFAQsByCategory = (category: FAQCategory) => {
  return faqData.filter(faq => faq.category === category)
}

export const searchFAQs = (query: string) => {
  const lowerQuery = query.toLowerCase()
  return faqData.filter(faq =>
    faq.question.toLowerCase().includes(lowerQuery) ||
    faq.answer.toLowerCase().includes(lowerQuery) ||
    faq.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
  )
}
