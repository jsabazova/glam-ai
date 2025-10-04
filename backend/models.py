"""
Pydantic models for GlamAI API
Defines request/response schemas for type safety
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from enum import Enum


class FaceShape(str, Enum):
    """Enumeration of possible face shapes"""
    OVAL = "oval"
    ROUND = "round"
    SQUARE = "square"
    HEART = "heart"
    OBLONG = "oblong"
    DIAMOND = "diamond"


class EyeType(str, Enum):
    """Enumeration of eye types"""
    ALMOND = "almond"
    ROUND = "round"
    HOODED = "hooded"
    MONOLID = "monolid"
    UPTURNED = "upturned"
    DOWNTURNED = "downturned"


class SkinTone(str, Enum):
    """Enumeration of skin tones"""
    FAIR = "fair"
    LIGHT = "light"
    MEDIUM = "medium"
    TAN = "tan"
    DEEP = "deep"


class Undertone(str, Enum):
    """Enumeration of skin undertones"""
    COOL = "cool"
    WARM = "warm"
    NEUTRAL = "neutral"


class AnalysisResponse(BaseModel):
    """Response model for face analysis"""
    face_shape: FaceShape = Field(..., description="Detected face shape")
    eye_type: EyeType = Field(..., description="Detected eye type")
    skin_tone: SkinTone = Field(..., description="Detected skin tone")
    undertone: Undertone = Field(..., description="Detected skin undertone")

    # Feature measurements (0.0 to 1.0)
    eye_distance_ratio: float = Field(..., ge=0.0, le=1.0, description="Eye distance relative to face width")
    lip_thickness_ratio: float = Field(..., ge=0.0, le=1.0, description="Lip thickness relative to face height")
    nose_width_ratio: float = Field(..., ge=0.0, le=1.0, description="Nose width relative to face width")
    face_symmetry: float = Field(..., ge=0.0, le=1.0, description="Face symmetry score")

    # Additional features
    has_prominent_cheekbones: bool = Field(..., description="Whether cheekbones are prominent")
    eyebrow_arch_height: float = Field(..., ge=0.0, le=1.0, description="Eyebrow arch prominence")

    # Confidence scores
    analysis_confidence: float = Field(..., ge=0.0, le=1.0, description="Overall analysis confidence")

    class Config:
        use_enum_values = True


class MakeupLook(BaseModel):
    """Individual makeup look recommendation"""
    look_name: str = Field(..., description="Name of the makeup look")
    description: str = Field(..., description="Brief description of the look")

    # Specific recommendations
    foundation_tips: List[str] = Field(..., description="Foundation application tips")
    contour_tips: List[str] = Field(..., description="Contouring recommendations")
    eyeshadow_colors: List[str] = Field(..., description="Recommended eyeshadow colors")
    eyeliner_style: str = Field(..., description="Recommended eyeliner style")
    lip_colors: List[str] = Field(..., description="Recommended lip colors")
    blush_placement: str = Field(..., description="Optimal blush placement")

    # Things to avoid
    avoid: List[str] = Field(..., description="Colors/techniques to avoid")

    # Difficulty and occasion
    difficulty_level: str = Field(..., description="Beginner, Intermediate, or Advanced")
    occasion: str = Field(..., description="Best occasion for this look")


class RecommendationResponse(BaseModel):
    """Response model for makeup recommendations"""
    recommended_looks: List[MakeupLook] = Field(..., description="List of recommended makeup looks")

    # General tips based on analysis
    face_shape_tips: List[str] = Field(..., description="General tips for face shape")
    eye_shape_tips: List[str] = Field(..., description="General tips for eye shape")
    skin_tone_tips: List[str] = Field(..., description="General tips for skin tone")

    # Product recommendations
    recommended_tools: List[str] = Field(..., description="Recommended makeup tools")
    color_palette: Dict[str, List[str]] = Field(..., description="Personalized color palette")

    # Priority suggestions
    top_priority_tip: str = Field(..., description="Most important tip for this face")


class FileUploadResponse(BaseModel):
    """Response model for file upload"""
    message: str
    file_id: str
    original_filename: str
    size_bytes: int


class ErrorResponse(BaseModel):
    """Error response model"""
    detail: str
    error_code: Optional[str] = None