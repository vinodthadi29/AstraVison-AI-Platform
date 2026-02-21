from app.extensions import db
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
import uuid


class Search(db.Model):
    """Search model for tracking image similarity searches"""
    __tablename__ = 'searches'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False, index=True)
    query_image_id = db.Column(UUID(as_uuid=True), db.ForeignKey('images.id'), nullable=False)
    num_results = db.Column(db.Integer, default=10)
    similarity_threshold = db.Column(db.Float, default=0.5)
    
    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
    execution_time_ms = db.Column(db.Float)  # Time taken to execute search
    
    # Relationships
    query_image = db.relationship('Image', foreign_keys=[query_image_id])
    results = db.relationship('SearchResult', backref='search', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'query_image_id': str(self.query_image_id),
            'num_results': self.num_results,
            'similarity_threshold': self.similarity_threshold,
            'created_at': self.created_at.isoformat(),
            'execution_time_ms': self.execution_time_ms,
            'results': [result.to_dict() for result in self.results]
        }


class SearchResult(db.Model):
    """Search results model for storing similarity search results"""
    __tablename__ = 'search_results'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    search_id = db.Column(UUID(as_uuid=True), db.ForeignKey('searches.id'), nullable=False, index=True)
    source_image_id = db.Column(UUID(as_uuid=True), db.ForeignKey('images.id'), nullable=False)
    result_image_id = db.Column(UUID(as_uuid=True), db.ForeignKey('images.id'), nullable=False)
    similarity_score = db.Column(db.Float, nullable=False)  # Cosine similarity 0-1
    rank = db.Column(db.Integer)  # Ranking in results
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': str(self.id),
            'search_id': str(self.search_id),
            'source_image_id': str(self.source_image_id),
            'result_image_id': str(self.result_image_id),
            'similarity_score': self.similarity_score,
            'rank': self.rank,
            'result_image': self.result_image.to_dict() if self.result_image else None
        }
