# Spiritual Unity Match

A production-ready spiritual dating platform built with Next.js, Express.js, and MongoDB. The platform prioritizes depth, intent, and spiritual alignment over superficial connections.

## 🎯 Platform Philosophy

**"Find alignment before attraction."**

The system prioritizes:
- Depth over surface-level connections
- Intent and purpose alignment
- Conscious relationships
- Spiritual alignment
- Long-term retention

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript** (.tsx only)
- **Tailwind CSS** (pre-configured)
- **Framer Motion** for animations
- **Stripe** for payments
- Fully responsive (desktop, tablet, mobile)
- Deployed on Render

### Backend
- **Node.js**
- **Express.js**
- **MongoDB Atlas** (with provided connection string)
- **JWT** authentication
- **Stripe Webhooks**
- **Socket.IO** for real-time messaging
- Hosted on Render

## 📋 Features

### Membership Plans
- **Basic**: Create profile, limited browsing, restricted messaging
- **Standard**: Unlimited browsing, messaging, see who liked you
- **Premium**: Priority placement, advanced filters, unlimited everything

### Core Features
1. **User Registration & Profile Setup**
   - Email + password authentication
   - Comprehensive profile fields (spiritual beliefs, practices, intentions)
   - Profile approval system
   - Photo upload with Cloudinary

2. **Matching System**
   - Rule-based + weighted scoring algorithm
   - Considers: age, gender preference, distance, spiritual practices, relationship intent, lifestyle, activity level
   - Match labels: "Aligned in Purpose", "Aligned in Spiritual Rhythm"
   - Reject functionality with 7-day blocking

3. **Messaging System**
   - Plan-based restrictions
   - Real-time messaging with Socket.IO
   - Guided first messages
   - Voice notes support
   - Daily message limits (plan-based)

4. **Soul Features**
   - Daily Check-In (emotion, need, energy tracking)
   - Soul Score calculation
   - Check-in calendar with history
   - Spiritual Readiness Path (guided questions)
   - Soul-Based Matching
   - Connection Rituals (7-day journey)
   - Intent Badges
   - Journal entries

5. **Admin Dashboard**
   - View all users
   - Delete/suspend users
   - View statistics
   - Approve/reject profiles
   - Manage subscriptions

## 🚀 Deployment on Render

