from app.routes.auth import auth_bp
from app.routes.images import images_bp
from app.routes.system import system_bp


def register_blueprints(app):
    """Register all blueprints"""
    app.register_blueprint(auth_bp)
    app.register_blueprint(images_bp)
    app.register_blueprint(system_bp)
