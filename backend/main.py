"""
GlamAI Backend - AI-powered makeup look generator
FastAPI backend with MediaPipe face analysis and Claude AI integration
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import tempfile
import os
import shutil
from pathlib import Path
import json
import asyncio
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from face_analyzer import FaceAnalyzer
from claude_client import ClaudeClient
from models import AnalysisResponse, RecommendationResponse

app = FastAPI(
    title="GlamAI API",
    description="AI-powered makeup recommendations based on facial analysis",
    version="1.0.0"
)

# Production CORS settings - supports both development and production
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://*.netlify.app",  # Allow all Netlify apps
    "https://*.vercel.app",   # Allow Vercel apps if needed
]

# Add your specific Netlify URL here after deployment
# Example: origins.append("https://glamai-123abc.netlify.app")

# Add specific production URL when deploying
if os.getenv("PRODUCTION_FRONTEND_URL"):
    origins.append(os.getenv("PRODUCTION_FRONTEND_URL"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
face_analyzer = FaceAnalyzer()
claude_client = ClaudeClient()

# Create uploads directory
UPLOADS_DIR = Path("uploads")
UPLOADS_DIR.mkdir(exist_ok=True)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "GlamAI API is running!", "version": "1.0.0"}


@app.post("/upload")
async def upload_selfie(file: UploadFile = File(...)):
    """
    Upload and temporarily store user selfie
    Returns file_id for subsequent analysis
    """
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")

        # Generate unique filename
        file_id = f"{len(list(UPLOADS_DIR.glob('*')))}_{file.filename}"
        file_path = UPLOADS_DIR / file_id

        # Save uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return {
            "message": "File uploaded successfully",
            "file_id": file_id,
            "original_filename": file.filename,
            "size_bytes": file_path.stat().st_size
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_face(file_id: str):
    """
    Analyze uploaded selfie using MediaPipe FaceMesh
    Extracts facial features and characteristics
    """
    try:
        file_path = UPLOADS_DIR / file_id

        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")

        # Perform face analysis
        analysis_result = await face_analyzer.analyze_face(str(file_path))

        if not analysis_result:
            raise HTTPException(status_code=400, detail="No face detected in image")

        return AnalysisResponse(**analysis_result)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.post("/recommend", response_model=RecommendationResponse)
async def get_makeup_recommendations(analysis_data: AnalysisResponse):
    """
    Generate makeup recommendations using Claude AI
    Based on facial analysis data
    """
    try:
        # Generate recommendations using Claude
        recommendations = await claude_client.get_makeup_recommendations(analysis_data.dict())

        return RecommendationResponse(**recommendations)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation generation failed: {str(e)}")


@app.post("/analyze-and-recommend")
async def analyze_and_recommend(file_id: str):
    """
    Combined endpoint: analyze face and generate recommendations
    PRIVACY-FOCUSED: Automatically deletes uploaded file after processing
    """
    temp_path = None
    try:
        temp_path = UPLOADS_DIR / file_id

        if not temp_path.exists():
            raise HTTPException(status_code=404, detail="File not found")

        # Step 1: Analyze face
        analysis_result = await analyze_face(file_id)

        # Step 2: Get recommendations
        recommendations = await get_makeup_recommendations(analysis_result)

        return {
            "analysis": analysis_result.dict(),
            "recommendations": recommendations.dict(),
            "status": "success",
            "privacy_note": "Image deleted immediately after processing"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Combined analysis failed: {str(e)}")

    finally:
        # CRITICAL: Immediate file cleanup for privacy
        if temp_path and temp_path.exists():
            try:
                temp_path.unlink()
                print(f"🗑️ Privacy cleanup: {temp_path}")
            except Exception as cleanup_error:
                print(f"⚠️ Cleanup failed: {cleanup_error}")


@app.delete("/cleanup/{file_id}")
async def cleanup_file(file_id: str):
    """
    Clean up uploaded file after processing
    """
    try:
        file_path = UPLOADS_DIR / file_id

        if file_path.exists():
            file_path.unlink()
            return {"message": "File deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="File not found")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cleanup failed: {str(e)}")


# Background cleanup task for safety
async def periodic_cleanup():
    """Safety net: cleanup old files every 5 minutes"""
    while True:
        try:
            if UPLOADS_DIR.exists():
                current_time = time.time()
                for file_path in UPLOADS_DIR.iterdir():
                    # Delete files older than 5 minutes
                    if file_path.stat().st_mtime < current_time - 300:
                        file_path.unlink()
                        print(f"🧹 Periodic cleanup: {file_path}")
        except Exception as e:
            print(f"⚠️ Periodic cleanup error: {e}")

        await asyncio.sleep(300)  # 5 minutes


@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    UPLOADS_DIR.mkdir(exist_ok=True)
    print("📁 Uploads directory ready")

    # Start background cleanup task
    asyncio.create_task(periodic_cleanup())
    print("🧹 Periodic cleanup task started")


if __name__ == "__main__":
    import uvicorn
    # Get port from environment variable (required for Render)
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)