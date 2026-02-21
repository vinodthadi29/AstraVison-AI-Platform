#!/usr/bin/env python3
"""
Seed script to populate the AstraVision database with 100+ sample images and real embeddings.
This script generates random embeddings using MobileNetV2 dimension (1280) and creates diverse test images.
"""

import os
import sys
import uuid
import logging
from datetime import datetime
import numpy as np
from PIL import Image, ImageDraw
import io

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def generate_test_image(width=256, height=256, image_type='color', seed=None):
    """Generate a test image with various patterns."""
    if seed is not None:
        np.random.seed(seed)
    
    if image_type == 'color':
        # Random colored blocks
        data = np.random.randint(0, 256, (height, width, 3), dtype=np.uint8)
    elif image_type == 'gradient':
        # Gradient from left to right
        data = np.zeros((height, width, 3), dtype=np.uint8)
        for i in range(width):
            data[:, i] = [int(255 * i / width), 100, 150]
    elif image_type == 'geometric':
        # Geometric patterns
        img = Image.new('RGB', (width, height), color=(20, 20, 20))
        draw = ImageDraw.Draw(img)
        
        np.random.seed(seed)
        for _ in range(np.random.randint(3, 8)):
            x = np.random.randint(0, width)
            y = np.random.randint(0, height)
            size = np.random.randint(20, 80)
            color = tuple(np.random.randint(100, 256, 3))
            draw.rectangle([x, y, x + size, y + size], fill=color, outline=color)
        
        return img
    elif image_type == 'noise':
        # Pure noise
        data = np.random.randint(0, 256, (height, width, 3), dtype=np.uint8)
    else:
        data = np.random.randint(0, 256, (height, width, 3), dtype=np.uint8)
    
    return Image.fromarray(data)


def generate_realistic_embedding(image_type, variation=0):
    """Generate a semi-realistic embedding based on image type."""
    base_embeddings = {
        'color': np.random.normal(0.5, 0.2, 1280),
        'gradient': np.random.normal(0.3, 0.25, 1280),
        'geometric': np.random.normal(0.7, 0.15, 1280),
        'noise': np.random.normal(0.2, 0.3, 1280),
    }
    
    # Add variation to make similar images cluster
    embedding = base_embeddings.get(image_type, np.random.normal(0.5, 0.2, 1280))
    embedding += np.random.normal(0, 0.05 * variation, 1280)
    
    # Normalize to unit vector (L2 normalization)
    embedding = embedding / (np.linalg.norm(embedding) + 1e-8)
    
    # Clip to valid range
    embedding = np.clip(embedding, -1, 1).astype(np.float32)
    
    return embedding.tolist()


def seed_database():
    """Seed the database with test images and embeddings."""
    try:
        # Import after path is set
        from app import create_app
        from app.extensions import db
        from app.models import User, Image as ImageModel
        
        logger.info("Initializing Flask application...")
        app = create_app()
        
        with app.app_context():
            logger.info("Creating test user...")
            # Create test user
            test_user = User(
                id=uuid.uuid4(),
                email='testuser@astravision.local',
                password_hash='$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5YmMxSUmGEJhe',  # password: test123
                first_name='Test',
                last_name='User'
            )
            
            try:
                db.session.add(test_user)
                db.session.commit()
                logger.info(f"Created test user: {test_user.email}")
            except Exception as e:
                logger.warning(f"Test user might already exist: {e}")
                db.session.rollback()
                # Query existing user
                test_user = User.query.filter_by(email='testuser@astravision.local').first()
                if not test_user:
                    raise
            
            # Create uploads directory
            uploads_dir = os.path.join(os.path.dirname(__file__), '..', 'uploads')
            os.makedirs(uploads_dir, exist_ok=True)
            
            logger.info("Generating 100+ test images with embeddings...")
            
            image_types = ['color', 'gradient', 'geometric', 'noise']
            total_images = 0
            
            for type_idx, img_type in enumerate(image_types):
                for variation in range(25):
                    image_id = uuid.uuid4()
                    filename = f"test_{img_type}_{variation}.png"
                    filepath = os.path.join(uploads_dir, filename)
                    
                    # Generate test image
                    test_image = generate_test_image(
                        image_type=img_type,
                        seed=type_idx * 1000 + variation
                    )
                    test_image.save(filepath)
                    
                    # Generate realistic embedding
                    embedding = generate_realistic_embedding(img_type, variation / 25.0)
                    
                    # Create image record
                    img_model = ImageModel(
                        id=image_id,
                        user_id=test_user.id,
                        filename=filename,
                        file_path=filepath,
                        file_size=os.path.getsize(filepath),
                        mime_type='image/png',
                        embedding=embedding,
                        embedding_processed=True,
                        created_at=datetime.utcnow()
                    )
                    
                    try:
                        db.session.add(img_model)
                        total_images += 1
                        
                        if total_images % 10 == 0:
                            db.session.commit()
                            logger.info(f"Committed {total_images} images...")
                    except Exception as e:
                        logger.error(f"Error adding image {filename}: {e}")
                        db.session.rollback()
            
            # Final commit
            db.session.commit()
            logger.info(f"Successfully seeded database with {total_images} images!")
            
            # Verify
            image_count = ImageModel.query.filter_by(user_id=test_user.id).count()
            logger.info(f"Verified: {image_count} images in database for test user")
            
            return True
            
    except Exception as e:
        logger.error(f"Error seeding database: {e}", exc_info=True)
        return False


if __name__ == '__main__':
    success = seed_database()
    sys.exit(0 if success else 1)
