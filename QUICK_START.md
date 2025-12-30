# Corbe Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

We recommend using `pnpm` for faster installations:

```bash
cd ~/Desktop/corbe

# Option A: Using pnpm (recommended)
pnpm install

# Option B: Using npm
npm install --legacy-peer-deps
```

### Step 2: Set Up Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and update with your values:

```env
# MongoDB Atlas (Required)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/corbe

# NextAuth (Generate with: openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-here

# Optional: Email Service (Get free key at resend.com)
RESEND_API_KEY=re_your_key_here
RESEND_FROM_EMAIL=noreply@corbez.com
```

### Step 3: Start Development Server

```bash
npm run dev
# or
pnpm dev
```

The server starts at **http://localhost:3000**

### Step 4: Test the Application

1. **Visit Homepage**: http://localhost:3000
2. **Register Account**:
   - Go to http://localhost:3000/register
   - Fill in: Email, Password, First Name, Last Name, Role
   - Click "Create Account"
3. **Login**:
   - Go to http://localhost:3000/login
   - Use your registered email and password
   - Click "Sign In"

---

## 📋 Test Credentials

Use these test accounts:

### Employee Account
- Email: `employee@test.com`
- Password: `TestPassword123!`
- Role: `Employee`

### Merchant Account
- Email: `merchant@test.com`
- Password: `MerchantPass123!`
- Role: `Merchant`

### Company Admin
- Email: `admin@company.com`
- Password: `AdminPass123!`
- Role: `Company Admin`

---

## 🔗 Key URLs

| Page | URL | Description |
|------|-----|-------------|
| Home | http://localhost:3000 | Landing page |
| Login | http://localhost:3000/login | Sign in |
| Register | http://localhost:3000/register | Create account |
| API Health | http://localhost:3000/api/auth/signin | Auth API test |

---

## 📚 Development Commands

```bash
# Start development server
npm run dev
pnpm dev

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Watch tests
npm test:watch
```

---

## 🔧 Environment Variables Explained

### Required
- **MONGODB_URI**: Your MongoDB connection string (get from MongoDB Atlas)
- **NEXTAUTH_URL**: Your app URL (http://localhost:3000 for dev)
- **NEXTAUTH_SECRET**: Random secret for JWT (run `openssl rand -base64 32`)

### Optional (for email)
- **RESEND_API_KEY**: Email API key from resend.com
- **RESEND_FROM_EMAIL**: Sender email address

### Optional (for images)
- **NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME**: Cloudinary account
- **CLOUDINARY_API_KEY**: Cloudinary API key
- **CLOUDINARY_API_SECRET**: Cloudinary API secret

---

## 📊 Project Structure

```
corbe/
├── src/
│   ├── app/              # Next.js pages and routes
│   ├── components/       # React components
│   ├── lib/
│   │   ├── db/          # Database models
│   │   ├── auth/        # Authentication
│   │   ├── actions/     # Server actions
│   │   └── validations/ # Form validation
│   ├── types/           # TypeScript types
│   └── middleware.ts    # Route protection
├── public/              # Static assets
├── .env.example         # Environment template
└── package.json         # Dependencies
```

---

## 🐛 Troubleshooting

### npm install fails with EACCES error

```bash
# Try pnpm instead
npm install -g pnpm
pnpm install

# Or use npm with legacy-peer-deps
npm install --legacy-peer-deps
```

### "next: command not found"

Make sure dependencies are installed:
```bash
npm install
# or
pnpm install
```

### "Cannot connect to MongoDB"

1. Check MONGODB_URI in `.env.local`
2. Ensure IP is whitelisted in MongoDB Atlas
3. Verify database user password
4. Test connection string in MongoDB Compass

### "NEXTAUTH_SECRET not set"

Generate and add to `.env.local`:
```bash
openssl rand -base64 32
```

Then add to `.env.local`:
```env
NEXTAUTH_SECRET=your-generated-secret
```

### Port 3000 already in use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

---

## ✅ Validation Checklist

After setup, verify:

- [ ] Dependencies installed (`node_modules` exists)
- [ ] `.env.local` created with MongoDB URI
- [ ] `npm run dev` starts without errors
- [ ] http://localhost:3000 loads homepage
- [ ] Can navigate to /login and /register
- [ ] Can create new account
- [ ] Can login with created account
- [ ] Dashboard shows based on user role

---

## 🔐 Security Notes

- **Never commit `.env.local`** - it contains secrets
- **Never share `NEXTAUTH_SECRET`**
- **Passwords are hashed** with bcrypt before storage
- **Sessions use JWT** tokens (not server-side sessions)
- **HTTPS required** in production

---

## 📞 Need Help?

See detailed documentation:
- **SETUP.md** - Detailed setup guide
- **README.md** - Project overview
- **IMPLEMENTATION_STATUS.md** - Current implementation status

---

## 🎯 Next Steps

1. **Complete setup** (this file)
2. **Set up MongoDB Atlas** (get free cluster)
3. **Test authentication** (register and login)
4. **Explore code** (src/ directory)
5. **Begin development** (Week 2 features)

---

**Happy coding! 🚀**

For questions or issues, refer to the documentation files or check the implementation plan.
