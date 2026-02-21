from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services import AuthService
from app.models import User
from marshmallow import Schema, fields, ValidationError
import logging

logger = logging.getLogger(__name__)

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


# Validation schemas
class RegisterSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=lambda x: len(x) >= 8)
    first_name = fields.Str()
    last_name = fields.Str()


class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True)


class UpdateUserSchema(Schema):
    first_name = fields.Str()
    last_name = fields.Str()


register_schema = RegisterSchema()
login_schema = LoginSchema()
update_user_schema = UpdateUserSchema()


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        # Validate request data
        try:
            data = register_schema.load(request.get_json())
        except ValidationError as err:
            return jsonify({'success': False, 'error': err.messages}), 400
        
        # Register user
        user, error = AuthService.register_user(
            email=data['email'],
            password=data['password'],
            first_name=data.get('first_name'),
            last_name=data.get('last_name')
        )
        
        if error:
            return jsonify({'success': False, 'error': error}), 400
        
        # Generate tokens for newly registered user
        access_token, refresh_token, _ = AuthService.login_user(
            email=data['email'],
            password=data['password']
        )
        
        return jsonify({
            'success': True,
            'data': {
                'access_token': access_token,
                'refresh_token': refresh_token,
                'user': {
                    'id': str(user.id),
                    'email': user.email,
                    'created_at': user.created_at.isoformat()
                }
            }
        }), 201
    
    except Exception as e:
        logger.error(f"Error in register: {str(e)}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user and return tokens"""
    try:
        # Validate request data
        try:
            data = login_schema.load(request.get_json())
        except ValidationError as err:
            return jsonify({'success': False, 'error': err.messages}), 400
        
        # Login user
        access_token, refresh_token, error = AuthService.login_user(
            email=data['email'],
            password=data['password']
        )
        
        if error:
            return jsonify({'success': False, 'error': error}), 401
        
        # Get user info
        user = User.query.filter_by(email=data['email']).first()
        
        return jsonify({
            'success': True,
            'data': {
                'access_token': access_token,
                'refresh_token': refresh_token,
                'user': {
                    'id': str(user.id),
                    'email': user.email,
                    'created_at': user.created_at.isoformat()
                }
            }
        }), 200
    
    except Exception as e:
        logger.error(f"Error in login: {str(e)}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user information"""
    try:
        user_id = get_jwt_identity()
        user = AuthService.get_user_by_id(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'user': user.to_dict()
        }), 200
    
    except Exception as e:
        logger.error(f"Error in get_current_user: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@auth_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_user():
    """Update current user information"""
    try:
        user_id = get_jwt_identity()
        
        # Validate request data
        try:
            data = update_user_schema.load(request.get_json() or {})
        except ValidationError as err:
            return jsonify({'error': err.messages}), 400
        
        # Update user
        user, error = AuthService.update_user(user_id, **data)
        
        if error:
            return jsonify({'error': error}), 400
        
        return jsonify({
            'message': 'User updated successfully',
            'user': user.to_dict()
        }), 200
    
    except Exception as e:
        logger.error(f"Error in update_user: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@auth_bp.route('/refresh', methods=['POST'])
def refresh():
    """Refresh access token using refresh token from body"""
    try:
        data = request.get_json() or {}
        refresh_token = data.get('refresh_token')
        
        if not refresh_token:
            return jsonify({'success': False, 'error': 'Refresh token required'}), 400
        
        try:
            from flask_jwt_extended import decode_token
            decoded = decode_token(refresh_token)
            user_id = decoded['sub']
        except Exception as e:
            logger.error(f"Invalid refresh token: {str(e)}")
            return jsonify({'success': False, 'error': 'Invalid refresh token'}), 401
        
        access_token, error = AuthService.refresh_token(user_id)
        
        if error:
            return jsonify({'success': False, 'error': error}), 401
        
        user = User.query.get(user_id)
        
        return jsonify({
            'success': True,
            'data': {
                'access_token': access_token,
                'refresh_token': refresh_token,
                'user': {
                    'id': str(user.id),
                    'email': user.email,
                    'created_at': user.created_at.isoformat()
                }
            }
        }), 200
    
    except Exception as e:
        logger.error(f"Error in refresh: {str(e)}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500
