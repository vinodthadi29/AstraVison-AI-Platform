# YOLO & Grad-CAM Integration Setup Guide

This guide covers the integration of YOLOv8 object detection and Grad-CAM explainability into AstraVision.

## Overview

The implementation includes:
- **YOLO Detection**: Real-time object detection with bounding box annotations
- **Grad-CAM Heatmaps**: Model explainability through gradient-based activation maps
- **Integration**: Seamless API endpoints and database storage for detection results

## Prerequisites

### System Requirements
- Python 3.9+
- PostgreSQL 12+ with pgvector
- CUDA 11.8+ (optional, for GPU acceleration)
- Minimum 4GB RAM (8GB+ recommended)
- ~2GB disk space for model weights

### Python Dependencies
All required packages are in `requirements.txt`:
```
ultralytics==8.0.204  # YOLOv8
matplotlib==3.8.2     # Visualization
torch==2.1.1          # PyTorch
tensorflow==2.14.0    # TensorFlow for MobileNetV2
```

## Installation

### 1. Update Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Database Migration
Apply the migration script to add detection fields:
```bash
psql -U your_db_user -d astravision -f scripts/02-add-detection-fields.sql
```

This adds:
- `detected_objects` (JSONB): Stores YOLO detection results
- `heatmap_path` (VARCHAR): Path to generated heatmap image

### 3. Environment Configuration
Create a `.env` file in the backend directory:

```env
# YOLO Configuration
YOLO_MODEL_NAME=yolov8n.pt          # Options: yolov8n, yolov8s, yolov8m, yolov8l
YOLO_CONFIDENCE_THRESHOLD=0.5
YOLO_IOU_THRESHOLD=0.45
YOLO_DEVICE=cpu                     # Options: cpu, cuda

# Grad-CAM Configuration
GRADCAM_MODEL_NAME=mobilenetv2
GRADCAM_DEVICE=cpu                  # Options: cpu, cuda
GRADCAM_BLEND_ALPHA=0.4             # 0-1: Controls heatmap transparency
GRADCAM_COLORMAP=jet                # Options: jet, hot, cool, viridis, plasma, turbo

# Auto-Processing (optional)
AUTO_PROCESS_ON_UPLOAD=False         # Auto-detect on image upload
AUTO_PROCESS_DETECTION=False         # Auto-annotate detections
AUTO_PROCESS_HEATMAP=False           # Auto-generate heatmaps

# File Management
UPLOADS_FOLDER=./uploads
MAX_IMAGE_SIZE_MB=50

# Performance
MAX_DETECTION_TIME_MS=30000
MAX_HEATMAP_TIME_MS=60000
BATCH_PROCESSING_SIZE=5

# Logging
LOG_AI_OPERATIONS=True
LOG_PERFORMANCE_METRICS=True
```

## API Endpoints

### Detection Endpoints

#### 1. Detect Objects
```
POST /api/images/detect/<image_id>
Authorization: Bearer <token>
```
Returns detection results (objects, confidence, bounding boxes).

**Response:**
```json
{
  "success": true,
  "data": {
    "image_id": "uuid",
    "detections": [
      {
        "class": "person",
        "class_id": 0,
        "confidence": 0.95,
        "bbox": [0.1, 0.2, 0.5, 0.8],
        "area": 0.24
      }
    ],
    "num_detections": 1,
    "image_size": [1920, 1080],
    "execution_time_ms": 245
  }
}
```

#### 2. Detect and Annotate
```
POST /api/images/detect-annotated/<image_id>
Authorization: Bearer <token>
```
Returns detection results and saves annotated image with bounding boxes.

**Response:**
```json
{
  "success": true,
  "data": {
    "image_id": "uuid",
    "detections": [...],
    "num_detections": 5,
    "annotated_image_path": "./uploads/annotated/uuid_detected.png",
    "execution_time_ms": 312
  }
}
```

#### 3. Get Annotated Image
```
GET /api/images/annotated-file/<image_id>
Authorization: Bearer <token>
```
Download the annotated image with bounding boxes.

### Heatmap Endpoints

#### 1. Generate Heatmap
```
POST /api/images/heatmap/<image_id>
Authorization: Bearer <token>
Content-Type: application/json

{
  "blend_alpha": 0.4,
  "colormap": "jet"
}
```
Generates Grad-CAM heatmap for model explainability.

**Response:**
```json
{
  "success": true,
  "data": {
    "image_id": "uuid",
    "heatmap_path": "./uploads/heatmaps/uuid_gradcam.png",
    "blend_alpha": 0.4,
    "colormap": "jet",
    "execution_time_ms": 1823
  }
}
```

**Parameters:**
- `blend_alpha` (0-1): Controls transparency of heatmap overlay
- `colormap`: Visualization colormap (jet, hot, cool, viridis, plasma, turbo)

#### 2. Get Heatmap Image
```
GET /api/images/heatmap-file/<image_id>
Authorization: Bearer <token>
```
Download the generated heatmap image.

### Full Analysis Endpoint

#### 1. Complete Image Analysis
```
POST /api/images/full-analysis/<image_id>
Authorization: Bearer <token>
```
Performs all analyses: detection + annotation + heatmap generation.

