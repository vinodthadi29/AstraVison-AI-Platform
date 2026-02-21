from flask import Blueprint, jsonify
from app.extensions import db
import logging

logger = logging.getLogger(__name__)

system_bp = Blueprint('system', __name__, url_prefix='/api')


@system_bp.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    try:
        # Check database connection
        db.session.execute('SELECT 1')
        db_status = 'healthy'
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        db_status = 'unhealthy'
    
    return jsonify({
        'status': 'healthy' if db_status == 'healthy' else 'degraded',
        'database': db_status,
        'timestamp': __import__('datetime').datetime.utcnow().isoformat()
    }), 200 if db_status == 'healthy' else 503


@system_bp.route('/info', methods=['GET'])
def info():
    """System information endpoint"""
    return jsonify({
        'name': 'AstraVision Backend',
        'version': '1.0.0',
        'description': 'Visual Similarity Retrieval System powered by MobileNetV2',
        'api_version': 'v1'
    }), 200
