# 🚀 GlamAI MVP Deployment Guide

Complete step-by-step guide to deploy your GlamAI makeup recommendation system to production.

## 📋 Overview

- **Frontend**: React app → Netlify (free tier)
- **Backend**: FastAPI → Render (free tier)
- **Privacy**: Images deleted immediately after analysis
- **Environment**: Secure API key management

---

## 🎯 Phase 1: Backend Deployment (Render.com)

### Step 1.1: Prepare Backend for Production

First, let's optimize the backend for cloud deployment:

```bash
cd backend
```

Create a production startup script:

**File: `backend/start.sh`**
```bash
#!/bin/bash
python -m uvicorn main:app --host 0.0.0.0 --port $PORT
```

Make it executable:
```bash
chmod +x start.sh
```

**File: `backend/render.yaml`** (Render configuration)
```yaml
services:
  - type: web
    name: glamai-backend
    env: python
    plan: free
    buildCommand: pip install -r requirements.txt
    startCommand: python -m uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: CLAUDE_API_KEY
        sync: false
      - key: PYTHON_VERSION
        value: 3.11.0
```

### Step 1.2: Update Backend for Production

Update your `main.py` to handle production environment:

```python
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="GlamAI API", version="1.0.0")

# Production CORS settings
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://your-netlify-app.netlify.app",  # Update this after Netlify deployment
    "https://*.netlify.app",  # Allow all Netlify apps for testing
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get port from environment variable (Render requirement)
PORT = int(os.environ.get("PORT", 8000))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
```

### Step 1.3: Deploy to Render

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub account

2. **Connect Repository**
   - Push your code to GitHub first:
   ```bash
   git init
   git add .
   git commit -m "Initial GlamAI MVP"
   git branch -M main
   git remote add origin https://github.com/yourusername/glam-ai.git
   git push -u origin main
   ```

3. **Create Web Service**
   - In Render dashboard: "New" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `glamai-backend`
     - **Environment**: `Python 3`
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `python -m uvicorn main:app --host 0.0.0.0 --port $PORT`
     - **Plan**: Free

4. **Set Environment Variables**
   - In service settings → Environment
   - Add: `CLAUDE_API_KEY` = `your-claude-api-key`
   - **Important**: Never commit API keys to your repository!

5. **Deploy**
   - Click "Create Web Service"
   - Wait 5-10 minutes for deployment
   - Your backend URL: `https://glamai-backend.onrender.com`

---

## 🎨 Phase 2: Frontend Deployment (Netlify)

### Step 2.1: Prepare Frontend for Production

Update your frontend to use the production backend URL:

**File: `frontend/.env.production`**
```bash
VITE_API_URL=https://glamai-backend.onrender.com
```

**File: `frontend/.env.development`**
```bash
VITE_API_URL=http://localhost:8000
```

Update your API service to use environment variables:

**File: `frontend/src/services/api.js`**
```javascript
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout for image processing
  headers: {
    'Content-Type': 'application/json',
  }
})

// Request interceptor for file uploads
api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    config.headers['Content-Type'] = 'multipart/form-data'
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export default api
```

### Step 2.2: Build and Deploy to Netlify

