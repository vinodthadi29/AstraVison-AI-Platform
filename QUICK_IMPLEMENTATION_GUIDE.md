# Quick Implementation Guide - YOLOv8 & Grad-CAM

## 5-Minute Setup

### Step 1: Install Dependencies (2 min)
```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Database Migration (1 min)
```bash
psql -U your_db_user -d astravision -f scripts/02-add-detection-fields.sql
```

### Step 3: Create .env File (1 min)
```env
YOLO_MODEL_NAME=yolov8n.pt
YOLO_DEVICE=cpu
GRADCAM_COLORMAP=jet
AUTO_PROCESS_ON_UPLOAD=False
```

### Step 4: Restart Flask & Test (1 min)
```bash
# Test detection
curl -X POST http://localhost:5000/api/images/detect/<image_uuid> \
  -H "Authorization: Bearer your_token"
```

## API Quick Reference

### Detection
```bash
# Detect objects
POST /api/images/detect/<id>

# Detect + Annotate
POST /api/images/detect-annotated/<id>

# Download annotated image
GET /api/images/annotated-file/<id>
```

### Heatmaps
```bash
# Generate heatmap
POST /api/images/heatmap/<id>
Body: {"blend_alpha": 0.4, "colormap": "jet"}

# Download heatmap
GET /api/images/heatmap-file/<id>
```

### Combined
```bash
# Full analysis (detect + heatmap)
POST /api/images/full-analysis/<id>
```

## File Locations

| File | Purpose |
|------|---------|
| `backend/app/ai/detection.py` | YOLO service |
| `backend/app/ai/gradcam.py` | Grad-CAM service |
| `backend/app/routes/images.py` | API endpoints |
| `backend/app/config/ai_config.py` | Configuration |
| `backend/app/utils/ai_utils.py` | Error handling & logging |
| `backend/scripts/02-add-detection-fields.sql` | Database migration |

## Configuration Quick Reference

### YOLO Models
| Model | Speed | Accuracy | Size |
|-------|-------|----------|------|
| yolov8n | Fastest | Good | 6MB |
| yolov8s | Fast | Better | 22MB |
| yolov8m | Medium | Good | 49MB |
| yolov8l | Slow | Best | 83MB |

### Colormaps
- `jet`: Blue-to-red gradient
- `hot`: Black-to-red
- `cool`: Cyan-to-magenta
- `viridis`: Perceptually uniform
- `plasma`: High contrast
- `turbo`: Full spectrum

### Environment Variables
```env
# Must set
DATABASE_URL=postgresql://...
SECRET_KEY=your_secret_key

# Optional (defaults provided)
YOLO_CONFIDENCE_THRESHOLD=0.5    # 0-1
YOLO_DEVICE=cpu                  # cpu or cuda
GRADCAM_BLEND_ALPHA=0.4          # 0-1
GRADCAM_COLORMAP=jet
MAX_IMAGE_SIZE_MB=50
LOG_AI_OPERATIONS=True
```

## Troubleshooting

### Models Not Downloading
```bash
python -c "from ultralytics import YOLO; YOLO('yolov8n.pt')"
```

### Out of Memory
Use smaller model: `YOLO_MODEL_NAME=yolov8n.pt`

### Slow Processing
- Use GPU: `YOLO_DEVICE=cuda` (requires CUDA)
- Reduce threshold: `YOLO_CONFIDENCE_THRESHOLD=0.3`

### GPU Not Available
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

## Code Examples

### Python
```python
import requests

headers = {"Authorization": f"Bearer {token}"}

# Detect
r = requests.post(f"http://localhost:5000/api/images/detect/{id}", headers=headers)
detections = r.json()['data']['detections']

# Heatmap
r = requests.post(
    f"http://localhost:5000/api/images/heatmap/{id}",
    json={"blend_alpha": 0.4, "colormap": "jet"},
    headers=headers
)
heatmap_path = r.json()['data']['heatmap_path']
```

### JavaScript
```javascript
const headers = { "Authorization": `Bearer ${token}` };

