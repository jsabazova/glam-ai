"""
Face Analysis using MediaPipe
Extracts facial features and characteristics for makeup recommendations
"""

import cv2
import mediapipe as mp
import numpy as np
from typing import Dict, Optional, Tuple
import math

from models import FaceShape, EyeType, SkinTone, Undertone


class FaceAnalyzer:
    """
    Analyzes facial features using MediaPipe FaceMesh
    Extracts geometry, proportions, and characteristics
    """

    def __init__(self):
        # Initialize MediaPipe Face Mesh
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5
        )

        # Define key landmark indices for facial features
        self.FACE_OVAL = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
                         397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
                         172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109]

        # Eye landmarks
        self.LEFT_EYE = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398]
        self.RIGHT_EYE = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246]

        # Lip landmarks
        self.LIPS = [61, 146, 91, 181, 84, 17, 314, 405, 320, 307, 375, 321, 308, 324, 318]

        # Nose landmarks
        self.NOSE = [19, 20, 237, 44, 1, 2, 5, 4, 6, 168, 8, 9, 10, 151]

    async def analyze_face(self, image_path: str) -> Optional[Dict]:
        """
        Main analysis function
        Returns facial analysis data or None if no face detected
        """
        try:
            # Load and process image
            image = cv2.imread(image_path)
            if image is None:
                return None

            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = self.face_mesh.process(image_rgb)

            if not results.multi_face_landmarks:
                return None

            # Get landmarks for the first (and only) face
            landmarks = results.multi_face_landmarks[0]
            h, w, _ = image.shape

            # Convert normalized landmarks to pixel coordinates
            face_landmarks = []
            for landmark in landmarks.landmark:
                x = int(landmark.x * w)
                y = int(landmark.y * h)
                face_landmarks.append((x, y))

            # Perform detailed analysis
            analysis = {
                "face_shape": self._determine_face_shape(face_landmarks),
                "eye_type": self._determine_eye_type(face_landmarks),
                "skin_tone": self._analyze_skin_tone(image_rgb, face_landmarks),
                "undertone": self._analyze_undertone(image_rgb, face_landmarks),
                "eye_distance_ratio": self._calculate_eye_distance_ratio(face_landmarks),
                "lip_thickness_ratio": self._calculate_lip_thickness_ratio(face_landmarks),
                "nose_width_ratio": self._calculate_nose_width_ratio(face_landmarks),
                "face_symmetry": self._calculate_face_symmetry(face_landmarks),
                "has_prominent_cheekbones": self._detect_prominent_cheekbones(face_landmarks),
                "eyebrow_arch_height": self._calculate_eyebrow_arch(face_landmarks),
                "analysis_confidence": 0.85  # Default confidence score
            }

            return analysis

        except Exception as e:
            print(f"Analysis error: {e}")
            return None

    def _determine_face_shape(self, landmarks: list) -> FaceShape:
        """Determine face shape based on facial proportions"""
        try:
            # Get key points for face outline
            face_width = self._distance(landmarks[454], landmarks[234])  # Horizontal
            face_height = self._distance(landmarks[10], landmarks[152])  # Vertical
            jaw_width = self._distance(landmarks[172], landmarks[397])   # Jaw line
            forehead_width = self._distance(landmarks[103], landmarks[332])  # Forehead

            # Calculate ratios
            width_height_ratio = face_width / face_height
            jaw_forehead_ratio = jaw_width / forehead_width

            # Classify based on ratios
            if width_height_ratio > 1.2:
                return FaceShape.ROUND
            elif width_height_ratio < 0.8:
                return FaceShape.OBLONG
            elif jaw_forehead_ratio < 0.8:
                return FaceShape.HEART
            elif abs(jaw_forehead_ratio - 1.0) < 0.1 and 0.9 <= width_height_ratio <= 1.1:
                return FaceShape.SQUARE
            elif abs(jaw_forehead_ratio - 1.0) < 0.15:
                return FaceShape.OVAL
            else:
                return FaceShape.DIAMOND

        except:
            return FaceShape.OVAL  # Default fallback

    def _determine_eye_type(self, landmarks: list) -> EyeType:
        """Determine eye type based on eye shape analysis"""
        try:
            # Analyze left eye (index 0) and right eye (index 1)
            left_eye_points = [landmarks[i] for i in self.LEFT_EYE[:6]]
            right_eye_points = [landmarks[i] for i in self.RIGHT_EYE[:6]]

            # Calculate eye width and height for both eyes
            left_width = self._distance(left_eye_points[0], left_eye_points[3])
            left_height = self._distance(left_eye_points[1], left_eye_points[5])
            left_ratio = left_height / left_width if left_width > 0 else 0

            right_width = self._distance(right_eye_points[0], right_eye_points[3])
            right_height = self._distance(right_eye_points[1], right_eye_points[5])
            right_ratio = right_height / right_width if right_width > 0 else 0

            avg_ratio = (left_ratio + right_ratio) / 2

            # Classify based on height-to-width ratio
            if avg_ratio > 0.5:
                return EyeType.ROUND
            elif avg_ratio < 0.3:
                return EyeType.MONOLID
            else:
                return EyeType.ALMOND  # Most common default

        except:
            return EyeType.ALMOND

    def _analyze_skin_tone(self, image: np.ndarray, landmarks: list) -> SkinTone:
        """Analyze skin tone from face region"""
        try:
            # Extract face region for color analysis
            face_region = self._extract_face_region(image, landmarks)

            # Calculate average brightness
            gray = cv2.cvtColor(face_region, cv2.COLOR_RGB2GRAY)
            avg_brightness = np.mean(gray)

            # Classify based on brightness (simplified)
            if avg_brightness < 60:
                return SkinTone.DEEP
            elif avg_brightness < 100:
                return SkinTone.TAN
            elif avg_brightness < 140:
                return SkinTone.MEDIUM
            elif avg_brightness < 180:
                return SkinTone.LIGHT
            else:
                return SkinTone.FAIR

        except:
            return SkinTone.MEDIUM  # Default

    def _analyze_undertone(self, image: np.ndarray, landmarks: list) -> Undertone:
        """Analyze skin undertone from face region"""
        try:
            # Extract face region
            face_region = self._extract_face_region(image, landmarks)

            # Calculate color channel averages
            avg_r = np.mean(face_region[:, :, 0])
            avg_g = np.mean(face_region[:, :, 1])
            avg_b = np.mean(face_region[:, :, 2])

            # Simple undertone detection based on color balance
            if avg_r > avg_g and avg_r > avg_b:
                return Undertone.WARM
            elif avg_b > avg_r and avg_b > avg_g:
                return Undertone.COOL
            else:
                return Undertone.NEUTRAL

        except:
            return Undertone.NEUTRAL

    def _calculate_eye_distance_ratio(self, landmarks: list) -> float:
        """Calculate ratio of eye distance to face width"""
        try:
            # Distance between inner eye corners
            eye_distance = self._distance(landmarks[133], landmarks[362])
            # Face width
            face_width = self._distance(landmarks[454], landmarks[234])

            ratio = eye_distance / face_width if face_width > 0 else 0.35
            return min(max(ratio, 0.0), 1.0)  # Clamp to [0, 1]

        except:
            return 0.35  # Average ratio

    def _calculate_lip_thickness_ratio(self, landmarks: list) -> float:
        """Calculate lip thickness relative to face height"""
        try:
            # Lip height (upper to lower lip)
            lip_height = self._distance(landmarks[13], landmarks[14])
            # Face height
            face_height = self._distance(landmarks[10], landmarks[152])

            ratio = lip_height / face_height if face_height > 0 else 0.03
            return min(max(ratio, 0.0), 1.0)

        except:
            return 0.03

    def _calculate_nose_width_ratio(self, landmarks: list) -> float:
        """Calculate nose width relative to face width"""
        try:
            # Nose width
            nose_width = self._distance(landmarks[131], landmarks[358])
            # Face width
            face_width = self._distance(landmarks[454], landmarks[234])

            ratio = nose_width / face_width if face_width > 0 else 0.25
            return min(max(ratio, 0.0), 1.0)

        except:
            return 0.25

    def _calculate_face_symmetry(self, landmarks: list) -> float:
        """Calculate face symmetry score"""
        try:
            # Compare left and right sides by measuring key distances
            center_x = landmarks[1][0]  # Nose tip x-coordinate

            # Sample a few symmetric landmark pairs
            symmetric_pairs = [
                (landmarks[234], landmarks[454]),  # Face outline
                (landmarks[93], landmarks[323]),   # Lower face
                (landmarks[116], landmarks[345]),  # Mid face
            ]

            symmetry_scores = []
            for left_point, right_point in symmetric_pairs:
                left_dist = abs(left_point[0] - center_x)
                right_dist = abs(right_point[0] - center_x)

                if left_dist + right_dist > 0:
                    symmetry = 1.0 - abs(left_dist - right_dist) / (left_dist + right_dist)
                    symmetry_scores.append(symmetry)

            return np.mean(symmetry_scores) if symmetry_scores else 0.8

        except:
            return 0.8  # Default good symmetry

    def _detect_prominent_cheekbones(self, landmarks: list) -> bool:
        """Detect if cheekbones are prominent"""
        try:
            # Calculate cheekbone prominence based on face outline
            cheekbone_left = landmarks[234]
            cheekbone_right = landmarks[454]
            jaw_left = landmarks[172]
            jaw_right = landmarks[397]

            # If cheekbones are wider than jaw, they're prominent
            cheekbone_width = self._distance(cheekbone_left, cheekbone_right)
            jaw_width = self._distance(jaw_left, jaw_right)

            return cheekbone_width > jaw_width * 1.05

        except:
            return False

    def _calculate_eyebrow_arch(self, landmarks: list) -> float:
        """Calculate eyebrow arch prominence"""
        try:
            # Simplified eyebrow arch calculation
            # In a full implementation, you'd need specific eyebrow landmarks
            # For now, return a reasonable default
            return 0.6

        except:
            return 0.6

    def _distance(self, point1: Tuple[int, int], point2: Tuple[int, int]) -> float:
        """Calculate Euclidean distance between two points"""
        return math.sqrt((point1[0] - point2[0])**2 + (point1[1] - point2[1])**2)

    def _extract_face_region(self, image: np.ndarray, landmarks: list) -> np.ndarray:
        """Extract face region from image for color analysis"""
        try:
            # Get bounding box of face
            face_points = [landmarks[i] for i in self.FACE_OVAL]
            xs = [p[0] for p in face_points]
            ys = [p[1] for p in face_points]

            x_min, x_max = min(xs), max(xs)
            y_min, y_max = min(ys), max(ys)

            # Add some padding
            padding = 10
            x_min = max(0, x_min - padding)
            y_min = max(0, y_min - padding)
            x_max = min(image.shape[1], x_max + padding)
            y_max = min(image.shape[0], y_max + padding)

            return image[y_min:y_max, x_min:x_max]

        except:
            # Return center region as fallback
            h, w = image.shape[:2]
            return image[h//4:3*h//4, w//4:3*w//4]