# 🔐 Environment Variables Setup Guide

Complete guide for setting up environment variables for GlamAI deployment.

## 🚨 SECURITY WARNING

**NEVER COMMIT ENVIRONMENT FILES TO GIT!**
- API keys and secrets should NEVER be in your code repository
- Always use `.gitignore` to exclude `.env` files
- Use platform-specific environment variable management

---

## 📁 Environment Files Structure

```
glam-ai/
├── .env.example                 # Template (safe to commit)
├── .gitignore                   # Excludes all .env files
├── backend/
│   └── .env                     # Backend secrets (DO NOT COMMIT)
└── frontend/
    ├── .env.development         # Development API URL (DO NOT COMMIT)
    └── .env.production          # Production API URL (DO NOT COMMIT)
```

---

## 🎯 Backend Environment Variables

### Local Development (.env)

Create `backend/.env`:

```bash
# Claude AI API Key (Required)
CLAUDE_API_KEY=sk-ant-api03-your-actual-claude-api-key-here

# Development settings (Optional)
DEBUG=True
LOG_LEVEL=DEBUG

# Production settings (for when deployed)
PRODUCTION_FRONTEND_URL=https://your-netlify-app.netlify.app
```

### Render.com Production Setup

1. **Go to Render Dashboard** → Your Service → Environment

2. **Add these variables**:
   ```
   CLAUDE_API_KEY = sk-ant-api03-your-actual-claude-api-key-here
   PYTHON_VERSION = 3.11.0
   PRODUCTION_FRONTEND_URL = https://your-netlify-app.netlify.app
   ```