// Detect
const detect = await fetch(`/api/images/detect/${id}`, {
  method: "POST", headers
});

// Heatmap
const heatmap = await fetch(`/api/images/heatmap/${id}`, {
  method: "POST",
  headers: { ...headers, "Content-Type": "application/json" },
  body: JSON.stringify({ blend_alpha: 0.4, colormap: "jet" })
});
```

## Expected Execution Times

| Operation | CPU | GPU |
|-----------|-----|-----|
| Detection | 200-300ms | 20-50ms |
| Heatmap | 1500-2500ms | 200-500ms |
| Full Analysis | 2000-3000ms | 300-600ms |

## Rate Limits

- Detection: 30 req/hour
- Heatmap: 20 req/hour
- Full Analysis: 10 req/hour

## Database Changes

New columns in `images` table:
- `detected_objects` (JSONB): Detection results
- `heatmap_path` (VARCHAR): Heatmap file path

## Key Classes

| Class | Location | Purpose |
|-------|----------|---------|
| `DetectionService` | `app/ai/detection.py` | YOLO detection |
| `GradCAMService` | `app/ai/gradcam.py` | Heatmap generation |
| `AIConfig` | `app/config/ai_config.py` | Configuration management |
| `PerformanceMetrics` | `app/utils/ai_utils.py` | Metrics tracking |

## Feature Flags

```env
# Auto-processing (disabled by default)
AUTO_PROCESS_ON_UPLOAD=False        # Run on image upload
AUTO_PROCESS_DETECTION=False        # Auto-detect objects
AUTO_PROCESS_HEATMAP=False          # Auto-generate heatmap
AUTO_CREATE_ANNOTATED_IMAGE=True    # Keep annotated images
```

## Monitoring

### View Performance Stats
```python
from app.utils.ai_utils import get_metrics
metrics = get_metrics()
stats = metrics.get_stats('detection')
# Returns: avg_time_ms, min_time_ms, max_time_ms, total_calls, success_count, error_count
```

### Enable Debug Logging
```env
LOG_LEVEL=DEBUG
LOG_AI_OPERATIONS=True
LOG_PERFORMANCE_METRICS=True
```

## Production Checklist

- [ ] Set strong `SECRET_KEY`
- [ ] Set strong `JWT_SECRET_KEY`
- [ ] Configure GPU if available
- [ ] Set appropriate rate limits
- [ ] Monitor disk space for uploads
- [ ] Enable production logging
- [ ] Test error handling
- [ ] Set `FLASK_ENV=production`
- [ ] Use HTTPS in production
- [ ] Set up database backups

## Common Commands

```bash
# Test API
curl -X POST http://localhost:5000/api/images/detect/<id> \
  -H "Authorization: Bearer <token>"

# Check model version
python -c "from ultralytics import YOLO; print(YOLO('yolov8n.pt'))"

# View logs
tail -f backend/logs/app.log

# Reset database
psql -U user -d astravision -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Run migrations
psql -U user -d astravision -f scripts/02-add-detection-fields.sql
```

## Performance Tips

1. Use `yolov8n` model for speed
2. Set `YOLO_DEVICE=cuda` if GPU available
3. Adjust `YOLO_CONFIDENCE_THRESHOLD` based on needs
4. Use CPU for small deployments
5. Monitor `execution_time_ms` in responses

## Support Files

- **Setup Guide**: `backend/YOLO_GRADCAM_SETUP.md`
- **Implementation Summary**: `IMPLEMENTATION_SUMMARY.md`
- **API Docs**: See endpoint responses
- **Config Reference**: `backend/app/config/ai_config.py`

## What Works Out of the Box

✅ Object detection with YOLOv8
✅ Bounding box annotation
✅ Grad-CAM heatmap generation
✅ API endpoints with authentication
✅ Database storage of results
✅ Error handling and validation
✅ Performance metrics logging
✅ Rate limiting protection
✅ GPU support (optional)
✅ Batch processing capability
