from app.models import Image
from app.extensions import db
from app.ai import get_embedding_service
import logging
import os
from werkzeug.utils import secure_filename
from datetime import datetime
import numpy as np
from PIL import Image as PILImage

logger = logging.getLogger(__name__)


class ImageService:
    """Service for handling image operations"""
    
    def __init__(self, upload_folder='./uploads', allowed_extensions=None):
        """Initialize image service"""
        self.upload_folder = upload_folder
        self.allowed_extensions = allowed_extensions or {'jpg', 'jpeg', 'png', 'gif', 'webp'}
        
        # Create upload folder if it doesn't exist
        os.makedirs(upload_folder, exist_ok=True)
    
    def allowed_file(self, filename):
        """Check if file is allowed"""
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in self.allowed_extensions
    
    def get_file_extension(self, filename):
        """Get file extension"""
        return filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    
    def save_uploaded_file(self, file, user_id):
        """Save uploaded file and create image record"""
        try:
            if not file or file.filename == '':
                return None, "No file selected"
            
            if not self.allowed_file(file.filename):
                return None, "File type not allowed"
            
            # Create secure filename
            filename = secure_filename(file.filename)
            timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S_')
            filename = timestamp + filename
            
            # Create user-specific folder
            user_folder = os.path.join(self.upload_folder, str(user_id))
            os.makedirs(user_folder, exist_ok=True)
            
            # Save file
            file_path = os.path.join(user_folder, filename)
            file.save(file_path)
            
            # Get file info
            file_size = os.path.getsize(file_path)
            mime_type = file.content_type or f'image/{self.get_file_extension(filename)}'
            
            # Get image dimensions
            try:
                img = PILImage.open(file_path)
                width, height = img.size
            except:
                width, height = None, None
            
            # Create image record
            image = Image(
                user_id=user_id,
                filename=file.filename,
                file_path=file_path,
                file_size=file_size,
                mime_type=mime_type,
                width=width,
                height=height
            )
            
            db.session.add(image)
            db.session.commit()
            
            logger.info(f"File saved: {file_path} for user {user_id}")
            return image, None
        
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error saving file: {str(e)}")
            return None, str(e)
    
    def process_image_embedding(self, image_id, user_id):
        """Process image and generate embedding"""
        try:
            image = Image.query.filter_by(id=image_id, user_id=user_id).first()
            if not image:
                return False, "Image not found"
            
            if not os.path.exists(image.file_path):
                return False, "Image file not found"
            
            # Get embedding service
            embedding_service = get_embedding_service()
            
            # Extract embedding
            embedding = embedding_service.extract_embedding(image_path=image.file_path)
            
            # Serialize and save embedding
            image.embedding = embedding.astype(np.float32).tobytes()
            image.processed_at = datetime.utcnow()
            
            db.session.commit()
            
            logger.info(f"Embedding generated for image {image_id}")
            return True, None
        
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error processing embedding: {str(e)}")
            return False, str(e)
    
    def get_image(self, image_id, user_id):
        """Get image by ID"""
        try:
            image = Image.query.filter_by(id=image_id, user_id=user_id).first()
            return image
        except Exception as e:
            logger.error(f"Error getting image: {str(e)}")
            return None
    
    def get_user_images(self, user_id, limit=100, offset=0):
        """Get all images for user"""
        try:
            images = Image.query.filter_by(user_id=user_id)\
                .order_by(Image.uploaded_at.desc())\
                .limit(limit)\
                .offset(offset)\
                .all()
            
            return images
        except Exception as e:
            logger.error(f"Error getting user images: {str(e)}")
            return []
    
    def delete_image(self, image_id, user_id):
        """Delete image"""
        try:
            image = Image.query.filter_by(id=image_id, user_id=user_id).first()
            if not image:
                return False, "Image not found"
            
            # Delete file from disk
            if os.path.exists(image.file_path):
                try:
                    os.remove(image.file_path)
                except Exception as e:
                    logger.warning(f"Could not delete file: {str(e)}")
            
            # Delete from database
            db.session.delete(image)
            db.session.commit()
            
            logger.info(f"Image {image_id} deleted")
            return True, None
        
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error deleting image: {str(e)}")
            return False, str(e)
    
    def batch_process_embeddings(self, user_id):
        """Process embeddings for all unprocessed images"""
        try:
            images = Image.query.filter_by(user_id=user_id)\
                .filter(Image.processed_at.is_(None))\
                .all()
            
            processed_count = 0
            for image in images:
                success, error = self.process_image_embedding(image.id, user_id)
                if success:
                    processed_count += 1
            
            logger.info(f"Processed {processed_count} images for user {user_id}")
            return processed_count
        
        except Exception as e:
            logger.error(f"Error in batch processing: {str(e)}")
            return 0