### Prerequisites
- GitHub account
- Render account (https://render.com)
- MongoDB Atlas account
- Stripe account (for payments)
- Cloudinary account (for image uploads)

### Step 1: Push to GitHub

1. Initialize git repository (if not already done):
```bash
git init
git add .
git commit -m "Initial commit - Spiritual Unity Match"
```

2. Add remote and push:
```bash
git remote add origin https://github.com/arghyanextbusinesssolution-cloud/Dating-Website.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy Backend on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `spiritualunitymatch-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Starter ($7/month)

5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key_min_32_chars
   JWT_EXPIRE=7d
   STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   FRONTEND_URL=https://your-frontend-url.onrender.com
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   AUTO_APPROVE_PROFILES=true
   ```

6. Click "Create Web Service"
7. Note the backend URL (e.g., `https://spiritualunitymatch-backend.onrender.com`)

### Step 3: Deploy Frontend on Render

1. In Render Dashboard, click "New +" → "Web Service"
2. Connect the same GitHub repository
3. Configure the service:
   - **Name**: `spiritualunitymatch-frontend`
   - **Root Directory**: `frontend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Starter ($7/month)

4. Add Environment Variables:
   ```
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://spiritualunitymatch-backend.onrender.com/api
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
   ```

5. Click "Create Web Service"
6. Note the frontend URL (e.g., `https://spiritualunitymatch-frontend.onrender.com`)

### Step 4: Update Backend Environment Variables

1. Go back to backend service settings
2. Update `FRONTEND_URL` to your frontend Render URL
3. Save changes (this will trigger a redeploy)

### Step 5: Configure Stripe Webhook

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://spiritualunitymatch-backend.onrender.com/api/subscriptions/webhook`
3. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy the webhook secret and update `STRIPE_WEBHOOK_SECRET` in backend environment variables

### Step 6: Seed Admin User

1. In Render backend service, go to "Shell" tab
2. Run:
```bash
npm run seed:admin
```

Admin credentials:
- Email: `admin@platform.com`
- Password: `Admin@12345`

## 🏗️ Local Development

### Installation

1. **Install dependencies**
```bash
npm run install:all
```

2. **Set up environment variables**

Backend (create `backend/.env`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://arghyanextbusinesssolution_db_user:HIoHvpDclQ9ei0NO@cluster0.ulsxizj.mongodb.net/?appName=Cluster0
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRE=7d
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
FRONTEND_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
AUTO_APPROVE_PROFILES=true
```

Frontend (create `frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

3. **Seed admin user**
```bash
cd backend
npm run seed:admin
```

4. **Start development servers**
```bash
# From root directory
npm run dev
```

This will start:
- Backend on `http://localhost:5000`
- Frontend on `http://localhost:3000`

## 📁 Project Structure

```
spiritualunitymatch/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── middleware/     # Auth & subscription middleware
│   ├── services/       # Business logic (matching algorithm)
│   ├── scripts/         # Utility scripts (seed admin)
│   ├── server.js        # Express server
│   └── render.yaml      # Render deployment config
├── frontend/
│   ├── app/             # Next.js app directory
│   ├── contexts/        # React contexts (Auth, Socket)
│   ├── lib/             # Utilities (API client)
│   ├── components/      # Reusable components
│   └── render.yaml      # Render deployment config
├── package.json         # Root package.json
├── render.yaml          # Combined Render config
└── README.md
```

## 🔐 Authentication Flow

1. User registers → JWT token created
2. Token stored in HTTP-only cookie
3. Protected routes check token via middleware
4. Subscription status checked for feature access

## 💳 Payment Flow

1. User selects plan → Redirected to signup if not logged in
2. If logged in → Redirected to checkout
3. Stripe Checkout session created
4. Payment completes → Webhook triggers:
   - Plan activated
   - Permissions updated
   - Features unlocked
   - Confirmation email sent

## 🎨 Design System

- **Color Palette**: Violet + Blue spiritual theme
- **Typography**: Inter font family
- **Animations**: Framer Motion for smooth transitions
- **Responsive**: Mobile-first approach

## 📊 Database Schemas

All schemas are production-ready with proper indexing:
- User
- Profile
- Subscription
- Payment
- Match
- Message
- Notification
- Community
- Admin
- Engagement
- SpiritualResponse
- SoulCheckIn
- SoulJournal
- SoulReadiness
- ConnectionRitual
- RejectedUser

## 🔒 Security Features

- JWT authentication
- Password hashing (bcrypt)
- CORS configuration
- Input validation
- Profile approval system
- User blocking/reporting (7-day reject system)
- Content moderation ready
- Environment variable protection

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Profiles
- `POST /api/profiles` - Create/update profile
- `GET /api/profiles/me` - Get own profile
- `GET /api/profiles/:userId` - Get user profile
- `GET /api/profiles/browse` - Browse profiles

### Subscriptions
- `POST /api/subscriptions/create-checkout` - Create Stripe checkout
- `POST /api/subscriptions/webhook` - Stripe webhook handler
- `GET /api/subscriptions/my-subscription` - Get user subscription

### Matches
- `POST /api/matches/like/:userId` - Like a user
- `POST /api/matches/reject/:userId` - Reject a user (7-day block)
- `GET /api/matches/suggested` - Get suggested matches
- `GET /api/matches/my-matches` - Get user's matches
- `GET /api/matches/likes` - Get users who liked you

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/conversation/:userId` - Get conversation
- `GET /api/messages/conversations` - Get all conversations

### Soul
- `POST /api/soul/check-in` - Create daily check-in
- `GET /api/soul/check-in` - Get today's check-in
- `GET /api/soul/check-in/history` - Get check-in history
- `GET /api/soul/score` - Get soul score
- `POST /api/soul/journal` - Create journal entry
- `GET /api/soul/journal` - Get journal entries

### Admin
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/users` - Get all users
- `DELETE /api/admin/users/:userId` - Delete user
- `POST /api/admin/users/:userId/suspend` - Suspend user

## 🚧 Production Checklist

- [x] Update all project names to "spiritualunitymatch"
- [x] Create Render deployment configurations
- [x] Update environment variable examples
- [x] Add health check endpoint
- [ ] Set up Stripe products and prices
- [ ] Configure Cloudinary for image uploads
- [ ] Set up MongoDB Atlas database
- [ ] Deploy backend to Render
- [ ] Deploy frontend to Render
- [ ] Configure Stripe webhook
- [ ] Seed admin user
- [ ] Test all features in production
- [ ] Set up monitoring and logging
- [ ] Configure custom domain (optional)

## 📄 License

Proprietary - All rights reserved

## 👥 Support

For issues or questions, please contact the development team.

## 🔗 Repository

GitHub: https://github.com/arghyanextbusinesssolution-cloud/Dating-Website.git
