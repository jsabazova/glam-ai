"""
Claude AI Client for Makeup Recommendations
Integrates with Anthropic's Claude API to generate personalized makeup advice
"""

import os
from typing import Dict, List
import json
from anthropic import Anthropic
from dotenv import load_dotenv

from models import MakeupLook

# Load environment variables
load_dotenv()


class ClaudeClient:
    """
    Client for interacting with Claude AI
    Generates makeup recommendations based on facial analysis
    """

    def __init__(self):
        api_key = os.getenv("CLAUDE_API_KEY")
        if not api_key:
            raise ValueError("CLAUDE_API_KEY environment variable is required")

        try:
            self.client = Anthropic(api_key=api_key)
        except Exception as e:
            print(f"Failed to initialize Anthropic client: {e}")
            # Fallback initialization without extra parameters
            self.client = Anthropic(api_key=api_key)

    async def get_makeup_recommendations(self, analysis_data: Dict) -> Dict:
        """
        Generate makeup recommendations using Claude AI
        Takes facial analysis data and returns structured recommendations
        """
        try:
            # Construct detailed prompt for Claude
            prompt = self._build_makeup_prompt(analysis_data)

            # Call Claude API
            response = self.client.messages.create(
                model="claude-3-haiku-20240307",  # Fast, cost-effective model
                max_tokens=2000,
                temperature=0.7,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )

            # Parse Claude's response
            response_text = response.content[0].text
            recommendations = self._parse_claude_response(response_text, analysis_data)

            return recommendations

        except Exception as e:
            print(f"Claude API error: {e}")
            # Return fallback recommendations
            return self._get_fallback_recommendations(analysis_data)

    def _build_makeup_prompt(self, analysis_data: Dict) -> str:
        """
        Build detailed prompt for Claude based on facial analysis
        """
        prompt = f"""
You are a professional makeup artist with 15+ years of experience. Analyze this client's facial features and provide personalized makeup recommendations.

CLIENT ANALYSIS:
- Face Shape: {analysis_data.get('face_shape', 'unknown')}
- Eye Type: {analysis_data.get('eye_type', 'unknown')}
- Skin Tone: {analysis_data.get('skin_tone', 'unknown')}
- Undertone: {analysis_data.get('undertone', 'unknown')}
- Eye Distance Ratio: {analysis_data.get('eye_distance_ratio', 0.35):.2f}
- Lip Thickness Ratio: {analysis_data.get('lip_thickness_ratio', 0.03):.2f}
- Nose Width Ratio: {analysis_data.get('nose_width_ratio', 0.25):.2f}
- Face Symmetry: {analysis_data.get('face_symmetry', 0.8):.2f}
- Prominent Cheekbones: {analysis_data.get('has_prominent_cheekbones', False)}
- Eyebrow Arch Height: {analysis_data.get('eyebrow_arch_height', 0.6):.2f}

Please provide EXACTLY 3 makeup looks with detailed recommendations. Respond in this EXACT JSON format:

{{
    "recommended_looks": [
        {{
            "look_name": "Natural Everyday",
            "description": "A fresh, natural look perfect for daily wear",
            "foundation_tips": ["Tip 1", "Tip 2"],
            "contour_tips": ["Tip 1", "Tip 2"],
            "eyeshadow_colors": ["Color 1", "Color 2", "Color 3"],
            "eyeliner_style": "Thin brown line",
            "lip_colors": ["Color 1", "Color 2"],
            "blush_placement": "Detailed placement instruction",
            "avoid": ["Thing to avoid 1", "Thing to avoid 2"],
            "difficulty_level": "Beginner",
            "occasion": "Daily wear, work, casual"
        }},
        {{
            "look_name": "Evening Glam",
            "description": "Sophisticated evening look",
            "foundation_tips": ["Tip 1", "Tip 2"],
            "contour_tips": ["Tip 1", "Tip 2"],
            "eyeshadow_colors": ["Color 1", "Color 2", "Color 3"],
            "eyeliner_style": "Style description",
            "lip_colors": ["Color 1", "Color 2"],
            "blush_placement": "Placement instruction",
            "avoid": ["Thing to avoid 1"],
            "difficulty_level": "Intermediate",
            "occasion": "Date night, dinner, events"
        }},
        {{
            "look_name": "Special Occasion",
            "description": "Dramatic look for special events",
            "foundation_tips": ["Tip 1", "Tip 2"],
            "contour_tips": ["Tip 1", "Tip 2"],
            "eyeshadow_colors": ["Color 1", "Color 2", "Color 3"],
            "eyeliner_style": "Style description",
            "lip_colors": ["Color 1", "Color 2"],
            "blush_placement": "Placement instruction",
            "avoid": ["Thing to avoid 1"],
            "difficulty_level": "Advanced",
            "occasion": "Weddings, galas, photoshoots"
        }}
    ],
    "face_shape_tips": ["Tip 1 for {analysis_data.get('face_shape', 'your')} face", "Tip 2"],
    "eye_shape_tips": ["Tip 1 for {analysis_data.get('eye_type', 'your')} eyes", "Tip 2"],
    "skin_tone_tips": ["Tip 1 for {analysis_data.get('skin_tone', 'your')} skin", "Tip 2"],
    "recommended_tools": ["Tool 1", "Tool 2", "Tool 3", "Tool 4"],
    "color_palette": {{
        "neutrals": ["Color 1", "Color 2", "Color 3"],
        "accents": ["Color 1", "Color 2"],
        "lips": ["Color 1", "Color 2", "Color 3"],
        "blush": ["Color 1", "Color 2"]
    }},
    "top_priority_tip": "The single most important makeup tip for this face"
}}

Focus on:
1. Colors that complement the skin tone and undertone
2. Techniques that enhance the natural face shape
3. Eye makeup that works with the specific eye type
4. Realistic, achievable looks
5. Product recommendations that work for this skin tone

Be specific with color names (e.g., "warm peachy coral", "matte taupe brown") and detailed with techniques.
"""
        return prompt

    def _parse_claude_response(self, response_text: str, analysis_data: Dict) -> Dict:
        """
        Parse Claude's JSON response and validate structure
        """
        try:
            # Try to extract JSON from response
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1

            if json_start != -1 and json_end > json_start:
                json_text = response_text[json_start:json_end]
                parsed_response = json.loads(json_text)

                # Validate required fields
                if "recommended_looks" in parsed_response:
                    return parsed_response

        except (json.JSONDecodeError, KeyError) as e:
            print(f"Failed to parse Claude response: {e}")

        # Fallback to structured response if parsing fails
        return self._get_fallback_recommendations(analysis_data)

    def _get_fallback_recommendations(self, analysis_data: Dict) -> Dict:
        """
        Provide fallback recommendations if Claude API fails
        """
        face_shape = analysis_data.get('face_shape', 'oval')
        eye_type = analysis_data.get('eye_type', 'almond')
        skin_tone = analysis_data.get('skin_tone', 'medium')
        undertone = analysis_data.get('undertone', 'neutral')

        return {
            "recommended_looks": [
                {
                    "look_name": "Natural Everyday",
                    "description": f"A fresh, natural look perfect for your {face_shape} face shape",
                    "foundation_tips": [
                        f"Choose a foundation that matches your {skin_tone} skin tone",
                        "Apply with a damp beauty sponge for natural finish"
                    ],
                    "contour_tips": [
                        f"Use soft contouring techniques for {face_shape} face shape",
                        "Blend well to avoid harsh lines"
                    ],
                    "eyeshadow_colors": [
                        "Neutral brown",
                        "Soft champagne",
                        "Matte vanilla"
                    ],
                    "eyeliner_style": f"Thin line that complements {eye_type} eyes",
                    "lip_colors": [
                        "Natural pink",
                        "Nude rose"
                    ],
                    "blush_placement": "Apply to the apples of cheeks and blend upward",
                    "avoid": [
                        "Heavy contouring",
                        "Bold colors for everyday wear"
                    ],
                    "difficulty_level": "Beginner",
                    "occasion": "Daily wear, work, casual outings"
                },
                {
                    "look_name": "Evening Sophistication",
                    "description": f"Elegant evening look that enhances your {undertone} undertones",
                    "foundation_tips": [
                        "Use full coverage foundation for long-lasting wear",
                        "Set with translucent powder"
                    ],
                    "contour_tips": [
                        "Define cheekbones with deeper contouring",
                        "Highlight the high points of your face"
                    ],
                    "eyeshadow_colors": [
                        "Deep bronze",
                        "Shimmery gold",
                        "Rich brown"
                    ],
                    "eyeliner_style": "Defined line with subtle wing",
                    "lip_colors": [
                        "Classic red",
                        "Deep berry"
                    ],
                    "blush_placement": "Apply along cheekbones for sculpted look",
                    "avoid": [
                        "Overpowering the eyes and lips simultaneously"
                    ],
                    "difficulty_level": "Intermediate",
                    "occasion": "Date nights, dinner parties, theater"
                },
                {
                    "look_name": "Glamorous Special Event",
                    "description": f"Show-stopping look for your {skin_tone} complexion",
                    "foundation_tips": [
                        "Use high-definition foundation for photos",
                        "Prime thoroughly for all-day wear"
                    ],
                    "contour_tips": [
                        "Use dramatic contouring and highlighting",
                        "Build intensity gradually"
                    ],
                    "eyeshadow_colors": [
                        "Metallic copper",
                        "Deep plum",
                        "Golden highlight"
                    ],
                    "eyeliner_style": "Bold dramatic wing with optional lower lash line",
                    "lip_colors": [
                        "Statement red",
                        "Glossy nude"
                    ],
                    "blush_placement": "Sculpted placement with emphasis on bone structure",
                    "avoid": [
                        "Rushing the application process"
                    ],
                    "difficulty_level": "Advanced",
                    "occasion": "Weddings, galas, red carpet events"
                }
            ],
            "face_shape_tips": [
                f"Your {face_shape} face shape is very versatile",
                "Focus on enhancing your natural symmetry"
            ],
            "eye_shape_tips": [
                f"Your {eye_type} eyes are perfect for many techniques",
                "Experiment with different eyeliner styles"
            ],
            "skin_tone_tips": [
                f"Your {skin_tone} skin tone with {undertone} undertones is beautiful",
                "Choose colors that complement your natural warmth"
            ],
            "recommended_tools": [
                "Beauty blender or makeup sponge",
                "Fluffy blending brush",
                "Angled contour brush",
                "Eyeliner brush"
            ],
            "color_palette": {
                "neutrals": ["Warm brown", "Soft beige", "Champagne"],
                "accents": ["Deep bronze", "Golden copper"],
                "lips": ["Natural pink", "Classic red", "Nude rose"],
                "blush": ["Peach", "Rose gold"]
            },
            "top_priority_tip": f"Focus on enhancing your natural {face_shape} face shape with strategic highlighting and contouring"
        }