**Response:**
```json
{
  "success": true,
  "data": {
    "image_id": "uuid",
    "detections": [...],
    "num_detections": 3,
    "annotated_image_path": "./uploads/annotated/uuid_detected.png",
    "heatmap_path": "./uploads/heatmaps/uuid_gradcam.png",
    "total_execution_time_ms": 2450
  }
}
```

## Usage Examples

### Python Example
```python
import requests

# Authenticate
auth_token = "your_jwt_token"
headers = {"Authorization": f"Bearer {auth_token}"}

# Detect objects
image_id = "your_image_uuid"
response = requests.post(
    f"http://localhost:5000/api/images/detect/{image_id}",
    headers=headers
)
detections = response.json()['data']['detections']

# Generate heatmap
response = requests.post(
    f"http://localhost:5000/api/images/heatmap/{image_id}",
    json={"blend_alpha": 0.4, "colormap": "jet"},
    headers=headers
)
heatmap_path = response.json()['data']['heatmap_path']

# Full analysis
response = requests.post(
    f"http://localhost:5000/api/images/full-analysis/{image_id}",
    headers=headers
)
results = response.json()['data']
```

### JavaScript/TypeScript Example
```typescript
const apiBase = "http://localhost:5000/api/images";
const token = "your_jwt_token";

// Detect objects
const detectResponse = await fetch(`${apiBase}/detect/${imageId}`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` }
});
const detections = await detectResponse.json();

// Generate heatmap
const heatmapResponse = await fetch(`${apiBase}/heatmap/${imageId}`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ blend_alpha: 0.4, colormap: "jet" })
});
const heatmapData = await heatmapResponse.json();
```

## Performance Optimization

### 1. GPU Acceleration
To use GPU (if CUDA available):
```env
YOLO_DEVICE=cuda
GRADCAM_DEVICE=cuda
```

### 2. Model Selection
YOLO models by speed:
- `yolov8n` (Nano): Fastest, least accurate
- `yolov8s` (Small): Good balance
- `yolov8m` (Medium): Better accuracy
- `yolov8l` (Large): Best accuracy, slowest

### 3. Batch Processing
For processing multiple images:
```python
from app.services import ImageService

service = ImageService()
service.batch_process_embeddings(user_id)  # Process embeddings
```

### 4. Confidence Threshold
Adjust `YOLO_CONFIDENCE_THRESHOLD` to:
- **Lower (0.3-0.5)**: Detect more objects, more false positives
- **Higher (0.6-0.8)**: Fewer, more confident detections

## Troubleshooting

### Model Download Issues
If YOLO models fail to download:
```bash
# Manual download
python -c "from ultralytics import YOLO; YOLO('yolov8n.pt')"
```

### Out of Memory
- Reduce model size: Switch from `yolov8l` to `yolov8n`
- Use CPU instead of GPU
- Process images sequentially instead of batch

### Slow Execution
- Check disk I/O and file size
- Verify CPU/GPU usage during processing
- Monitor logs for bottlenecks: `tail -f logs/app.log`

### GPU Not Detected
```bash
# Verify CUDA installation
python -c "import torch; print(torch.cuda.is_available())"

# Check PyTorch CUDA support
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

## Database Schema

### Image Table Extensions
```sql
-- New columns added by migration
ALTER TABLE images
ADD COLUMN detected_objects JSONB,
ADD COLUMN heatmap_path VARCHAR(512);

-- Detection results structure (stored in detected_objects)
{
  "detections": [
    {
      "class": "person",
      "class_id": 0,
      "confidence": 0.95,
      "bbox": [x1, y1, x2, y2],  -- normalized coords
      "area": 0.15
    }
  ],
  "image_size": [width, height],
  "num_detections": 5,
  "model": "yolov8n",
  "confidence_threshold": 0.5
}
```

## Configuration Reference

See `app/config/ai_config.py` for all configuration options:
- YOLO detection parameters
- Grad-CAM visualization settings
- Performance limits and timeouts
- File management paths

## Monitoring and Logging

### Performance Metrics
Track operation performance:
```python
from app.utils.ai_utils import get_metrics

metrics = get_metrics()
stats = metrics.get_stats('detection')
# Returns: avg_time, min_time, max_time, total_calls, success_count, error_count
```

### Enable Debug Logging
```env
LOG_LEVEL=DEBUG
LOG_AI_OPERATIONS=True
LOG_PERFORMANCE_METRICS=True
```

## Security Notes

1. **API Rate Limiting**: Detection/heatmap endpoints limited to 20-30 req/hour per user
2. **Input Validation**: Images validated before processing
3. **File Security**: Annotated images and heatmaps stored in secure uploads folder
4. **JWT Authentication**: All endpoints require valid JWT token

## Next Steps

1. Test endpoints with sample images
2. Integrate frontend UI for detection visualization
3. Set up monitoring for performance tracking
4. Configure auto-processing if needed
5. Deploy to production with appropriate hardware

## Support

For issues or questions:
- Check logs: `backend/logs/app.log`
- Review configuration: `backend/app/config/ai_config.py`
- Test endpoint health: `GET /api/health`
