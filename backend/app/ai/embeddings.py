import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from sklearn.preprocessing import normalize
import logging
from io import BytesIO
from PIL import Image as PILImage

logger = logging.getLogger(__name__)


class EmbeddingService:
    """Service for generating image embeddings using MobileNetV2"""
    
    def __init__(self, model_name='mobilenetv2', embedding_dim=1280):
        """Initialize embedding service with pretrained model"""
        self.model_name = model_name
        self.embedding_dim = embedding_dim
        self.model = None
        self.feature_extractor = None
        self._initialize_model()
    
    def _initialize_model(self):
        """Initialize MobileNetV2 for feature extraction"""
        try:
            logger.info(f"Loading {self.model_name} model...")
            
            # Load pretrained MobileNetV2
            base_model = MobileNetV2(
                input_shape=(224, 224, 3),
                include_top=False,
                weights='imagenet'
            )
            
            # Freeze base model weights
            base_model.trainable = False
            
            # Create feature extractor (output from global average pooling)
            self.feature_extractor = tf.keras.Sequential([
                base_model,
                tf.keras.layers.GlobalAveragePooling2D()
            ])
            
            self.model = base_model
            logger.info(f"{self.model_name} model loaded successfully")
            
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            raise
    
    def preprocess_image(self, image_path):
        """Preprocess image for model input"""
        try:
            # Load image
            img = image.load_img(image_path, target_size=(224, 224))
            img_array = image.img_to_array(img)
            img_array = np.expand_dims(img_array, axis=0)
            img_array = preprocess_input(img_array)
            
            return img_array
        except Exception as e:
            logger.error(f"Error preprocessing image: {str(e)}")
            raise
    
    def preprocess_image_from_bytes(self, image_bytes):
        """Preprocess image from bytes"""
        try:
            # Load image from bytes
            img = PILImage.open(BytesIO(image_bytes)).convert('RGB')
            img = img.resize((224, 224))
            img_array = np.array(img)
            img_array = np.expand_dims(img_array, axis=0)
            img_array = preprocess_input(img_array)
            
            return img_array
        except Exception as e:
            logger.error(f"Error preprocessing image from bytes: {str(e)}")
            raise
    
    def extract_embedding(self, image_path=None, image_bytes=None):
        """Extract feature embedding from image"""
        try:
            # Preprocess image
            if image_path:
                img_array = self.preprocess_image(image_path)
            elif image_bytes:
                img_array = self.preprocess_image_from_bytes(image_bytes)
            else:
                raise ValueError("Either image_path or image_bytes must be provided")
            
            # Extract features
            embedding = self.feature_extractor.predict(img_array, verbose=0)
            
            # Normalize embedding
            embedding = normalize(embedding, norm='l2')[0]
            
            logger.info(f"Embedding extracted: shape={embedding.shape}, dtype={embedding.dtype}")
            
            return embedding.astype(np.float32)
        
        except Exception as e:
            logger.error(f"Error extracting embedding: {str(e)}")
            raise
    
    def batch_extract_embeddings(self, image_paths):
        """Extract embeddings for multiple images"""
        embeddings = []
        
        for image_path in image_paths:
            try:
                embedding = self.extract_embedding(image_path=image_path)
                embeddings.append(embedding)
            except Exception as e:
                logger.error(f"Error processing {image_path}: {str(e)}")
                embeddings.append(None)
        
        return np.array(embeddings)
    
    def get_embedding_dimension(self):
        """Get embedding dimension"""
        return self.embedding_dim


# Global embedding service instance
_embedding_service = None


def get_embedding_service():
    """Get or create embedding service"""
    global _embedding_service
    if _embedding_service is None:
        _embedding_service = EmbeddingService()
    return _embedding_service


def init_embedding_service(model_name='mobilenetv2', embedding_dim=1280):
    """Initialize embedding service"""
    global _embedding_service
    _embedding_service = EmbeddingService(model_name=model_name, embedding_dim=embedding_dim)
    return _embedding_service
