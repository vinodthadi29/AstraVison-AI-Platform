from app.extensions import db
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID, BYTEA
import uuid


class Image(db.Model):
    """Image model for storing uploaded images and embeddings"""
    __tablename__ = 'images'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False, index=True)
    filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(512), nullable=False)
    file_size = db.Column(db.Integer)  # in bytes
    mime_type = db.Column(db.String(50))
    width = db.Column(db.Integer)
    height = db.Column(db.Integer)
    
    # Embedding vector
    embedding = db.Column(db.LargeBinary)  # Stored as serialized numpy array or PostgreSQL vector
    embedding_model = db.Column(db.String(50), default='mobilenetv2')
    
    # Metadata
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
    processed_at = db.Column(db.DateTime)
    
    # Relationships
    search_results = db.relationship('SearchResult', backref='source_image', lazy=True, 
                                     foreign_keys='SearchResult.source_image_id',
                                     cascade='all, delete-orphan')
    similar_to = db.relationship('SearchResult', backref='result_image', lazy=True,
                                foreign_keys='SearchResult.result_image_id',
                                cascade='all, delete-orphan')
    
    def to_dict(self, include_embedding=False):
        """Convert to dictionary"""
        data = {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'filename': self.filename,
            'file_path': self.file_path,
            'file_size': self.file_size,
            'mime_type': self.mime_type,
            'width': self.width,
            'height': self.height,
            'embedding_model': self.embedding_model,
            'uploaded_at': self.uploaded_at.isoformat(),
            'processed_at': self.processed_at.isoformat() if self.processed_at else None
        }
        
        if include_embedding and self.embedding:
            data['embedding'] = self.embedding.hex()  # Return as hex string
        
        return data
