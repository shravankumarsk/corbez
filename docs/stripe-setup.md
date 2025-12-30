# Stripe Payment Setup Guide

This guide explains how to set up Stripe for restaurant subscriptions ($9/month with 30-day free trial).

## Prerequisites

1. **Stripe Account** - [stripe.com](https://stripe.com)
2. Stripe Dashboard access

## Step 1: Get API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click **Developers** in the sidebar
3. Click **API Keys**
4. Copy your **Secret Key** (starts with `sk_test_` or `sk_live_`)
5. Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)

## Step 2: Create Product and Price

1. Go to **Products** in Stripe Dashboard
2. Click **Add Product**
3. Fill in:
   - Name: "Corbe Restaurant Subscription"
   - Description: "Monthly subscription for restaurant verification access"
4. Under **Pricing**:
   - Pricing model: Standard pricing
   - Price: $9.00
   - Billing period: Monthly
   - Check "Include free trial" → 30 days
5. Click **Save product**
6. Copy the **Price ID** (starts with `price_`)

## Step 3: Configure Webhook

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)

## Step 4: Configure Customer Portal

1. Go to **Settings** → **Billing** → **Customer portal**
2. Enable the portal
3. Configure allowed actions:
   - View invoices
   - Update payment methods
   - Cancel subscriptions
4. Save changes

## Step 5: Environment Variables

Add these to your `.env.local`:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Step 6: Test Locally

For local development, use the Stripe CLI:

```bash
# Install Stripe CLI (macOS)
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

The CLI will give you a webhook signing secret for local testing.

## Testing

Use these test card numbers:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Require auth**: 4000 0025 0000 3155

Any future expiration date and any 3-digit CVC will work.

## Subscription Flow

1. **Restaurant signs up** → Account created with `subscriptionStatus: NONE`
2. **Clicks "Start Free Trial"** → Redirected to Stripe Checkout
3. **Enters payment info** → 30-day trial starts
4. **Webhook received** → `subscriptionStatus` updated to `TRIALING`
5. **After 30 days** → Card charged, status becomes `ACTIVE`
6. **If payment fails** → Status becomes `PAST_DUE`

## Managing Subscriptions

- Restaurants can manage their subscription via the **Billing Portal**
- They can update payment methods, view invoices, or cancel
- Cancellation takes effect at end of billing period

## Production Checklist

- [ ] Switch to live API keys (`sk_live_`, `pk_live_`)
- [ ] Create live product/price in Stripe
- [ ] Update webhook endpoint URL to production domain
- [ ] Update webhook secret for production endpoint
- [ ] Test complete flow with real card (refund after)
