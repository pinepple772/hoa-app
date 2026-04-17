# Deployment Guide - VergeAI

## Overview
This app consists of two parts:
- **Frontend**: React app (deploy to Vercel)
- **Backend**: Express.js server (deploy to Render)

## Prerequisites
- GitHub account
- Vercel account (https://vercel.com)
- Render account (https://render.com)
- OpenAI API key (https://platform.openai.com/api-keys)
- Google Cloud service account JSON key

---

## 1. Backend Deployment (Render)

### Step 1: Add to GitHub
```bash
cd /Users/sophialiu/hoa-app
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/hoa-app.git
git push -u origin main
```

### Step 2: Deploy to Render
1. Go to https://render.com and sign in with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `hoa-backend`
   - **Root Directory**: `hoa-backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. Click **"Advanced"** and add environment variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `FRONTEND_URL`: Your Vercel frontend URL (add after frontend deployment)
   - `GOOGLE_APPLICATION_CREDENTIALS`: `/etc/secrets/key.json` (see step 3)

### Step 3: Add Google Cloud Credentials
1. In Render dashboard, go to your service settings
2. Scroll to **"Secret Files"**
3. Add a new secret file:
   - **Filename**: `/etc/secrets/key.json`
   - **File Contents**: Paste your Google Cloud service account JSON key
4. Update `hoa-backend/.env.example` to reference this path
5. In backend code, the Google Cloud client should automatically pick this up via `GOOGLE_APPLICATION_CREDENTIALS`

### Step 4: Deploy
Click **"Deploy"** and wait for the build to complete. You'll get a URL like:
```
https://hoa-backend-xxxx.onrender.com
```

Save this URL for the frontend deployment.

---

## 2. Frontend Deployment (Vercel)

### Step 1: Set Backend URL
Before deploying, update your frontend to point to the backend URL.

Create `hoa-frontend/.env.production`:
```
REACT_APP_BACKEND_URL=https://hoa-backend-xxxx.onrender.com
```

Then commit:
```bash
git add hoa-frontend/.env.production
git commit -m "Add production backend URL"
git push
```

### Step 2: Deploy to Vercel
1. Go to https://vercel.com and sign in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Select your `hoa-app` repository
4. Configure:
   - **Framework Preset**: Next.js (or detect)
   - **Root Directory**: `hoa-frontend`
   - Click **"Override"** for build settings if needed:
     - **Build Command**: `npm run build`
     - **Output Directory**: `build`
5. Click **"Deploy"**

Vercel will automatically use environment variables from `.env.production`.

---

## 3. Update Backend CORS (After Frontend Deployed)

Once your Vercel frontend is deployed, update the backend:

1. In Render dashboard, go to your backend service
2. Go to **"Environment"**
3. Update `FRONTEND_URL` to your Vercel URL (e.g., `https://hoa-app-xyz.vercel.app`)
4. The service will redeploy automatically

---

## 4. Testing

### Backend Health Check
```bash
curl https://hoa-backend-xxxx.onrender.com/
# Should return: "HOA backend is running"
```

### Frontend Access
Open `https://hoa-app-xyz.vercel.app` in your browser.

### Troubleshooting
- **CORS errors**: Check that `FRONTEND_URL` is set correctly in backend
- **API calls fail**: Verify backend URL is correct in frontend `.env.production`
- **Google Vision errors**: Confirm `GOOGLE_APPLICATION_CREDENTIALS` points to `/etc/secrets/key.json`
- **OpenAI errors**: Verify `OPENAI_API_KEY` is correct and has API quota

---

## 5. Environment Variables Summary

### Backend (Render)
```
OPENAI_API_KEY=sk-xxx...
GOOGLE_APPLICATION_CREDENTIALS=/etc/secrets/key.json
FRONTEND_URL=https://hoa-app-xyz.vercel.app
PORT=4000 (optional, Render sets this)
```

### Frontend (Vercel)
```
REACT_APP_BACKEND_URL=https://hoa-backend-xxxx.onrender.com
```

---

## Costs
- **Vercel**: Free tier includes 100GB bandwidth/month
- **Render**: Free tier for static sites; paid web services start at $7/month
- **APIs**: OpenAI and Google Cloud Vision require credits

---

## Notes
- `.env` files are gitignored and won't be committed
- Always add `.env.example` to show what variables are needed
- Never commit real API keys to GitHub
- Render starter plan sleeps after 15 minutes of inactivity (free tier)
