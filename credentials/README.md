# Google Wallet Setup Guide

To enable Google Wallet pass generation, you need to set up a Google Cloud project with the Wallet API.

## Prerequisites

1. **Google Cloud Account** - [console.cloud.google.com](https://console.cloud.google.com)
2. A verified business domain (for production)

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **Select a project** > **New Project**
3. Name it (e.g., "Corbe Wallet")
4. Click **Create**

## Step 2: Enable Google Wallet API

1. Go to [APIs & Services > Library](https://console.cloud.google.com/apis/library)
2. Search for "Google Wallet API"
3. Click **Enable**

## Step 3: Request Issuer Account

1. Go to [Google Pay & Wallet Console](https://pay.google.com/business/console)
2. Sign in with your Google account
3. Click **Google Wallet API** in the sidebar
4. Click **Request access** to become an issuer
5. Fill in your business details
6. Wait for approval (usually 1-3 business days)

After approval, you'll receive an **Issuer ID** (looks like: `3388000000012345678`)

## Step 4: Create Service Account

1. Go to [IAM & Admin > Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Click **Create Service Account**
3. Name it (e.g., "wallet-service")
4. Click **Create and Continue**
5. Skip optional role steps
6. Click **Done**

## Step 5: Generate Key File

1. Click on your new service account
2. Go to **Keys** tab
3. Click **Add Key** > **Create new key**
4. Select **JSON** format
5. Click **Create** - a JSON file will download
6. Rename it to `google-wallet-key.json`

## Step 6: Grant Wallet Access

1. Go to [Google Pay & Wallet Console](https://pay.google.com/business/console)
2. Click **Google Wallet API** > **Manage**
3. Under **Service accounts**, add the email from your service account
   (looks like: `wallet-service@project-id.iam.gserviceaccount.com`)
4. Grant **Writer** access

## Step 7: Place Credentials

Place the JSON file in the `/credentials` folder:

```
credentials/
└── google-wallet-key.json
```

## Step 8: Configure Environment Variables

Add to your `.env.local`:

```env
# Google Wallet Configuration
GOOGLE_WALLET_ISSUER_ID=3388000000012345678
GOOGLE_WALLET_CREDENTIALS_PATH=/path/to/credentials/google-wallet-key.json
```

## Testing

After setup, restart your development server and try adding a pass from the wallet page.

## Troubleshooting

- **"Not configured"**: Check that ISSUER_ID is set and key file exists
- **"Failed to generate URL"**: Verify service account has Wallet API access
- **"Invalid JWT"**: Check that the private key in JSON file is valid

## Security Notes

- **Never commit the JSON key file to git** - it's in .gitignore
- Rotate service account keys periodically
- Limit service account permissions to wallet operations only

## Pass Preview

When Google Wallet is not configured, users see a preview of what the pass will look like.
The actual pass includes:
- Employee name
- Company name
- Verification status
- QR code linking to verification page