3. **PORT is automatically set by Render** (don't add manually)

---

## 🎨 Frontend Environment Variables

### Local Development

Create `frontend/.env.development`:

```bash
# Local backend URL
VITE_API_URL=http://localhost:8000

# Development mode
VITE_NODE_ENV=development
```

### Production

Create `frontend/.env.production`:

```bash
# Production backend URL (update after deploying backend)
VITE_API_URL=https://your-render-app.onrender.com

# Production mode
VITE_NODE_ENV=production
```

### Netlify Production Setup

1. **Go to Netlify Dashboard** → Your Site → Site Settings → Environment Variables

2. **Add these variables**:
   ```
   VITE_API_URL = https://your-render-app.onrender.com
   NODE_VERSION = 18
   ```

---

## 🔄 Deployment Workflow

### Step 1: Local Setup

```bash
# 1. Copy the example file
cp .env.example backend/.env

# 2. Edit with your actual API key
nano backend/.env
# Add: CLAUDE_API_KEY=sk-ant-api03-your-key-here

# 3. Create frontend environment files
echo "VITE_API_URL=http://localhost:8000" > frontend/.env.development
echo "VITE_API_URL=https://your-backend.onrender.com" > frontend/.env.production
```

### Step 2: Deploy Backend to Render

```bash
# 1. Push code to GitHub (environment files are excluded)
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. Create Render service and add environment variables:
#    - CLAUDE_API_KEY = your-key
#    - PYTHON_VERSION = 3.11.0
#    - PRODUCTION_FRONTEND_URL = https://your-frontend.netlify.app

# 3. Note your backend URL: https://your-app.onrender.com
```

### Step 3: Deploy Frontend to Netlify

```bash
# 1. Update frontend production environment
echo "VITE_API_URL=https://your-backend.onrender.com" > frontend/.env.production

# 2. Build and deploy
cd frontend
npm run build
netlify deploy --prod --dir=dist

# 3. Or connect GitHub for automatic deployments
```

### Step 4: Update CORS Settings

Update your backend `main.py` to allow your Netlify URL:

```python
# Add your Netlify URL to the origins list
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://your-app.netlify.app",  # Add this
    "https://*.netlify.app",
]
```

---

## 🔍 Environment Variable Reference

### Backend Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `CLAUDE_API_KEY` | ✅ Yes | Your Claude API key from Anthropic | `sk-ant-api03-xxx` |
| `PYTHON_VERSION` | 🔵 Render | Python version for Render | `3.11.0` |
| `PRODUCTION_FRONTEND_URL` | 🟡 Optional | Frontend URL for CORS | `https://app.netlify.app` |
| `DEBUG` | 🟡 Optional | Enable debug mode | `True` / `False` |
| `LOG_LEVEL` | 🟡 Optional | Logging level | `DEBUG` / `INFO` |
| `PORT` | 🔵 Auto | Server port (auto-set by Render) | `8000` |

### Frontend Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_URL` | ✅ Yes | Backend API URL | `https://api.onrender.com` |
| `VITE_NODE_ENV` | 🟡 Optional | Environment mode | `development` / `production` |

---

## 🛡️ Security Best Practices

### API Key Management

1. **Generate Fresh Keys**:
   ```bash
   # Get a new Claude API key from:
   # https://console.anthropic.com/
   ```

2. **Rotate Keys Regularly**:
   - Update keys every 90 days
   - Use different keys for dev/prod
   - Revoke old keys immediately

3. **Monitor Usage**:
   - Check Anthropic console for API usage
   - Set up usage alerts
   - Monitor for unusual activity

### Environment File Security

```bash
# ✅ GOOD: Using environment variables
CLAUDE_API_KEY=sk-ant-api03-xxx

# ❌ BAD: Hardcoding in source code
claude_client = ClaudeClient("sk-ant-api03-xxx")

# ❌ BAD: Committing .env files
git add .env  # DON'T DO THIS!

# ✅ GOOD: Using .gitignore
echo ".env" >> .gitignore
```

---

## 🔧 Testing Environment Setup

### Backend Test

```bash
# Test backend environment variables
cd backend
python -c "
import os
from dotenv import load_dotenv
load_dotenv()
print('CLAUDE_API_KEY:', 'SET' if os.getenv('CLAUDE_API_KEY') else 'MISSING')
print('API Key length:', len(os.getenv('CLAUDE_API_KEY', '')) if os.getenv('CLAUDE_API_KEY') else 0)
"
```

### Frontend Test

```bash
# Test frontend environment variables
cd frontend
npm run dev
# Check browser console for API_BASE_URL
# Should show your VITE_API_URL value
```

### Production Test

```bash
# Test API connection
curl https://your-backend.onrender.com/
# Should return: {"message": "GlamAI API is running!", "version": "1.0.0"}

# Test frontend build
cd frontend
npm run build
# Should complete without errors
```

---

## 🐛 Troubleshooting

### Common Issues

**1. "API Key Not Found" Error**
```bash
# Check if environment variable is set
echo $CLAUDE_API_KEY

# Restart your application after adding environment variables
```

**2. CORS Errors**
```bash
# Make sure your frontend URL is in the backend CORS origins
# Check browser console for exact error message
```

**3. Environment Not Loading**
```bash
# Make sure file is in the correct location:
# backend/.env (for backend)
# frontend/.env.development (for frontend dev)
# frontend/.env.production (for frontend build)
```

**4. Build Failures**
```bash
# Check that all required environment variables are set
# Verify API URLs are accessible
```

### Platform-Specific Issues

**Render.com:**
- Environment variables take effect after restart
- Check service logs for startup errors
- Verify all required variables are set in dashboard

**Netlify:**
- Build-time environment variables need to be set in dashboard
- Clear site cache if changes don't appear
- Check build logs for missing variables

---

## 📋 Environment Checklist

### Pre-Deployment

- [ ] `.env.example` exists and is up-to-date
- [ ] All `.env` files are in `.gitignore`
- [ ] No API keys in source code
- [ ] Backend and frontend environment files created
- [ ] Local testing passes

### Render Deployment

- [ ] Service created and connected to GitHub
- [ ] `CLAUDE_API_KEY` added to environment variables
- [ ] `PYTHON_VERSION` set to 3.11.0
- [ ] Service deploys successfully
- [ ] Health check endpoint responds

### Netlify Deployment

- [ ] `VITE_API_URL` points to Render backend
- [ ] Build completes successfully
- [ ] Frontend loads without console errors
- [ ] API calls work end-to-end

### Final Testing

- [ ] Upload image works
- [ ] Facial analysis completes
- [ ] Recommendations generate
- [ ] Images are deleted after processing
- [ ] Error handling works properly

---

## 🚀 Quick Setup Commands

### Complete Environment Setup

```bash
# 1. Create backend environment
cat > backend/.env << EOF
CLAUDE_API_KEY=sk-ant-api03-your-claude-api-key-here
DEBUG=True
LOG_LEVEL=DEBUG
EOF

# 2. Create frontend development environment
cat > frontend/.env.development << EOF
VITE_API_URL=http://localhost:8000
VITE_NODE_ENV=development
EOF

# 3. Create frontend production environment
cat > frontend/.env.production << EOF
VITE_API_URL=https://your-backend.onrender.com
VITE_NODE_ENV=production
EOF

# 4. Test local setup
cd backend && python main.py &
cd frontend && npm run dev
```

### Production Deployment

```bash
# 1. Deploy backend to Render (set environment variables in dashboard)
# 2. Get backend URL and update frontend production env
# 3. Deploy frontend to Netlify
# 4. Update backend CORS with frontend URL
# 5. Test end-to-end functionality
```

---

## 🎯 Success Criteria

Your environment setup is complete when:

- ✅ No API keys in source code
- ✅ All `.env` files in `.gitignore`
- ✅ Backend connects to Claude API
- ✅ Frontend connects to backend API
- ✅ Production deployments work
- ✅ CORS allows frontend → backend communication
- ✅ Error handling works for missing environment variables

**Your GlamAI environment is now secure and production-ready!** 🔐