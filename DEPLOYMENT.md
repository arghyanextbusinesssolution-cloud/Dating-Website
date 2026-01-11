# Deployment Guide - Spiritual Unity Match

This guide will help you deploy Spiritual Unity Match to Render.

## Prerequisites

1. GitHub account
2. Render account (sign up at https://render.com)
3. MongoDB Atlas account
4. Stripe account
5. Cloudinary account

## Step-by-Step Deployment

### 1. Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit - Spiritual Unity Match"
git remote add origin https://github.com/arghyanextbusinesssolution-cloud/Dating-Website.git
git branch -M main
git push -u origin main
```

### 2. Deploy Backend

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `arghyanextbusinesssolution-cloud/Dating-Website`
4. Configure:
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
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=generate_a_strong_random_string_min_32_chars
   JWT_EXPIRE=7d
   STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   FRONTEND_URL=https://spiritualunitymatch-frontend.onrender.com
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   AUTO_APPROVE_PROFILES=true
   ```

6. Click "Create Web Service"
7. Wait for deployment (5-10 minutes)
8. Note your backend URL: `https://spiritualunitymatch-backend.onrender.com`

### 3. Deploy Frontend

1. In Render Dashboard, click "New +" → "Web Service"
2. Connect the same GitHub repository
3. Configure:
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
6. Wait for deployment (10-15 minutes)
7. Note your frontend URL: `https://spiritualunitymatch-frontend.onrender.com`

### 4. Update Backend FRONTEND_URL

1. Go to backend service → Environment
2. Update `FRONTEND_URL` to your frontend Render URL
3. Save (will trigger redeploy)

### 5. Configure Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://spiritualunitymatch-backend.onrender.com/api/subscriptions/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy webhook signing secret
5. Update `STRIPE_WEBHOOK_SECRET` in backend environment variables

### 6. Seed Admin User

1. Go to backend service → Shell
2. Run:
```bash
npm run seed:admin
```

Admin credentials:
- Email: `admin@platform.com`
- Password: `Admin@12345`

### 7. Test Deployment

1. Visit your frontend URL
2. Register a new account
3. Complete profile setup
4. Test features:
   - Daily check-in
   - Browse matches
   - Send messages
   - Soul score

## Troubleshooting

### Backend won't start
- Check environment variables are set correctly
- Verify MongoDB connection string
- Check logs in Render dashboard

### Frontend build fails
- Ensure `NEXT_PUBLIC_API_URL` is set correctly
- Check Node.js version (should be 18+)
- Review build logs

### CORS errors
- Verify `FRONTEND_URL` in backend matches frontend URL
- Check CORS configuration in `backend/server.js`

### Database connection issues
- Verify MongoDB Atlas IP whitelist includes Render IPs (0.0.0.0/0 for all)
- Check MongoDB connection string format

## Custom Domain (Optional)

1. In Render service settings → Custom Domain
2. Add your domain
3. Update DNS records as instructed
4. Update `FRONTEND_URL` in backend if using custom domain

## Monitoring

- View logs in Render dashboard
- Set up uptime monitoring
- Monitor error rates
- Track API response times

## Cost Estimate

- Backend: $7/month (Starter plan)
- Frontend: $7/month (Starter plan)
- Total: ~$14/month

For production with higher traffic, consider upgrading to Standard plan ($25/month each).
