# 🎨 GlamAI - AI-Powered Makeup Look Generator

An intelligent makeup recommendation system that analyzes facial features using MediaPipe and generates personalized makeup looks using Claude AI.

![GlamAI Demo](https://via.placeholder.com/800x400/ec4899/ffffff?text=GlamAI+MVP+Ready)

## ✨ Features

- **AI-Powered Facial Analysis**: Uses MediaPipe to analyze face shape, eye type, skin tone, and facial proportions
- **Personalized Recommendations**: Claude AI generates custom makeup looks based on your unique features
- **Interactive UI**: Modern React interface with drag-and-drop file upload
- **Real-time Processing**: Fast analysis and recommendations
- **Multiple Look Options**: Get 3 different makeup looks (Natural, Evening, Special Occasion)
- **Detailed Instructions**: Step-by-step makeup application guides
- **Color Palette**: Personalized color recommendations for your skin tone
- **Export Features**: Save recommendations as PDF (coming soon)
- **Premium Options**: Upgrade for advanced features (coming soon)

## 🏗️ Architecture

### Backend (FastAPI)
- **Face Analysis**: MediaPipe FaceMesh for feature extraction
- **AI Integration**: Claude API for makeup recommendations
- **File Handling**: Secure temporary file storage
- **API Design**: RESTful endpoints with proper error handling

### Frontend (React + Tailwind)
- **Modern UI**: Responsive design with Tailwind CSS
- **File Upload**: Drag-and-drop with preview
- **Real-time Updates**: Live analysis progress
- **Results Display**: Beautiful presentation of recommendations

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- Claude API key from [Anthropic Console](https://console.anthropic.com/)

### 🎯 Automated Setup (Recommended)

Use our deployment helper script for easy setup:

```bash
# Make script executable and run setup
chmod +x deploy.sh
./deploy.sh

# Choose option 1: Setup environment files for local development
```

### 1. Clone the Repository

```bash
git clone <repository-url>
cd glam-ai
```

### 2. Set Up Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your Claude API key
CLAUDE_API_KEY=sk-ant-api03-your-claude-api-key-here
```

### 3. Start Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python main.py
```

The backend will be available at `http://localhost:8000`

### 4. Start Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📁 Project Structure

```
glam-ai/
├── backend/                 # FastAPI backend
│   ├── main.py             # Main application entry
│   ├── models.py           # Pydantic models & schemas
│   ├── face_analyzer.py    # MediaPipe facial analysis
│   ├── claude_client.py    # Claude AI integration
│   ├── requirements.txt    # Python dependencies
│   ├── uploads/            # Temporary file storage
│   └── .env               # Backend environment variables
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── FileUpload.jsx
│   │   │   ├── ImagePreview.jsx
│   │   │   ├── AnalysisResults.jsx
│   │   │   ├── RecommendationResults.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── services/       # API service layer
│   │   │   └── api.js
│   │   ├── App.jsx        # Main app component
│   │   ├── index.css      # Tailwind styles
│   │   └── main.jsx       # Entry point
│   ├── package.json       # Node dependencies
│   ├── tailwind.config.js # Tailwind configuration
│   └── .env              # Frontend environment variables
├── .env.example           # Environment template
└── README.md             # This file
```

## 🔧 API Endpoints

### Backend API Reference

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/` | GET | Health check | None |
| `/upload` | POST | Upload selfie image | `file`: Image file |
| `/analyze` | POST | Analyze facial features | `file_id`: String |
| `/recommend` | POST | Get makeup recommendations | `analysis_data`: JSON |
| `/analyze-and-recommend` | POST | Combined analysis + recommendations | `file_id`: String |
| `/cleanup/{file_id}` | DELETE | Remove uploaded file | `file_id`: Path param |

### Example API Usage

```javascript
// Upload image
const formData = new FormData();
formData.append('file', selectedFile);
const uploadResponse = await fetch('http://localhost:8000/upload', {
  method: 'POST',
  body: formData
});
const { file_id } = await uploadResponse.json();

// Get recommendations
const analysisResponse = await fetch(`http://localhost:8000/analyze-and-recommend?file_id=${file_id}`, {
  method: 'POST'
});
const results = await analysisResponse.json();
```

## 🎯 Facial Analysis Features

### Detection Capabilities
- **Face Shape**: Oval, Round, Square, Heart, Oblong, Diamond
- **Eye Type**: Almond, Round, Hooded, Monolid, Upturned, Downturned
- **Skin Tone**: Fair, Light, Medium, Tan, Deep
- **Undertone**: Cool, Warm, Neutral

### Measurements & Ratios
- **Eye Distance Ratio**: Spacing relative to face width
- **Lip Thickness Ratio**: Fullness relative to face height
- **Nose Width Ratio**: Width relative to face width
- **Face Symmetry Score**: Overall balance assessment
- **Cheekbone Prominence**: High/low cheekbone detection
- **Eyebrow Arch Height**: Natural arch prominence

## 💄 AI Makeup Recommendations

### Generated Look Types

1. **Natural Everyday Look**
   - Difficulty: Beginner
   - Perfect for: Daily wear, work, casual outings
   - Focus: Enhancing natural features

2. **Evening Sophistication**
   - Difficulty: Intermediate
   - Perfect for: Date nights, dinner parties, events
   - Focus: Elegant and polished appearance

3. **Glamorous Special Event**
   - Difficulty: Advanced
   - Perfect for: Weddings, galas, photoshoots
   - Focus: Bold, statement looks

### Recommendation Categories

- **Foundation**: Shade matching and application techniques
- **Contouring**: Face shape-specific sculpting
- **Eyeshadow**: Color palettes and blending methods
- **Eyeliner**: Styles that complement eye shape
- **Lips**: Colors and application techniques
- **Blush**: Optimal placement for face shape
- **Tools**: Essential brushes and applicators

## 🛠️ Development Guide

### Backend Development

```bash
cd backend

# Install in development mode
pip install -r requirements.txt

# Run with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# View interactive API docs
open http://localhost:8000/docs

# View alternative API docs
open http://localhost:8000/redoc
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### MediaPipe Setup Notes

MediaPipe requires specific versions for optimal performance:
- Works best with Python 3.9-3.11
- OpenCV compatibility is important
- May require platform-specific builds

## 🔐 Security & Privacy

### Data Protection
- **Automatic Cleanup**: Images deleted after processing
- **No Permanent Storage**: No user data retention
- **Secure Processing**: Server-side analysis only
- **Privacy First**: No third-party data sharing

### Security Features
- **File Validation**: Type and size checking
- **Request Timeouts**: Prevents hanging requests
- **Error Handling**: Secure error responses
- **CORS Configuration**: Controlled access

## 🚀 Production Deployment

### 📋 Deployment Guides

**Complete deployment documentation:**
- 📖 **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Comprehensive step-by-step deployment guide
- 🔐 **[ENV_SETUP.md](ENV_SETUP.md)** - Environment variable management and security
- 🛠️ **[deploy.sh](deploy.sh)** - Automated deployment helper script

### 🎯 Quick Deploy Summary

1. **Backend → Render.com (Free Tier)**
   ```bash
   # 1. Push to GitHub
   git add . && git commit -m "Deploy ready" && git push

   # 2. Create Render service with environment variables:
   CLAUDE_API_KEY=your-key-here
   PYTHON_VERSION=3.11.0
   ```

2. **Frontend → Netlify (Free Tier)**
   ```bash
   # 1. Update API URL
   echo "VITE_API_URL=https://your-backend.onrender.com" > frontend/.env.production

   # 2. Build and deploy
   cd frontend && npm run build && netlify deploy --prod --dir=dist
   ```

3. **Privacy & Security ✅**
   - Images deleted immediately after processing
   - No permanent storage of user data
   - API keys secured via environment variables
   - CORS properly configured

### Backend Deployment Options

**1. Railway/Render (Recommended)**
```bash
# Connect GitHub repo and deploy automatically
# Set environment variables in dashboard
```

**2. Docker Deployment**
```dockerfile
# Create Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**3. Cloud Functions**
- Adapt for AWS Lambda or Google Cloud Functions
- May require adjustments for cold starts

### Frontend Deployment

**1. Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Or connect GitHub repo in Vercel dashboard
```

**2. Netlify**
```bash
# Build locally
npm run build

# Deploy dist folder to Netlify
```

## 📝 Environment Configuration

### Required Environment Variables

**Backend (.env)**
```bash
# Required
CLAUDE_API_KEY=sk-ant-api03-your-claude-api-key-here

# Optional
DEBUG=False
LOG_LEVEL=INFO
```

**Frontend (.env)**
```bash
# Required
VITE_API_URL=http://localhost:8000

# For production
VITE_API_URL=https://your-backend-domain.com
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] File upload works with various image formats
- [ ] Drag and drop functionality
- [ ] Image preview displays correctly
- [ ] Facial analysis completes successfully
- [ ] Recommendations generate properly
- [ ] Error handling for invalid files
- [ ] Responsive design on mobile/desktop
- [ ] Loading states display correctly

### Test Images

For best results, test with:
- Clear, well-lit selfies
- Front-facing photos
- Minimal existing makeup
- Various face shapes and skin tones

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Standards
- Follow PEP 8 for Python code
- Use ESLint/Prettier for JavaScript
- Write descriptive commit messages
- Add comments for complex logic

## 🐛 Troubleshooting

### Common Issues

**1. MediaPipe Installation**
```bash
# If MediaPipe fails to install
pip install --upgrade pip
pip install mediapipe --no-cache-dir
```

**2. CORS Errors**
- Ensure frontend URL is in CORS allowed origins
- Check backend is running on correct port

**3. Claude API Errors**
- Verify API key is correctly set
- Check API usage limits
- Ensure internet connectivity

**4. File Upload Issues**
- Check file size limits (10MB default)
- Verify file type is supported
- Ensure uploads directory exists

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[MediaPipe](https://mediapipe.dev/)** - Facial landmark detection
- **[Anthropic Claude](https://claude.ai/)** - AI-powered recommendations
- **[React](https://react.dev/)** - Frontend framework
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling framework
- **[FastAPI](https://fastapi.tiangolo.com/)** - Backend framework

## 📞 Support & Contact

- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/glam-ai/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/glam-ai/discussions)
- 📧 **Email**: support@glamai.com

---

**🎨 Built with ❤️ using Claude AI, MediaPipe, React, and FastAPI**

*Ready to transform your makeup routine with AI? Start your GlamAI journey today!*
