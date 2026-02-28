"""Utility functions for AI operations including logging and error handling"""

import logging
import time
import functools
import traceback
from typing import Callable, Any, Optional, Dict, Tuple
from datetime import datetime
from app.config.ai_config import AIConfig

logger = logging.getLogger(__name__)


class AIOperationError(Exception):
    """Base exception for AI operations"""
    pass


class DetectionError(AIOperationError):
    """Exception for detection operations"""
    pass


class HeatmapError(AIOperationError):
    """Exception for heatmap generation"""
    pass


class ModelLoadError(AIOperationError):
    """Exception for model loading"""
    pass


class PerformanceMetrics:
    """Track performance metrics for AI operations"""
    
    def __init__(self):
        self.operation_times: Dict[str, list] = {}
        self.error_counts: Dict[str, int] = {}
        self.success_counts: Dict[str, int] = {}
    
    def record_operation(self, operation_name: str, execution_time_ms: float, success: bool) -> None:
        """Record operation metrics"""
        if operation_name not in self.operation_times:
            self.operation_times[operation_name] = []
            self.error_counts[operation_name] = 0
            self.success_counts[operation_name] = 0
        
        self.operation_times[operation_name].append(execution_time_ms)
        
        if success:
            self.success_counts[operation_name] += 1
        else:
            self.error_counts[operation_name] += 1
    
    def get_stats(self, operation_name: str) -> Dict:
        """Get statistics for an operation"""
        if operation_name not in self.operation_times:
            return {}
        
        times = self.operation_times[operation_name]
        return {
            'avg_time_ms': sum(times) / len(times),
            'min_time_ms': min(times),
            'max_time_ms': max(times),
            'total_calls': len(times),
            'success_count': self.success_counts.get(operation_name, 0),
            'error_count': self.error_counts.get(operation_name, 0),
        }


# Global metrics instance
_metrics = PerformanceMetrics()


def get_metrics() -> PerformanceMetrics:
    """Get global metrics instance"""
    return _metrics


def log_ai_operation(operation_name: str, log_args: bool = False) -> Callable:
    """Decorator for logging AI operations with performance metrics"""
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            start_time = time.time()
            success = False
            
            try:
                if AIConfig.LOG_AI_OPERATIONS:
                    arg_str = str(args[:2]) if log_args else "..."
                    logger.info(f"Starting {operation_name}: {arg_str}")
                
                result = func(*args, **kwargs)
                success = True
                
                if AIConfig.LOG_AI_OPERATIONS:
                    logger.info(f"Completed {operation_name}")
                
                return result
                
            except Exception as e:
                logger.error(f"Error in {operation_name}: {str(e)}")
                logger.error(traceback.format_exc())
                raise
            
            finally:
                execution_time = (time.time() - start_time) * 1000  # Convert to ms
                
                if AIConfig.LOG_PERFORMANCE_METRICS:
                    _metrics.record_operation(operation_name, execution_time, success)
                    logger.debug(f"{operation_name} took {execution_time:.2f}ms")
        
        return wrapper
    return decorator


def validate_image_file(file_path: str) -> Tuple[bool, Optional[str]]:
    """
    Validate image file before processing
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    import os
    from PIL import Image
    
    try:
        # Check file exists
        if not os.path.exists(file_path):
            return False, f"File not found: {file_path}"
        
        # Check file size
        file_size_mb = os.path.getsize(file_path) / (1024 * 1024)
        if file_size_mb > AIConfig.MAX_IMAGE_SIZE_MB:
            return False, f"File size {file_size_mb:.2f}MB exceeds limit of {AIConfig.MAX_IMAGE_SIZE_MB}MB"
        
        # Try to open and validate image
        try:
            img = Image.open(file_path)
            img.verify()
        except Exception as e:
            return False, f"Invalid image file: {str(e)}"
        
        return True, None
        
    except Exception as e:
        return False, f"Error validating image: {str(e)}"


def safe_detection(image_path: str, detection_func: Callable) -> Tuple[Optional[Dict], Optional[str]]:
    """
    Safely perform detection with error handling
    
    Returns:
        Tuple of (detection_results, error_message)
    """
    try:
        # Validate image
        is_valid, error = validate_image_file(image_path)
        if not is_valid:
            return None, error
        
        # Perform detection
        start_time = time.time()
        results = detection_func(image_path)
        execution_time = (time.time() - start_time) * 1000
        
        # Check execution time limit
        if execution_time > AIConfig.MAX_DETECTION_TIME_MS:
            logger.warning(f"Detection took {execution_time:.2f}ms, exceeds limit of {AIConfig.MAX_DETECTION_TIME_MS}ms")
        
        return results, None
        
    except Exception as e:
        error_msg = f"Detection failed: {str(e)}"
        logger.error(error_msg)
        return None, error_msg


def safe_heatmap_generation(image_path: str, gradcam_func: Callable, **kwargs) -> Tuple[Optional[str], Optional[str]]:
    """
    Safely generate heatmap with error handling
    
    Returns:
        Tuple of (heatmap_path, error_message)
    """
    try:
        # Validate image
        is_valid, error = validate_image_file(image_path)
        if not is_valid:
            return None, error
        
        # Validate colormap if provided
        if 'colormap' in kwargs:
            if not AIConfig.validate_colormap(kwargs['colormap']):
                return None, f"Invalid colormap: {kwargs['colormap']}"
        
        # Generate heatmap
        start_time = time.time()
        heatmap_image, heatmap_path = gradcam_func(image_path, **kwargs)
        execution_time = (time.time() - start_time) * 1000
        
        # Check execution time limit
        if execution_time > AIConfig.MAX_HEATMAP_TIME_MS:
            logger.warning(f"Heatmap generation took {execution_time:.2f}ms, exceeds limit of {AIConfig.MAX_HEATMAP_TIME_MS}ms")
        
        return heatmap_path, None
        
    except Exception as e:
        error_msg = f"Heatmap generation failed: {str(e)}"
        logger.error(error_msg)
        return None, error_msg


class OperationTimer:
    """Context manager for timing operations"""
    
    def __init__(self, operation_name: str = "Operation"):
        self.operation_name = operation_name
        self.start_time = None
        self.execution_time_ms = 0
    
    def __enter__(self):
        self.start_time = time.time()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.start_time:
            self.execution_time_ms = (time.time() - self.start_time) * 1000
            if AIConfig.LOG_PERFORMANCE_METRICS:
                logger.debug(f"{self.operation_name} completed in {self.execution_time_ms:.2f}ms")
        
        return False


def create_error_response(error: Exception, operation: str = "Operation") -> Dict:
    """Create standardized error response"""
    return {
        'success': False,
        'error': str(error),
        'operation': operation,
        'timestamp': datetime.utcnow().isoformat()
    }


def create_success_response(data: Dict, execution_time_ms: int = 0) -> Dict:
    """Create standardized success response"""
    response = {
        'success': True,
        'data': data,
        'timestamp': datetime.utcnow().isoformat()
    }
    if execution_time_ms > 0:
        response['execution_time_ms'] = execution_time_ms
    return response
