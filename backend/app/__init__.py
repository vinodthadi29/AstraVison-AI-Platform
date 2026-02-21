from flask import Flask
from app.config.settings import get_config
from app.extensions import init_extensions, db
from app.routes import register_blueprints
from app.ai import init_embedding_service
import logging
import os


def create_app():
    """Application factory function"""
    
    # Get configuration
    config = get_config()
    
    # Create Flask app
    app = Flask(__name__)
    app.config.from_object(config)
    
    # Initialize extensions
    init_extensions(app)
    
    # Initialize AI services
    init_embedding_service(
        model_name=app.config['MODEL_NAME'],
        embedding_dim=app.config['EMBEDDING_DIM']
    )
    
    # Register blueprints
    register_blueprints(app)
    
    # Create tables
    with app.app_context():
        db.create_all()
    
    # Configure logging
    if not app.debug:
        handler = logging.StreamHandler()
        handler.setLevel(getattr(logging, app.config['LOG_LEVEL']))
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        
        # Add handler to app logger
        app.logger.addHandler(handler)
        app.logger.setLevel(getattr(logging, app.config['LOG_LEVEL']))
    
    # Log startup info
    app.logger.info(f"Application started in {app.config['FLASK_ENV']} mode")
    app.logger.info(f"Using model: {app.config['MODEL_NAME']}")
    app.logger.info(f"Database: {app.config['SQLALCHEMY_DATABASE_URI']}")
    
    return app