1. **Build Production Version**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy via Netlify Drop**
   - Go to [netlify.com](https://netlify.com)
   - Sign up with GitHub
   - Drag and drop your `dist` folder to Netlify
   - Or use Netlify CLI:
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=dist
   ```

3. **Alternative: Connect GitHub (Recommended)**
   - In Netlify dashboard: "New site from Git"
   - Connect GitHub repository
   - Configure:
     - **Branch**: `main`
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`
     - **Environment variables**: Add `VITE_API_URL=https://glamai-backend.onrender.com`

4. **Custom Domain (Optional)**
   - In site settings → Domain management
   - Add custom domain or use provided `.netlify.app` URL

---

## 🔒 Phase 3: Privacy & Security Implementation

### Step 3.1: Enhanced File Cleanup

Update your backend to ensure immediate file deletion:

**File: `backend/main.py` (Enhanced cleanup)**
```python
import os
import tempfile
import asyncio
from contextlib import asynccontextmanager

# Cleanup function
async def cleanup_file(file_path: str, delay: int = 0):
    """Delete file after optional delay"""
    if delay > 0:
        await asyncio.sleep(delay)
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"✅ Deleted: {file_path}")
    except Exception as e:
        print(f"⚠️ Cleanup error: {e}")

@app.post("/analyze-and-recommend")
async def analyze_and_recommend(file_id: str):
    temp_path = None
    try:
        # Process image
        temp_path = f"uploads/{file_id}"

        # Facial analysis
        analysis_result = await face_analyzer.analyze_face(temp_path)

        # Get recommendations
        recommendations = await claude_client.get_recommendations(analysis_result)

        return {
            "analysis": analysis_result,
            "recommendations": recommendations,
            "status": "success"
        }

    except Exception as e:
        return {"error": str(e), "status": "error"}

    finally:
        # IMMEDIATE cleanup - critical for privacy
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
                print(f"🗑️ Privacy cleanup: {temp_path}")
            except Exception as cleanup_error:
                print(f"⚠️ Cleanup failed: {cleanup_error}")

# Startup event to create uploads directory
@app.on_event("startup")
async def startup_event():
    os.makedirs("uploads", exist_ok=True)
    print("📁 Uploads directory ready")

# Background cleanup task (safety net)
@app.on_event("startup")
async def start_cleanup_task():
    asyncio.create_task(periodic_cleanup())

async def periodic_cleanup():
    """Safety net: cleanup old files every 5 minutes"""
    while True:
        try:
            uploads_dir = "uploads"
            if os.path.exists(uploads_dir):
                for filename in os.listdir(uploads_dir):
                    file_path = os.path.join(uploads_dir, filename)
                    # Delete files older than 5 minutes
                    if os.path.getmtime(file_path) < time.time() - 300:
                        os.remove(file_path)
                        print(f"🧹 Periodic cleanup: {file_path}")
        except Exception as e:
            print(f"⚠️ Periodic cleanup error: {e}")

        await asyncio.sleep(300)  # 5 minutes
```

### Step 3.2: Frontend Privacy Notice

Add privacy notice to your upload component:

**File: `frontend/src/components/FileUpload.jsx`**
```jsx
// Add this privacy notice
<div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
  <div className="flex items-center">
    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <div>
      <h4 className="text-green-800 font-semibold">🔒 Privacy Protected</h4>
      <p className="text-green-700 text-sm">Your photos are analyzed instantly and deleted immediately. We never store your images.</p>
    </div>
  </div>
</div>
```

---

## 🔧 Phase 4: Environment Variables & Security

### Step 4.1: Secure Environment Management

**Never commit these files to Git:**

**File: `.gitignore`**
```
# Environment files
.env
.env.local
.env.production
.env.development

# Backend
backend/.env
backend/uploads/
backend/__pycache__/

# Frontend
frontend/.env
frontend/.env.local
frontend/dist/
frontend/node_modules/

# API keys and secrets
*.key
*.pem
secrets/
```

### Step 4.2: Environment Variable Checklist

**Backend (Render.com):**
```bash
CLAUDE_API_KEY=sk-ant-api03-your-key-here
PYTHON_VERSION=3.11.0
PORT=8000  # Automatically set by Render
```

**Frontend (Netlify):**
```bash
VITE_API_URL=https://glamai-backend.onrender.com
```

**Local Development:**
```bash
# backend/.env
CLAUDE_API_KEY=sk-ant-api03-your-key-here

# frontend/.env.development
VITE_API_URL=http://localhost:8000
```

---

## 💰 Free Tier Limitations & Recommendations

### Render.com (Backend)
- **Free Tier**:
  - 512MB RAM, shared CPU
  - Sleeps after 15 minutes of inactivity
  - 750 hours/month (enough for MVP)
  - **Cold starts**: ~30 seconds wake-up time

### Netlify (Frontend)
- **Free Tier**:
  - 100GB bandwidth/month
  - 300 build minutes/month
  - Custom domains included
  - **Perfect for MVPs**

### Expected Performance
- **Image analysis**: 3-8 seconds
- **Cold start penalty**: +30 seconds (first request)
- **Concurrent users**: 5-10 users max on free tier

---

## 🚀 Phase 5: Deployment Steps Summary

### Quick Deployment Checklist

1. **Backend Deployment**
   ```bash
   # Push to GitHub
   git add .
   git commit -m "Production ready"
   git push origin main

   # Deploy on Render.com
   # 1. Create account → Connect GitHub
   # 2. New Web Service → Select repo
   # 3. Add CLAUDE_API_KEY environment variable
   # 4. Deploy (5-10 minutes)
   ```

2. **Frontend Deployment**
   ```bash
   cd frontend

   # Update API URL in .env.production
   echo "VITE_API_URL=https://your-render-app.onrender.com" > .env.production

   # Build and deploy
   npm run build
   netlify deploy --prod --dir=dist
   ```

3. **Update CORS**
   ```bash
   # Update backend main.py with your Netlify URL
   origins = [
       "https://your-netlify-app.netlify.app"
   ]
   ```

4. **Test End-to-End**
   - Visit your Netlify URL
   - Upload a selfie
   - Verify analysis works
   - Check privacy: images deleted immediately

---

## 🔍 Testing & Verification

### Frontend Testing
1. **Upload Flow**: Drag & drop image → Preview → Analyze
2. **API Connection**: Network tab shows successful API calls
3. **Error Handling**: Invalid files show proper errors
4. **Responsive Design**: Test on mobile/desktop

### Backend Testing
1. **Health Check**: `GET https://your-backend.onrender.com/`
2. **File Upload**: `POST /upload` with image
3. **Analysis**: `POST /analyze-and-recommend`
4. **Privacy**: Verify files deleted from uploads folder

### Privacy Verification
```bash
# SSH into Render container (if needed for debugging)
# Check uploads directory is empty after processing
ls -la uploads/
# Should be empty or contain only very recent files
```

---

## 🐛 Troubleshooting

### Common Issues

**1. Cold Start Delays**
- **Problem**: First request takes 30+ seconds
- **Solution**: Expected on free tier, inform users
- **Upgrade**: Paid plan removes cold starts

**2. CORS Errors**
- **Problem**: Frontend can't reach backend
- **Solution**: Update `origins` list in `main.py`
- **Check**: Both URLs are correct (http vs https)

**3. Environment Variables**
- **Problem**: API key not working
- **Solution**: Double-check Render environment settings
- **Test**: Use health endpoint to verify deployment

**4. MediaPipe Installation**
- **Problem**: Build fails on Render
- **Solution**: Ensure `requirements.txt` has correct versions
- **Fallback**: Simplify to basic analysis if needed

**5. File Upload Size**
- **Problem**: Large images fail
- **Solution**: Add client-side compression
- **Limit**: Set max file size (5MB recommended)

### Performance Optimization

**Backend:**
```python
# Add to main.py for better performance
from fastapi.responses import JSONResponse

@app.middleware("http")
async def add_performance_headers(request, call_next):
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-cache"
    response.headers["Access-Control-Max-Age"] = "86400"
    return response
```

**Frontend:**
```javascript
// Add to api.js for better error handling
const retryRequest = async (fn, retries = 3) => {
  try {
    return await fn()
  } catch (error) {
    if (retries > 0 && error.code === 'NETWORK_ERROR') {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return retryRequest(fn, retries - 1)
    }
    throw error
  }
}
```

---

## 🎯 Success Metrics

Your deployment is successful when:

- ✅ Backend responds to health checks
- ✅ Frontend loads and connects to backend
- ✅ Users can upload images successfully
- ✅ Facial analysis completes in <10 seconds
- ✅ Makeup recommendations display properly
- ✅ Images are deleted immediately after processing
- ✅ No API keys exposed in frontend code
- ✅ Error handling works for invalid inputs

---

## 🚀 Next Steps After Deployment

1. **Share MVP**: Send Netlify URL to test users
2. **Monitor**: Check Render logs for errors
3. **Iterate**: Collect user feedback
4. **Scale**: Upgrade to paid tiers when needed
5. **Analytics**: Add user tracking (optional)

**Your GlamAI MVP is now live and ready for users!** 🎉

---

## 📞 Support Resources

- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)
- **FastAPI Deployment**: [fastapi.tiangolo.com/deployment](https://fastapi.tiangolo.com/deployment/)
- **Vite Build**: [vitejs.dev/guide/build.html](https://vitejs.dev/guide/build.html)

Remember: Free tiers are perfect for MVP validation. Upgrade to paid plans once you validate product-market fit! 💪