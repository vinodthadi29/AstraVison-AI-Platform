"""Configuration for AI services (Detection, Grad-CAM, Embeddings)"""

import os
from typing import Dict, List, Optional


class AIConfig:
    """Centralized configuration for AI services"""
    
    # YOLO Detection Configuration
    YOLO_MODEL_NAME = os.getenv('YOLO_MODEL_NAME', 'yolov8n.pt')  # nano, small, medium, large
    YOLO_CONFIDENCE_THRESHOLD = float(os.getenv('YOLO_CONFIDENCE_THRESHOLD', '0.5'))
    YOLO_IOU_THRESHOLD = float(os.getenv('YOLO_IOU_THRESHOLD', '0.45'))
    YOLO_DEVICE = os.getenv('YOLO_DEVICE', 'cpu')  # cpu or cuda
    YOLO_VERBOSE = os.getenv('YOLO_VERBOSE', 'False').lower() == 'true'
    
    # Detection color palette for bounding boxes (RGB format)
    DETECTION_COLORS: Dict[str, tuple] = {
        'person': (0, 255, 0),      # Green
        'car': (0, 0, 255),         # Red
        'truck': (0, 165, 255),     # Orange
        'bus': (255, 0, 0),         # Blue
        'bicycle': (255, 255, 0),   # Cyan
        'motorcycle': (255, 0, 255), # Magenta
        'dog': (0, 255, 255),       # Yellow
        'cat': (128, 0, 128),       # Purple
        'horse': (165, 42, 42),     # Brown
        'sheep': (192, 192, 192),   # Gray
    }
    DEFAULT_DETECTION_COLOR = (0, 255, 255)  # Cyan as fallback
    
    # Grad-CAM Configuration
    GRADCAM_MODEL_NAME = os.getenv('GRADCAM_MODEL_NAME', 'mobilenetv2')
    GRADCAM_DEVICE = os.getenv('GRADCAM_DEVICE', 'cpu')  # cpu or cuda
    GRADCAM_BLEND_ALPHA = float(os.getenv('GRADCAM_BLEND_ALPHA', '0.4'))  # 0-1
    GRADCAM_COLORMAP = os.getenv('GRADCAM_COLORMAP', 'jet')  # jet, hot, cool, viridis, plasma, turbo
    GRADCAM_INPUT_SIZE = 224  # MobileNetV2 input size
    
    # Valid colormaps for heatmaps
    VALID_COLORMAPS = ['jet', 'hot', 'cool', 'viridis', 'plasma', 'turbo']
    
    # Embedding Configuration
    EMBEDDING_MODEL_NAME = os.getenv('EMBEDDING_MODEL_NAME', 'mobilenetv2')
    EMBEDDING_LAYER = os.getenv('EMBEDDING_LAYER', 'avg_pool')
    EMBEDDING_DIMENSION = 1280  # MobileNetV2 feature vector dimension
    
    # Processing Configuration
    AUTO_PROCESS_ON_UPLOAD = os.getenv('AUTO_PROCESS_ON_UPLOAD', 'False').lower() == 'true'
    AUTO_PROCESS_DETECTION = os.getenv('AUTO_PROCESS_DETECTION', 'False').lower() == 'true'
    AUTO_PROCESS_HEATMAP = os.getenv('AUTO_PROCESS_HEATMAP', 'False').lower() == 'true'
    AUTO_CREATE_ANNOTATED_IMAGE = os.getenv('AUTO_CREATE_ANNOTATED_IMAGE', 'True').lower() == 'true'
    
    # File Management
    UPLOADS_FOLDER = os.getenv('UPLOADS_FOLDER', './uploads')
    HEATMAPS_FOLDER = os.path.join(UPLOADS_FOLDER, 'heatmaps')
    ANNOTATED_FOLDER = os.path.join(UPLOADS_FOLDER, 'annotated')
    ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff'}
    
    # Model caching
    CACHE_MODELS = os.getenv('CACHE_MODELS', 'True').lower() == 'true'
    MODEL_CACHE_DIR = os.getenv('MODEL_CACHE_DIR', './models_cache')
    
    # Performance & Limits
    MAX_IMAGE_SIZE_MB = int(os.getenv('MAX_IMAGE_SIZE_MB', '50'))
    MAX_DETECTION_TIME_MS = int(os.getenv('MAX_DETECTION_TIME_MS', '30000'))
    MAX_HEATMAP_TIME_MS = int(os.getenv('MAX_HEATMAP_TIME_MS', '60000'))
    BATCH_PROCESSING_SIZE = int(os.getenv('BATCH_PROCESSING_SIZE', '5'))
    
    # Logging
    LOG_AI_OPERATIONS = os.getenv('LOG_AI_OPERATIONS', 'True').lower() == 'true'
    LOG_PERFORMANCE_METRICS = os.getenv('LOG_PERFORMANCE_METRICS', 'True').lower() == 'true'
    
    @classmethod
    def validate_colormap(cls, colormap: str) -> bool:
        """Validate if colormap is supported"""
        return colormap.lower() in cls.VALID_COLORMAPS
    
    @classmethod
    def get_detection_color(cls, class_name: str) -> tuple:
        """Get color for a detection class"""
        return cls.DETECTION_COLORS.get(class_name.lower(), cls.DEFAULT_DETECTION_COLOR)
    
    @classmethod
    def initialize_folders(cls) -> None:
        """Initialize required folders"""
        import os
        os.makedirs(cls.UPLOADS_FOLDER, exist_ok=True)
        os.makedirs(cls.HEATMAPS_FOLDER, exist_ok=True)
        os.makedirs(cls.ANNOTATED_FOLDER, exist_ok=True)
        os.makedirs(cls.MODEL_CACHE_DIR, exist_ok=True)
    
    @classmethod
    def to_dict(cls) -> Dict:
        """Convert configuration to dictionary"""
        return {
            'yolo_model': cls.YOLO_MODEL_NAME,
            'yolo_confidence': cls.YOLO_CONFIDENCE_THRESHOLD,
            'yolo_device': cls.YOLO_DEVICE,
            'gradcam_model': cls.GRADCAM_MODEL_NAME,
            'gradcam_blend_alpha': cls.GRADCAM_BLEND_ALPHA,
            'gradcam_colormap': cls.GRADCAM_COLORMAP,
            'embedding_model': cls.EMBEDDING_MODEL_NAME,
            'embedding_dimension': cls.EMBEDDING_DIMENSION,
            'auto_process_on_upload': cls.AUTO_PROCESS_ON_UPLOAD,
            'auto_process_detection': cls.AUTO_PROCESS_DETECTION,
            'auto_process_heatmap': cls.AUTO_PROCESS_HEATMAP,
            'max_image_size_mb': cls.MAX_IMAGE_SIZE_MB,
            'uploads_folder': cls.UPLOADS_FOLDER,
        }


def get_ai_config() -> AIConfig:
    """Get AI configuration instance"""
    return AIConfig()
