# Deployment Guide

## Overview
This application consists of two separate deployments on Vercel:
- **Frontend**: Static React app (Vite)
- **Backend**: Node.js serverless functions

## Backend Deployment (`/b` directory)

### Required Environment Variables
Set these in your Vercel project settings:

```
PORT=3000
MONGOO_DB_URL=<your-mongodb-connection-string>
JWT_SECRET=<your-secret-key>
GEMINI_API=<your-gemini-api-key>
EMAIL_ID=<your-email-for-notifications>
EMAIL_PASS=<your-email-password>
NODE_ENV=production
```

### Vercel Configuration
The backend is configured in `b/vercel.json`:
- Entry point: `src/index.js`
- Max duration: 60 seconds (for PDF generation)
- Memory: 1024 MB (required for Puppeteer/Chromium)

### Important Notes
1. **MongoDB Connection**: Uses connection caching for serverless
2. **PDF Generation**: Uses `@sparticuz/chromium` for Vercel compatibility
3. **Timeouts**: All operations have timeouts to prevent serverless function hangs

## Frontend Deployment (`/f` directory)

### Required Environment Variables
Set these in your Vercel project settings:

```
VITE_API_BASE=https://<your-backend-url>/app/api
```

For example:
```
VITE_API_BASE=https://minor-deploy.vercel.app/app/api
```

### Vercel Configuration
The frontend is configured in `f/vercel.json`:
- Build command: `npm run build`
- Output directory: `dist`

## API Endpoints

### Health Check
```
GET /health
```
Returns server status and database connection state.

### Auth Routes
```
POST /app/api/auth/email-register
POST /app/api/auth/signin
POST /app/api/auth/signin/check-token
```

### Chat Routes
```
POST /app/api/chat/query
GET /app/api/chat/fetch-all-chat
```

### Export Routes
```
POST /app/api/export/:conversationId
```
Generates and downloads a PDF of the conversation.

## Common Issues and Solutions

### 1. PDF Export Fails (500 Error)
**Cause**: Puppeteer timeout or memory issues
**Solution**: 
- Ensure `maxDuration` is set to 60 seconds in `b/vercel.json`
- Ensure `memory` is set to 1024 MB
- Check that `@sparticuz/chromium` is installed

### 2. CORS Errors
**Cause**: Frontend origin not in allowed list
**Solution**: 
- Add your frontend URL to `allowedOrigins` in `b/src/index.js`

### 3. Database Connection Errors
**Cause**: MongoDB connection string invalid or not set
**Solution**: 
- Verify `MONGOO_DB_URL` is set correctly in Vercel environment variables
- Check MongoDB Atlas IP whitelist includes Vercel IPs (or use 0.0.0.0/0)

### 4. Cookies Not Working
**Cause**: Cross-origin cookie restrictions
**Solution**: 
- Cookies are set with `sameSite: 'none'` and `secure: true` in production
- Ensure your frontend makes requests with `credentials: 'include'`

### 5. Environment Variables Not Loading
**Cause**: Variables not set in Vercel dashboard
**Solution**: 
- Go to Vercel Project Settings > Environment Variables
- Add all required variables
- Redeploy after adding variables

## Monitoring

### Check Backend Health
```bash
curl https://your-backend-url.vercel.app/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "mongooseState": 1,
  "mongooseStateMap": "connected"
}
```

### Check Logs
1. Go to Vercel Dashboard
2. Select your project
3. Go to "Deployments"
4. Click on a deployment
5. View "Functions" tab for serverless function logs

## Local Development

### Backend
```bash
cd b
npm install
# Create .env file with required variables
npm run dev
```

### Frontend
```bash
cd f
npm install
# Create .env file with VITE_API_BASE=http://localhost:3000/app/api
npm run dev
```

## Performance Tips

1. **Database**: Use MongoDB Atlas with a nearby region
2. **PDF Generation**: Keep HTML simple to reduce generation time
3. **Gemini API**: Has 15-second timeout with fallback to static HTML
4. **Caching**: Database connections are cached between invocations

## Security Notes

1. Never commit `.env` files
2. Rotate JWT_SECRET regularly
3. Keep API keys secure
4. Use HTTPS in production
5. Validate all user inputs
6. Keep dependencies updated
