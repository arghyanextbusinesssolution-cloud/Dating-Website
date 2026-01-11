# Render Deployment Guide - Spiritual Unity Match

Complete step-by-step guide to deploy Spiritual Unity Match on Render.

## Quick Start

1. **Push to GitHub**
2. **Deploy Backend** (5-10 minutes)
3. **Deploy Frontend** (10-15 minutes)
4. **Configure Stripe Webhook**
5. **Seed Admin User**

## Detailed Steps

### 1. Push Code to GitHub

```bash
# Initialize git (if not done)
git init
git add .
git commit -m "Initial commit - Spiritual Unity Match production ready"

# Add remote
git remote add origin https://github.com/arghyanextbusinesssolution-cloud/Dating-Website.git
git branch -M main
git push -u origin main
```

### 2. Deploy Backend Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repository: `arghyanextbusinesssolution-cloud/Dating-Website`
4. Configure:
   - **Name**: `spiritualunitymatch-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Starter ($7/month) or Free (with limitations)

5. **Environment Variables** (click "Advanced" → "Add Environment Variable"):
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=generate_strong_random_string_min_32_chars
   JWT_EXPIRE=7d
   STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   FRONTEND_URL=https://spiritualunitymatch-frontend.onrender.com
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   AUTO_APPROVE_PROFILES=true
   ```

6. Click **"Create Web Service"**
7. Wait for deployment (5-10 minutes)
8. **Copy your backend URL**: `https://spiritualunitymatch-backend.onrender.com`

### 3. Deploy Frontend Service

1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect the same GitHub repository
3. Configure:
   - **Name**: `spiritualunitymatch-frontend`
   - **Root Directory**: `frontend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Starter ($7/month) or Free

4. **Environment Variables**:
   ```
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://spiritualunitymatch-backend.onrender.com/api
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
   ```

5. Click **"Create Web Service"**
6. Wait for deployment (10-15 minutes)
7. **Copy your frontend URL**: `https://spiritualunitymatch-frontend.onrender.com`

### 4. Update Backend FRONTEND_URL

1. Go to backend service → **"Environment"** tab
2. Update `FRONTEND_URL` to: `https://spiritualunitymatch-frontend.onrender.com`
3. Click **"Save Changes"** (triggers redeploy)

### 5. Configure Stripe Webhook

1. Go to https://dashboard.stripe.com → **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. Endpoint URL: `https://spiritualunitymatch-backend.onrender.com/api/subscriptions/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Update `STRIPE_WEBHOOK_SECRET` in backend environment variables

### 6. Seed Admin User

1. Go to backend service → **"Shell"** tab
2. Run:
```bash
npm run seed:admin
```

**Admin Credentials:**
- Email: `admin@platform.com`
- Password: `Admin@12345`

### 7. Test Your Deployment

1. Visit: `https://spiritualunitymatch-frontend.onrender.com`
2. Register a new account
3. Complete profile setup
4. Test features:
   - ✅ Daily check-in
   - ✅ Browse matches
   - ✅ View profiles
   - ✅ Send messages
   - ✅ Soul score

## Environment Variables Reference

### Backend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `10000` |
| `MONGODB_URI` | MongoDB connection | `mongodb+srv://...` |
| `JWT_SECRET` | JWT signing key | `min_32_characters_long` |
| `JWT_EXPIRE` | Token expiration | `7d` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Webhook secret | `whsec_...` |
| `FRONTEND_URL` | Frontend URL | `https://...onrender.com` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary name | `your-name` |
| `CLOUDINARY_API_KEY` | Cloudinary key | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary secret | `secret_key` |
| `AUTO_APPROVE_PROFILES` | Auto-approve | `true` or `false` |

### Frontend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://...onrender.com/api` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_live_...` |

## Troubleshooting

### Backend Issues

**Build fails:**
- Check Node.js version (should be 18+)
- Verify all dependencies in `package.json`
- Check build logs for specific errors

**Server won't start:**
- Verify all environment variables are set
- Check MongoDB connection string
- Ensure PORT is set to 10000 (Render default)

**Database connection errors:**
- Verify MongoDB Atlas IP whitelist includes Render IPs
- Use `0.0.0.0/0` in MongoDB Atlas Network Access for all IPs
- Check connection string format

### Frontend Issues

**Build fails:**
- Ensure `NEXT_PUBLIC_API_URL` is set correctly
- Check for TypeScript errors
- Verify all dependencies installed

**API calls fail:**
- Verify `NEXT_PUBLIC_API_URL` points to backend
- Check CORS settings in backend
- Ensure backend is running

**CORS errors:**
- Update `FRONTEND_URL` in backend to match frontend URL
- Check CORS configuration in `backend/server.js`

### General Issues

**Services keep restarting:**
- Check logs for errors
- Verify environment variables
- Check resource limits (upgrade plan if needed)

**Slow performance:**
- Consider upgrading to Standard plan ($25/month)
- Optimize database queries
- Enable caching

## Cost Estimate

### Free Tier (Limited)
- Backend: Free (spins down after 15 min inactivity)
- Frontend: Free (spins down after 15 min inactivity)
- **Total: $0/month** (with limitations)

### Starter Plan (Recommended)
- Backend: $7/month
- Frontend: $7/month
- **Total: $14/month**

### Standard Plan (Production)
- Backend: $25/month
- Frontend: $25/month
- **Total: $50/month**

## Custom Domain (Optional)

1. In Render service → **Settings** → **Custom Domain**
2. Add your domain (e.g., `spiritualunitymatch.com`)
3. Update DNS records as instructed by Render
4. Update `FRONTEND_URL` in backend if using custom domain

## Monitoring

- **Logs**: View in Render dashboard → Service → Logs
- **Metrics**: Monitor CPU, Memory, Response times
- **Uptime**: Render provides basic uptime monitoring
- **Alerts**: Set up email alerts for service failures

## Security Checklist

- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Use production Stripe keys (sk_live_, pk_live_)
- [ ] Secure MongoDB Atlas (IP whitelist, strong password)
- [ ] Enable HTTPS (automatic on Render)
- [ ] Set AUTO_APPROVE_PROFILES=false for production
- [ ] Regularly update dependencies
- [ ] Monitor logs for suspicious activity

## Support

- Render Docs: https://render.com/docs
- Render Status: https://status.render.com
- GitHub Issues: https://github.com/arghyanextbusinesssolution-cloud/Dating-Website/issues
