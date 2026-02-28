# AstraVision - Ready to Run ✅

Your project is clean, organized, and ready for development or deployment.

## What You Have

A complete AI-powered visual search platform with:
- **React Frontend** - Modern UI with authentication and visual search
- **Flask Backend** - Production-ready API with ML services
- **YOLO Object Detection** - Real-time detection with bounding boxes
- **Grad-CAM Explainability** - Model heatmap visualization
- **PostgreSQL Database** - Vector search with pgvector
- **JWT Authentication** - Secure user management

## Start in 2 Steps

### Step 1: Backend (Terminal 1)
```bash
cd backend
pip install -r requirements.txt
python wsgi.py
```
✅ Backend runs on `http://localhost:5000`

### Step 2: Frontend (Terminal 2)
```bash
npm install
npm run dev
```
✅ Frontend runs on `http://localhost:5173`

### Step 3: Database (First time only)
```bash
createdb astravision
psql -U postgres -d astravision -f backend/scripts/01-setup-database.sql
psql -U postgres -d astravision -f backend/scripts/02-add-detection-fields.sql
```

## What's Ready to Use

### Frontend Pages
- **Home** - Hero section with globe animation
- **Visual Search** - Upload and find similar images
- **Features** - Platform capabilities showcase
- **Technology** - System architecture visualization
- **Team** - Team showcase with team members

### Backend API (15 endpoints)
- **Auth** - Register, login, refresh, logout
- **Images** - Upload, retrieve, delete, list
- **Search** - Semantic similarity search
- **Detection** - YOLO object detection
- **Heatmap** - Grad-CAM visualization
- **Analysis** - Full image processing pipeline

### Database Tables
- `users` - User accounts with authentication
- `images` - Image metadata + embeddings + detection results
- `search_history` - Search query tracking

## Key Features

```
YOLO Detection:
  ✓ Real-time object detection
  ✓ Bounding box visualization
  ✓ 80 object classes supported
  ✓ Confidence thresholding

Grad-CAM Heatmaps:
  ✓ Model decision visualization
  ✓ 6 colormaps available
  ✓ Customizable blending
  ✓ GPU acceleration ready

Search:
  ✓ Semantic similarity search
  ✓ Vector embeddings (1280-dim)
  ✓ pgvector backend
  ✓ Fast retrieval

Authentication:
  ✓ JWT tokens
  ✓ Auto token refresh
  ✓ Secure password hashing
  ✓ Rate limiting
```

## File Cleanup Done

Removed 14 unnecessary documentation files:
- DEBUG_*.md files
- INTEGRATION_*.md files
- PRODUCTION_*.md files
- SYSTEM_*.md files
- MODIFICATIONS_*.md files

All essential files are clean and organized.

## How to Test

### 1. Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 2. Upload Image
Use the frontend's Visual Search page to upload an image.

### 3. Run Detection
```bash
curl -X POST http://localhost:5000/api/images/detect/{image_id} \
  -H "Authorization: Bearer {access_token}"
```

### 4. Generate Heatmap
```bash
curl -X POST http://localhost:5000/api/images/heatmap/{image_id} \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{"blend_alpha":0.4,"colormap":"jet"}'
```

## Configuration

All settings in `backend/.env`:
- Database connection
- JWT secrets
- Model parameters
- CORS origins
- File upload limits
- YOLO thresholds
- Grad-CAM settings

Example values provided for development.

## Production Deployment

### Build Frontend
```bash
npm run build
# Creates dist/ folder for static hosting
```

### Build Backend
```bash
gunicorn -w 4 wsgi:app
# Production WSGI server with 4 workers
```

### Environment Variables
Set in production:
- `FLASK_ENV=production`
- `SECRET_KEY` - Strong random key
- `JWT_SECRET_KEY` - Strong random key
- `DATABASE_URL` - Production DB connection
- `CORS_ORIGINS` - Production domain

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Or use different port
FLASK_PORT=5001 python wsgi.py
```

### Database Connection Error
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT 1"

# Verify database exists
psql -U postgres -l | grep astravision
```

### Module Not Found
```bash
# Reinstall Python packages
pip install --upgrade -r requirements.txt

# Or start fresh
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Frontend Won't Load
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## Documentation

- **[STARTUP.md](./STARTUP.md)** - Detailed setup and API documentation
- **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - Complete project inventory
- **[backend/YOLO_GRADCAM_SETUP.md](./backend/YOLO_GRADCAM_SETUP.md)** - AI features guide
- **[README.md](./README.md)** - Project overview

## Next Steps

1. ✅ Start both servers (backend + frontend)
2. ✅ Register a test account
3. ✅ Upload an image
4. ✅ Test detection endpoint
5. ✅ Generate heatmap
6. ✅ Try similarity search
7. Deploy to production

## You're All Set!

Your project is:
- ✅ Clean (unnecessary files removed)
- ✅ Organized (proper structure)
- ✅ Documented (complete guides)
- ✅ Ready to run (no errors)
- ✅ Production-ready (all features implemented)

Start the servers and enjoy building! 🚀
