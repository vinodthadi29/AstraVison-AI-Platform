from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_limiter.util import get_remote_address
from app.services import ImageService
from app.ai import get_similarity_service, get_detection_service, get_gradcam_service
from app.extensions import limiter, db
from app.models import Image
from marshmallow import Schema, fields, ValidationError
import logging
import os
import time

logger = logging.getLogger(__name__)

images_bp = Blueprint('images', __name__, url_prefix='/api/images')

# Initialize services
image_service = ImageService(upload_folder='./uploads', 
                             allowed_extensions={'jpg', 'jpeg', 'png', 'gif', 'webp'})
similarity_service = get_similarity_service()
detection_service = get_detection_service()
gradcam_service = get_gradcam_service()


# Validation schemas
class SearchSchema(Schema):
    image_id = fields.UUID(required=True)
    num_results = fields.Int(missing=10, validate=lambda x: 1 <= x <= 100)
    similarity_threshold = fields.Float(missing=0.3, validate=lambda x: 0 <= x <= 1)


search_schema = SearchSchema()


@images_bp.route('/upload', methods=['POST'])
@jwt_required()
@limiter.limit("10/hour")
def upload_image():
    """Upload and process an image"""
    try:
        user_id = get_jwt_identity()
        
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        # Save file
        image, error = image_service.save_uploaded_file(file, user_id)
        if error:
            return jsonify({'success': False, 'error': error}), 400
        
        # Process embedding (asynchronously in production)
        success, error = image_service.process_image_embedding(image.id, user_id)
        if not success:
            logger.warning(f"Failed to process embedding: {error}")
            # Don't fail the upload, embedding can be processed later
        
        img_dict = image.to_dict()
        return jsonify({
            'success': True,
            'data': {
                'id': str(image.id),
                'filename': image.filename,
                'user_id': str(image.user_id),
                'embedding': img_dict.get('embedding', []),
                'created_at': image.created_at.isoformat(),
                'size': image.file_size
            }
        }), 201
    
    except Exception as e:
        logger.error(f"Error in upload_image: {str(e)}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500


@images_bp.route('/<image_id>', methods=['GET'])
@jwt_required()
def get_image(image_id):
    """Get image details"""
    try:
        user_id = get_jwt_identity()
        image = image_service.get_image(image_id, user_id)
        
        if not image:
            return jsonify({'error': 'Image not found'}), 404
        
        return jsonify({
            'image': image.to_dict()
        }), 200
    
    except Exception as e:
        logger.error(f"Error in get_image: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@images_bp.route('', methods=['GET'])
@jwt_required()
def list_images():
    """List user's images"""
    try:
        user_id = get_jwt_identity()
        limit = request.args.get('limit', 100, type=int)
        offset = request.args.get('offset', 0, type=int)
        
        images = image_service.get_user_images(user_id, limit=limit, offset=offset)
        
        return jsonify({
            'images': [img.to_dict() for img in images],
            'count': len(images)
        }), 200
    
    except Exception as e:
        logger.error(f"Error in list_images: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@images_bp.route('/<image_id>', methods=['DELETE'])
@jwt_required()
def delete_image(image_id):
    """Delete an image"""
    try:
        user_id = get_jwt_identity()
        success, error = image_service.delete_image(image_id, user_id)
        
        if not success:
            return jsonify({'error': error}), 404
        
        return jsonify({
            'message': 'Image deleted successfully'
        }), 200
    
    except Exception as e:
        logger.error(f"Error in delete_image: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@images_bp.route('/search', methods=['POST'])
@jwt_required()
@limiter.limit("50/hour")
def search_similar():
    """Search for visually similar images"""
    try:
        user_id = get_jwt_identity()
        
        # Validate request data
        try:
            data = search_schema.load(request.get_json())
        except ValidationError as err:
            return jsonify({'error': err.messages}), 400
        
        # Perform similarity search
        results, execution_time = similarity_service.search_similar_images(
            user_id=user_id,
            query_image_id=data['image_id'],
            num_results=data['num_results'],
            similarity_threshold=data['similarity_threshold']
        )
        
        if results is None:
            return jsonify({'error': execution_time}), 400
        
        # Save search results to database
        search = similarity_service.save_search_results(
            user_id=user_id,
            query_image_id=data['image_id'],
            results=results,
            execution_time=execution_time,
            num_results=data['num_results'],
            similarity_threshold=data['similarity_threshold']
        )
        
        return jsonify({
            'search_id': str(search.id),
            'query_image_id': str(data['image_id']),
            'num_results': len(results),
            'execution_time_ms': execution_time,
            'results': [
                {
                    'image': result['image'].to_dict(),
                    'similarity_score': result['score']
                }
                for result in results
            ]
        }), 200
    
    except Exception as e:
        logger.error(f"Error in search_similar: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@images_bp.route('/history', methods=['GET'])
@jwt_required()
def search_history():
    """Get search history"""
    try:
        user_id = get_jwt_identity()
        limit = request.args.get('limit', 50, type=int)
        
        searches = similarity_service.get_search_history(user_id, limit=limit)
        
        return jsonify({
            'searches': searches,
            'count': len(searches)
        }), 200
    
    except Exception as e:
        logger.error(f"Error in search_history: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@images_bp.route('/file/<image_id>', methods=['GET'])
@jwt_required()
def download_image(image_id):
    """Download image file"""
    try:
        user_id = get_jwt_identity()
        image = image_service.get_image(image_id, user_id)
        
        if not image:
            return jsonify({'success': False, 'error': 'Image not found'}), 404
        
        if not os.path.exists(image.file_path):
            return jsonify({'success': False, 'error': 'Image file not found'}), 404
        
        return send_file(image.file_path, as_attachment=True)
    
    except Exception as e:
        logger.error(f"Error in download_image: {str(e)}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500


@images_bp.route('/search/upload', methods=['POST'])
@jwt_required()
@limiter.limit("50/hour")
def search_by_upload():
    """Upload an image and search for similar images"""
    try:
        user_id = get_jwt_identity()
        limit = request.form.get('limit', 6, type=int)
        
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        import time
        start_time = time.time()
        
        # Save the uploaded file temporarily
        temp_image, error = image_service.save_uploaded_file(file, user_id)
        if error:
            return jsonify({'success': False, 'error': error}), 400
        
        # Process embedding for the uploaded image
        success, error = image_service.process_image_embedding(temp_image.id, user_id)
        if not success:
            logger.warning(f"Failed to process embedding for search: {error}")
            return jsonify({'success': False, 'error': 'Failed to process image'}), 400
        
        # Perform similarity search
        results, execution_time = similarity_service.search_similar_images(
            user_id=user_id,
            query_image_id=str(temp_image.id),
            num_results=limit,
            similarity_threshold=0.3
        )
        
        if results is None:
            return jsonify({'success': False, 'error': 'Search failed'}), 400
        
        processing_time_ms = int((time.time() - start_time) * 1000)
        
        # Format results for frontend
        formatted_results = []
        for result in results:
            img = result['image']
            formatted_results.append({
                'id': str(img.id),
                'filename': img.filename,
                'similarity_score': float(result['score']) * 100,  # Convert to percentage
                'created_at': img.created_at.isoformat(),
                'size': img.file_size
            })
        
        return jsonify({
            'success': True,
            'data': {
                'query_image_id': str(temp_image.id),
                'results': formatted_results,
                'processing_time_ms': processing_time_ms
            }
        }), 200
    
    except Exception as e:
        logger.error(f"Error in search_by_upload: {str(e)}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500


@images_bp.route('/search', methods=['POST'])
@jwt_required()
@limiter.limit("50/hour")
def search_similar():
    """Search for visually similar images using image_id query param"""
    try:
        user_id = get_jwt_identity()
        image_id = request.args.get('image_id')
        limit = request.args.get('limit', 6, type=int)
        
        if not image_id:
            return jsonify({'success': False, 'error': 'image_id parameter required'}), 400
        
        import time
        start_time = time.time()
        
        # Verify image belongs to user
        image = image_service.get_image(image_id, user_id)
        if not image:
            return jsonify({'success': False, 'error': 'Image not found'}), 404
        
        # Perform similarity search
        results, execution_time = similarity_service.search_similar_images(
            user_id=user_id,
            query_image_id=image_id,
            num_results=limit,
            similarity_threshold=0.3
        )
        
        if results is None:
            return jsonify({'success': False, 'error': 'Search failed'}), 400
        
        processing_time_ms = int((time.time() - start_time) * 1000)
        
        # Format results for frontend
        formatted_results = []
        for result in results:
            img = result['image']
            formatted_results.append({
                'id': str(img.id),
                'filename': img.filename,
                'similarity_score': float(result['score']) * 100,  # Convert to percentage
                'created_at': img.created_at.isoformat(),
                'size': img.file_size
            })
        
        return jsonify({
            'success': True,
            'data': {
                'query_image_id': image_id,
                'results': formatted_results,
                'processing_time_ms': processing_time_ms
            }
        }), 200
    
    except Exception as e:
        logger.error(f"Error in search_similar: {str(e)}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500


@images_bp.route('/detect/<image_id>', methods=['POST'])
@jwt_required()
@limiter.limit("30/hour")
def detect_objects(image_id):
    """Perform YOLO object detection on an image"""
    try:
        user_id = get_jwt_identity()
        
        # Verify image belongs to user and get image record
        image = image_service.get_image(image_id, user_id)
        if not image:
            return jsonify({'success': False, 'error': 'Image not found'}), 404
        
        start_time = time.time()
        
        # Perform detection
        detection_results = detection_service.detect(image.file_path)
        
        # Update image with detection results
        image.detected_objects = detection_results
        image.processed_at = db.func.now()
        db.session.commit()
        
        execution_time = int((time.time() - start_time) * 1000)
        
        return jsonify({
            'success': True,
            'data': {
                'image_id': str(image.id),
                'detections': detection_results['detections'],
                'num_detections': detection_results['num_detections'],
                'image_size': detection_results['image_size'],
                'execution_time_ms': execution_time
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error in detect_objects: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@images_bp.route('/detect-annotated/<image_id>', methods=['POST'])
@jwt_required()
@limiter.limit("20/hour")
def detect_and_annotate(image_id):
    """Perform YOLO detection and return annotated image"""
    try:
        user_id = get_jwt_identity()
        
        # Verify image belongs to user
        image = image_service.get_image(image_id, user_id)
        if not image:
            return jsonify({'success': False, 'error': 'Image not found'}), 404
        
        start_time = time.time()
        
        # Perform detection
        detection_results = detection_service.detect(image.file_path)
        
        # Generate annotated image with bounding boxes
        annotated_path = f"./uploads/annotated/{image.id}_detected.png"
        detection_service.annotate_image(
            image_path=image.file_path,
            output_path=annotated_path,
            detections=detection_results,
            draw_labels=True
        )
        
        # Update image record
        image.detected_objects = detection_results
        image.processed_at = db.func.now()
        db.session.commit()
        
        execution_time = int((time.time() - start_time) * 1000)
        
        return jsonify({
            'success': True,
            'data': {
                'image_id': str(image.id),
                'detections': detection_results['detections'],
                'num_detections': detection_results['num_detections'],
                'annotated_image_path': annotated_path,
                'execution_time_ms': execution_time
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error in detect_and_annotate: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@images_bp.route('/heatmap/<image_id>', methods=['POST'])
@jwt_required()
@limiter.limit("20/hour")
def generate_heatmap(image_id):
    """Generate Grad-CAM heatmap for model explainability"""
    try:
        user_id = get_jwt_identity()
        
        # Verify image belongs to user
        image = image_service.get_image(image_id, user_id)
        if not image:
            return jsonify({'success': False, 'error': 'Image not found'}), 404
        
        start_time = time.time()
        
        # Get parameters
        blend_alpha = request.json.get('blend_alpha', 0.4) if request.json else 0.4
        colormap = request.json.get('colormap', 'jet') if request.json else 'jet'
        
        # Validate parameters
        if not (0 <= blend_alpha <= 1):
            return jsonify({'success': False, 'error': 'blend_alpha must be between 0 and 1'}), 400
        
        # Generate heatmap
        heatmap_image, heatmap_path = gradcam_service.generate_heatmap(
            image_path=image.file_path,
            output_path=f"./uploads/heatmaps/{image.id}_gradcam.png",
            blend_alpha=blend_alpha,
            colormap=colormap
        )
        
        # Update image record
        image.heatmap_path = heatmap_path
        image.processed_at = db.func.now()
        db.session.commit()
        
        execution_time = int((time.time() - start_time) * 1000)
        
        return jsonify({
            'success': True,
            'data': {
                'image_id': str(image.id),
                'heatmap_path': heatmap_path,
                'blend_alpha': blend_alpha,
                'colormap': colormap,
                'execution_time_ms': execution_time
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error in generate_heatmap: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@images_bp.route('/full-analysis/<image_id>', methods=['POST'])
@jwt_required()
@limiter.limit("10/hour")
def full_image_analysis(image_id):
    """Perform complete image analysis: detection + heatmap generation"""
    try:
        user_id = get_jwt_identity()
        
        # Verify image belongs to user
        image = image_service.get_image(image_id, user_id)
        if not image:
            return jsonify({'success': False, 'error': 'Image not found'}), 404
        
        start_time = time.time()
        
        # Step 1: Object Detection
        detection_results = detection_service.detect(image.file_path)
        
        # Step 2: Annotate with detections
        annotated_path = f"./uploads/annotated/{image.id}_detected.png"
        detection_service.annotate_image(
            image_path=image.file_path,
            output_path=annotated_path,
            detections=detection_results,
            draw_labels=True
        )
        
        # Step 3: Generate Grad-CAM heatmap
        heatmap_image, heatmap_path = gradcam_service.generate_heatmap(
            image_path=image.file_path,
            output_path=f"./uploads/heatmaps/{image.id}_gradcam.png",
            blend_alpha=0.4,
            colormap='jet'
        )
        
        # Update image record with all results
        image.detected_objects = detection_results
        image.heatmap_path = heatmap_path
        image.processed_at = db.func.now()
        db.session.commit()
        
        execution_time = int((time.time() - start_time) * 1000)
        
        return jsonify({
            'success': True,
            'data': {
                'image_id': str(image.id),
                'detections': detection_results['detections'],
                'num_detections': detection_results['num_detections'],
                'annotated_image_path': annotated_path,
                'heatmap_path': heatmap_path,
                'total_execution_time_ms': execution_time
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error in full_image_analysis: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@images_bp.route('/heatmap-file/<image_id>', methods=['GET'])
@jwt_required()
def get_heatmap_file(image_id):
    """Download heatmap image file"""
    try:
        user_id = get_jwt_identity()
        
        # Verify image belongs to user
        image = image_service.get_image(image_id, user_id)
        if not image:
            return jsonify({'success': False, 'error': 'Image not found'}), 404
        
        if not image.heatmap_path:
            return jsonify({'success': False, 'error': 'No heatmap generated for this image'}), 404
        
        if not os.path.exists(image.heatmap_path):
            return jsonify({'success': False, 'error': 'Heatmap file not found'}), 404
        
        return send_file(image.heatmap_path, as_attachment=True, download_name=f"{image.id}_heatmap.png")
        
    except Exception as e:
        logger.error(f"Error in get_heatmap_file: {str(e)}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500


@images_bp.route('/annotated-file/<image_id>', methods=['GET'])
@jwt_required()
def get_annotated_file(image_id):
    """Download annotated detection image"""
    try:
        user_id = get_jwt_identity()
        
        # Verify image belongs to user
        image = image_service.get_image(image_id, user_id)
        if not image:
            return jsonify({'success': False, 'error': 'Image not found'}), 404
        
        # Check if detections exist
        if not image.detected_objects:
            return jsonify({'success': False, 'error': 'No detections found for this image'}), 404
        
        annotated_path = f"./uploads/annotated/{image.id}_detected.png"
        if not os.path.exists(annotated_path):
            return jsonify({'success': False, 'error': 'Annotated image file not found'}), 404
        
        return send_file(annotated_path, as_attachment=True, download_name=f"{image.id}_annotated.png")
        
    except Exception as e:
        logger.error(f"Error in get_annotated_file: {str(e)}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500
