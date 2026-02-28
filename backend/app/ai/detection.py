"""YOLO Detection Service for object detection and bounding box annotation"""

import logging
import cv2
import numpy as np
from pathlib import Path
from typing import List, Dict, Tuple, Optional
from ultralytics import YOLO
from PIL import Image as PILImage

logger = logging.getLogger(__name__)


class DetectionService:
    """Singleton service for YOLOv8 object detection with bounding box annotation"""
    
    _instance = None
    _model = None
    _model_path = 'yolov8n.pt'  # Nano model for faster inference
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        """Initialize the detection service with lazy model loading"""
        self.model = None
        self.device = 'cpu'  # Can be set to 'cuda' if GPU available
        self.conf_threshold = 0.5  # Confidence threshold for detections
    
    def load_model(self, force_reload: bool = False) -> YOLO:
        """
        Lazily load YOLOv8 model on first use
        
        Args:
            force_reload: Force reload even if already loaded
            
        Returns:
            YOLO model instance
        """
        if self.model is None or force_reload:
            logger.info(f"Loading YOLOv8 model: {self._model_path}")
            try:
                self.model = YOLO(self._model_path)
                self.model.to(self.device)
                logger.info("YOLOv8 model loaded successfully")
            except Exception as e:
                logger.error(f"Failed to load YOLO model: {str(e)}")
                raise RuntimeError(f"Failed to load YOLO model: {str(e)}")
        
        return self.model
    
    def detect(self, image_path: str) -> Dict:
        """
        Perform object detection on an image
        
        Args:
            image_path: Path to the image file
            
        Returns:
            Dictionary containing detection results with structure:
            {
                'detections': [
                    {
                        'class': 'person',
                        'class_id': 0,
                        'confidence': 0.95,
                        'bbox': [x1, y1, x2, y2],  # Normalized coordinates
                        'area': 0.15
                    },
                    ...
                ],
                'image_size': [width, height],
                'num_detections': 5
            }
        """
        try:
            model = self.load_model()
            
            # Run inference
            results = model.predict(
                source=image_path,
                conf=self.conf_threshold,
                device=self.device,
                verbose=False
            )
            
            # Extract detections from results
            result = results[0]
            detections = []
            
            if result.boxes is not None:
                for box in result.boxes:
                    # Get bounding box coordinates (normalized)
                    x1, y1, x2, y2 = box.xyxyn[0].tolist()  # Normalized coords
                    
                    # Get class information
                    class_id = int(box.cls[0].item())
                    class_name = model.names[class_id]
                    confidence = float(box.conf[0].item())
                    
                    # Calculate normalized area
                    area = (x2 - x1) * (y2 - y1)
                    
                    detections.append({
                        'class': class_name,
                        'class_id': class_id,
                        'confidence': round(confidence, 4),
                        'bbox': [round(x, 4) for x in [x1, y1, x2, y2]],
                        'area': round(area, 4)
                    })
            
            # Sort by confidence (descending)
            detections.sort(key=lambda x: x['confidence'], reverse=True)
            
            # Get image dimensions
            image_size = [result.orig_img.shape[1], result.orig_img.shape[0]]
            
            return {
                'detections': detections,
                'image_size': image_size,
                'num_detections': len(detections),
                'model': 'yolov8n',
                'confidence_threshold': self.conf_threshold
            }
            
        except Exception as e:
            logger.error(f"Error during detection: {str(e)}")
            raise RuntimeError(f"Detection failed: {str(e)}")
    
    def annotate_image(
        self,
        image_path: str,
        output_path: str,
        detections: Optional[Dict] = None,
        draw_labels: bool = True,
        color_map: Optional[Dict[str, Tuple]] = None
    ) -> str:
        """
        Draw bounding boxes on image and save
        
        Args:
            image_path: Path to input image
            output_path: Path to save annotated image
            detections: Detection results dict. If None, performs detection first
            draw_labels: Whether to draw class labels on boxes
            color_map: Dict mapping class names to RGB tuples
            
        Returns:
            Path to the annotated image
        """
        try:
            # Load image
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError(f"Could not load image: {image_path}")
            
            height, width = image.shape[:2]
            
            # Get detections if not provided
            if detections is None:
                detections = self.detect(image_path)
            
            # Default color palette
            if color_map is None:
                color_map = {
                    'person': (0, 255, 0),      # Green
                    'car': (0, 0, 255),         # Red
                    'dog': (255, 0, 0),         # Blue
                    'cat': (255, 165, 0),       # Orange
                }
            
            # Draw bounding boxes
            for detection in detections['detections']:
                x1, y1, x2, y2 = detection['bbox']
                
                # Convert normalized coords to pixel coords
                x1_px = int(x1 * width)
                y1_px = int(y1 * height)
                x2_px = int(x2 * width)
                y2_px = int(y2 * height)
                
                # Get color for this class
                class_name = detection['class']
                color = color_map.get(class_name, (0, 255, 255))  # Cyan as default
                
                # Draw bounding box
                cv2.rectangle(image, (x1_px, y1_px), (x2_px, y2_px), color, 2)
                
                # Draw label if requested
                if draw_labels:
                    label = f"{class_name} {detection['confidence']:.2f}"
                    font = cv2.FONT_HERSHEY_SIMPLEX
                    font_scale = 0.5
                    thickness = 1
                    
                    # Get text size to draw background
                    text_size = cv2.getTextSize(label, font, font_scale, thickness)[0]
                    
                    # Draw background rectangle for text
                    cv2.rectangle(
                        image,
                        (x1_px, y1_px - text_size[1] - 4),
                        (x1_px + text_size[0], y1_px),
                        color,
                        -1
                    )
                    
                    # Draw text
                    cv2.putText(
                        image,
                        label,
                        (x1_px, y1_px - 2),
                        font,
                        font_scale,
                        (255, 255, 255),
                        thickness
                    )
            
            # Create output directory if needed
            Path(output_path).parent.mkdir(parents=True, exist_ok=True)
            
            # Save annotated image
            cv2.imwrite(output_path, image)
            logger.info(f"Annotated image saved to {output_path}")
            
            return output_path
            
        except Exception as e:
            logger.error(f"Error annotating image: {str(e)}")
            raise RuntimeError(f"Failed to annotate image: {str(e)}")
    
    def batch_detect(self, image_paths: List[str]) -> List[Dict]:
        """
        Perform batch detection on multiple images
        
        Args:
            image_paths: List of image file paths
            
        Returns:
            List of detection result dictionaries
        """
        results = []
        for image_path in image_paths:
            try:
                result = self.detect(image_path)
                results.append({'image_path': image_path, 'result': result})
            except Exception as e:
                logger.error(f"Batch detection failed for {image_path}: {str(e)}")
                results.append({'image_path': image_path, 'error': str(e)})
        
        return results


# Singleton instance
_detection_service = None


def get_detection_service() -> DetectionService:
    """Get or create the singleton DetectionService instance"""
    global _detection_service
    if _detection_service is None:
        _detection_service = DetectionService()
    return _detection_service
