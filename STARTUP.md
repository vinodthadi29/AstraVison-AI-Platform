# AstraVision - Startup Guide

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL 14+
- CUDA 12+ (optional, for GPU acceleration)

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start backend (development)
python wsgi.py
```

Backend will run on: `http://localhost:5000`

### 2. Frontend Setup

```bash
# In root directory
npm install
# or
pnpm install

# Start frontend (development)
npm run dev
# or
pnpm dev
```

Frontend will run on: `http://localhost:5173`

### 3. Database Setup (First Time Only)

```bash
# Ensure PostgreSQL is running
# Create database
createdb astravision

# Run migrations
cd backend
psql -U postgres -d astravision -f scripts/01-setup-database.sql
psql -U postgres -d astravision -f scripts/02-add-detection-fields.sql
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/logout` - Logout user

### Image Operations
- `POST /api/images/upload` - Upload image
- `GET /api/images/<id>` - Get image metadata
- `DELETE /api/images/<id>` - Delete image
- `GET /api/images/user/<user_id>` - List user's images

### Detection & Explainability
- `POST /api/images/detect/<id>` - Detect objects (YOLO)
- `POST /api/images/detect-annotated/<id>` - Detect with annotations
- `POST /api/images/heatmap/<id>` - Generate Grad-CAM heatmap
- `POST /api/images/full-analysis/<id>` - Complete pipeline
- `GET /api/images/heatmap-file/<id>` - Download heatmap
- `GET /api/images/annotated-file/<id>` - Download annotated image

### Search
- `POST /api/images/search` - Semantic similarity search

## Environment Variables

Key environment variables in `backend/.env`:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET_KEY` - JWT signing secret
- `FLASK_ENV` - Environment (development/production)
- `CORS_ORIGINS` - Allowed frontend origins
- `YOLO_CONFIDENCE_THRESHOLD` - Detection confidence (default: 0.5)
- `GRADCAM_BLEND_ALPHA` - Heatmap blend amount (0-1)

## Troubleshooting

### Backend Won't Start
1. Check if port 5000 is in use: `lsof -i :5000`
2. Verify PostgreSQL is running
3. Check `.env` file exists and has correct values
4. Check virtual environment is activated

### Frontend Won't Start
1. Check if port 5173 is in use: `lsof -i :5173`
2. Run `npm install` or `pnpm install`
3. Clear cache: `rm -rf node_modules package-lock.json`

### Database Connection Issues
1. Verify PostgreSQL service is running
2. Test connection: `psql -U postgres -h localhost`
3. Check DATABASE_URL format in `.env`

### YOLO Model Issues
1. First run downloads model (~100MB) - be patient
2. Requires internet connection for first download
3. GPU support is automatic if CUDA available

## Project Structure

```
.
├── backend/              # Flask API server
│   ├── app/
│   │   ├── ai/          # YOLO & Grad-CAM services
│   │   ├── routes/      # API endpoints
│   │   ├── models/      # Database models
│   │   ├── services/    # Business logic
│   │   └── config/      # Configuration
│   ├── scripts/         # Database migrations
│   └── requirements.txt
├── src/                 # React frontend
│   ├── components/      # React components
│   ├── App.tsx         # Main app
│   └── index.tsx       # Entry point
└── vite.config.ts      # Vite configuration
```

## Next Steps

1. Register a user via the Auth Portal
2. Upload an image from the Visual Search tab
3. Click on the image to detect objects or generate heatmaps
4. View the detection results and Grad-CAM visualizations
