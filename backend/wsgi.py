"""
WSGI entry point for production deployment with Gunicorn
"""
import os
from app import create_app

# Create Flask application
app = create_app()

if __name__ == '__main__':
    # Development server (use gunicorn for production)
    app.run(host='0.0.0.0', port=5000, debug=False)
