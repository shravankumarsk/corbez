# Apple Wallet Certificate Setup

To enable Apple Wallet pass generation, you need to set up certificates from your Apple Developer account.

## Prerequisites

1. **Apple Developer Account** ($99/year) - [developer.apple.com](https://developer.apple.com)
2. Access to Certificates, Identifiers & Profiles

## Step 1: Create Pass Type ID

1. Go to [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/identifiers/list/passTypeId)
2. Click **+** to register a new identifier
3. Select **Pass Type IDs** and click Continue
4. Enter a description (e.g., "Corbe Employee Pass")
5. Enter identifier: `pass.com.corbe.employee` (or your domain)
6. Click Continue, then Register

## Step 2: Create Certificate

1. Go to [Certificates](https://developer.apple.com/account/resources/certificates/list)
2. Click **+** to create a new certificate
3. Select **Pass Type ID Certificate** under Services
4. Select your Pass Type ID created above
5. Follow instructions to create CSR (Certificate Signing Request) using Keychain Access
6. Upload CSR and download the certificate (.cer file)

## Step 3: Export Certificates

### From Keychain Access (macOS):

1. Double-click the downloaded .cer file to install it
2. Open Keychain Access
3. Find your certificate (filter by "Pass Type ID")
4. Right-click and select "Export"
5. Save as .p12 file with a password

### Convert to PEM format:

```bash
# Extract certificate
openssl pkcs12 -in certificate.p12 -clcerts -nokeys -out signerCert.pem

# Extract private key
openssl pkcs12 -in certificate.p12 -nocerts -out signerKey.pem

# Download Apple WWDR Certificate
curl -o wwdr.pem https://www.apple.com/certificateauthority/AppleWWDRCAG4.cer
openssl x509 -inform der -in wwdr.pem -out wwdr.pem
```

## Step 4: Place Certificates

Place these files in the `/certificates` folder:

```
certificates/
├── signerCert.pem    # Your Pass Type ID certificate
├── signerKey.pem     # Your private key
└── wwdr.pem          # Apple WWDR certificate
```

## Step 5: Configure Environment Variables

Add to your `.env.local`:

```env
# Apple Wallet Configuration
APPLE_PASS_TYPE_ID=pass.com.corbe.employee
APPLE_TEAM_ID=YOUR_TEAM_ID
APPLE_SIGNER_KEY_PASSPHRASE=your_passphrase
APPLE_CERTIFICATES_PATH=/path/to/certificates
```

Find your Team ID in [Membership](https://developer.apple.com/account/#!/membership)

## Testing

After setup, restart your development server and try adding a pass from the wallet page.

## Troubleshooting

- **"Certificates not configured"**: Check that all 3 PEM files exist
- **"Invalid signature"**: Ensure certificate matches Pass Type ID
- **"Pass cannot be read"**: Check PEM file format and passphrase

## Security Notes

- **Never commit certificates to git** - they're in .gitignore
- Keep your private key passphrase secure
- Rotate certificates before expiration (1 year)
