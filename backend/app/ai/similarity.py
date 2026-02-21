import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import logging
from app.models import Image, SearchResult, Search
from app.extensions import db
from datetime import datetime
import time

logger = logging.getLogger(__name__)


class SimilaritySearchService:
    """Service for performing similarity searches on image embeddings"""
    
    def __init__(self):
        """Initialize similarity search service"""
        self.search_backend = 'database'  # Can be 'database', 'faiss', or 'pgvector'
    
    def deserialize_embedding(self, embedding_bytes):
        """Deserialize embedding from bytes"""
        try:
            if isinstance(embedding_bytes, bytes):
                embedding = np.frombuffer(embedding_bytes, dtype=np.float32)
            else:
                embedding = np.array(embedding_bytes, dtype=np.float32)
            return embedding
        except Exception as e:
            logger.error(f"Error deserializing embedding: {str(e)}")
            raise
    
    def serialize_embedding(self, embedding):
        """Serialize embedding to bytes"""
        try:
            if isinstance(embedding, np.ndarray):
                return embedding.astype(np.float32).tobytes()
            return embedding
        except Exception as e:
            logger.error(f"Error serializing embedding: {str(e)}")
            raise
    
    def cosine_similarity_score(self, embedding1, embedding2):
        """Calculate cosine similarity between two embeddings"""
        try:
            # Ensure 2D arrays for sklearn
            emb1 = embedding1.reshape(1, -1) if len(embedding1.shape) == 1 else embedding1
            emb2 = embedding2.reshape(1, -1) if len(embedding2.shape) == 1 else embedding2
            
            similarity = cosine_similarity(emb1, emb2)[0][0]
            return float(similarity)
        except Exception as e:
            logger.error(f"Error calculating similarity: {str(e)}")
            raise
    
    def search_similar_images(self, user_id, query_image_id, num_results=10, 
                             similarity_threshold=0.3):
        """
        Search for visually similar images using cosine similarity
        
        Args:
            user_id: UUID of user performing search
            query_image_id: UUID of query image
            num_results: Number of results to return
            similarity_threshold: Minimum similarity threshold
        
        Returns:
            List of similar images with scores
        """
        start_time = time.time()
        
        try:
            # Get query image
            query_image = Image.query.filter_by(id=query_image_id, user_id=user_id).first()
            if not query_image:
                logger.warning(f"Query image {query_image_id} not found")
                return None, "Query image not found"
            
            if not query_image.embedding:
                logger.warning(f"Query image {query_image_id} has no embedding")
                return None, "Query image has no embedding"
            
            # Deserialize query embedding
            query_embedding = self.deserialize_embedding(query_image.embedding)
            
            # Get all user's images (excluding query image)
            user_images = Image.query.filter(
                Image.user_id == user_id,
                Image.id != query_image_id,
                Image.embedding.isnot(None)
            ).all()
            
            if not user_images:
                logger.info(f"No images to search against for user {user_id}")
                return [], "Success"
            
            # Calculate similarities
            similarities = []
            for img in user_images:
                img_embedding = self.deserialize_embedding(img.embedding)
                score = self.cosine_similarity_score(query_embedding, img_embedding)
                
                if score >= similarity_threshold:
                    similarities.append({
                        'image': img,
                        'score': score
                    })
            
            # Sort by similarity score (descending)
            similarities.sort(key=lambda x: x['score'], reverse=True)
            
            # Limit results
            results = similarities[:num_results]
            
            # Calculate execution time
            execution_time = (time.time() - start_time) * 1000  # ms
            
            logger.info(f"Found {len(results)} similar images in {execution_time:.2f}ms")
            
            return results, execution_time
        
        except Exception as e:
            logger.error(f"Error during similarity search: {str(e)}")
            raise
    
    def batch_similarity_search(self, user_id, query_embeddings, num_results=10,
                               similarity_threshold=0.3):
        """Perform batch similarity searches"""
        results = []
        
        for idx, query_embedding in enumerate(query_embeddings):
            try:
                result = self.search_similar_images(
                    user_id=user_id,
                    query_embedding=query_embedding,
                    num_results=num_results,
                    similarity_threshold=similarity_threshold
                )
                results.append(result)
            except Exception as e:
                logger.error(f"Error in batch search {idx}: {str(e)}")
                results.append(None)
        
        return results
    
    def save_search_results(self, user_id, query_image_id, results, execution_time,
                           num_results=10, similarity_threshold=0.3):
        """Save search results to database"""
        try:
            # Create search record
            search = Search(
                user_id=user_id,
                query_image_id=query_image_id,
                num_results=num_results,
                similarity_threshold=similarity_threshold,
                execution_time_ms=execution_time
            )
            db.session.add(search)
            db.session.flush()  # Get search ID
            
            # Create search result records
            for rank, result in enumerate(results, start=1):
                search_result = SearchResult(
                    search_id=search.id,
                    source_image_id=query_image_id,
                    result_image_id=result['image'].id,
                    similarity_score=result['score'],
                    rank=rank
                )
                db.session.add(search_result)
            
            db.session.commit()
            logger.info(f"Saved {len(results)} search results")
            
            return search
        
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error saving search results: {str(e)}")
            raise
    
    def get_search_history(self, user_id, limit=50):
        """Get search history for user"""
        try:
            searches = Search.query.filter_by(user_id=user_id)\
                .order_by(Search.created_at.desc())\
                .limit(limit)\
                .all()
            
            return [search.to_dict() for search in searches]
        except Exception as e:
            logger.error(f"Error getting search history: {str(e)}")
            raise


# Global similarity search service instance
_similarity_service = None


def get_similarity_service():
    """Get or create similarity search service"""
    global _similarity_service
    if _similarity_service is None:
        _similarity_service = SimilaritySearchService()
    return _similarity_service
