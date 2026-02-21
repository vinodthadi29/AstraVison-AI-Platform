from app.models import User
from app.extensions import db
from flask_jwt_extended import create_access_token, create_refresh_token
import logging

logger = logging.getLogger(__name__)


class AuthService:
    """Service for handling authentication logic"""
    
    @staticmethod
    def register_user(email, password, first_name=None, last_name=None):
        """Register a new user"""
        try:
            # Check if user already exists
            existing_user = User.query.filter_by(email=email).first()
            if existing_user:
                logger.warning(f"User with email {email} already exists")
                return None, "User already exists"
            
            # Create new user
            user = User(
                email=email,
                first_name=first_name,
                last_name=last_name
            )
            user.set_password(password)
            
            db.session.add(user)
            db.session.commit()
            
            logger.info(f"User {email} registered successfully")
            return user, None
        
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error registering user: {str(e)}")
            return None, str(e)
    
    @staticmethod
    def login_user(email, password):
        """Authenticate user and return tokens"""
        try:
            # Find user by email
            user = User.query.filter_by(email=email).first()
            if not user:
                logger.warning(f"Login attempt with non-existent email: {email}")
                return None, None, "Invalid email or password"
            
            # Verify password
            if not user.verify_password(password):
                logger.warning(f"Login attempt with wrong password for user: {email}")
                return None, None, "Invalid email or password"
            
            # Check if user is active
            if not user.is_active:
                logger.warning(f"Login attempt for inactive user: {email}")
                return None, None, "User account is inactive"
            
            # Generate tokens
            access_token = create_access_token(identity=str(user.id))
            refresh_token = create_refresh_token(identity=str(user.id))
            
            logger.info(f"User {email} logged in successfully")
            return access_token, refresh_token, None
        
        except Exception as e:
            logger.error(f"Error during login: {str(e)}")
            return None, None, str(e)
    
    @staticmethod
    def get_user_by_id(user_id):
        """Get user by ID"""
        try:
            user = User.query.filter_by(id=user_id).first()
            return user
        except Exception as e:
            logger.error(f"Error getting user: {str(e)}")
            return None
    
    @staticmethod
    def update_user(user_id, **kwargs):
        """Update user information"""
        try:
            user = User.query.filter_by(id=user_id).first()
            if not user:
                return None, "User not found"
            
            allowed_fields = ['first_name', 'last_name']
            for key, value in kwargs.items():
                if key in allowed_fields and value is not None:
                    setattr(user, key, value)
            
            db.session.commit()
            logger.info(f"User {user_id} updated successfully")
            return user, None
        
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error updating user: {str(e)}")
            return None, str(e)
    
    @staticmethod
    def refresh_token(user_id):
        """Create new access token from refresh token"""
        try:
            user = User.query.filter_by(id=user_id).first()
            if not user or not user.is_active:
                return None, "Invalid user"
            
            access_token = create_access_token(identity=str(user.id))
            return access_token, None
        
        except Exception as e:
            logger.error(f"Error refreshing token: {str(e)}")
            return None, str(e)
