# AstraVision - AI-Powered Spatial Intelligence Platform

Advanced visual search, object detection, and model explainability platform powered by MobileNetV2 embeddings, YOLOv8 object detection, and Grad-CAM heatmap visualization.

## Features

- **Semantic Visual Search**: Find similar images using deep learning embeddings
- **Real-time Object Detection**: YOLOv8-based detection with bounding box annotation
- **Model Explainability**: Grad-CAM heatmaps showing what the model "sees"
- **JWT Authentication**: Secure user authentication with token refresh
- **PostgreSQL + pgvector**: Vector database for similarity search
- **Full-stack Architecture**: React frontend + Flask backend + ML services

## Quick Start

See [STARTUP.md](./STARTUP.md) for detailed setup instructions.

### Quick Commands

```bash
# Frontend
npm install && npm run dev

# Backend (in separate terminal)
cd backend
pip install -r requirements.txt
python wsgi.py
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:5000`

## Tech Stack

**Frontend**: React 18, TypeScript, Vite, TailwindCSS, Framer Motion  
**Backend**: Flask, SQLAlchemy, PostgreSQL + pgvector  
**AI/ML**: TensorFlow (MobileNetV2), PyTorch, YOLOv8, OpenCV  
**Database**: PostgreSQL 14+ with pgvector extension

## API Endpoints

See [STARTUP.md](./STARTUP.md#api-endpoints) for complete endpoint documentation.

## Project Structure

```
.
├── backend/              # Flask API & AI services
│   ├── app/ai/          # YOLO detection & Grad-CAM
│   ├── app/models/      # Database models
│   ├── app/routes/      # API endpoints
│   └── scripts/         # Database migrations
├── src/                 # React components
├── vite.config.ts       # Vite configuration
├── STARTUP.md           # Detailed setup guide
└── backend/YOLO_GRADCAM_SETUP.md  # AI features guide
```

## Development

- **Frontend hot reload**: Changes auto-reflect on save
- **Backend auto-restart**: Use `nodemon` or similar for auto-reload
- **Database migrations**: Run SQL scripts in `backend/scripts/`

## Environment Setup

Copy `backend/.env.example` to `backend/.env` and configure:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/astravision
JWT_SECRET_KEY=your-secret-key
FLASK_ENV=development
```

## Database Initialization

```bash
createdb astravision
psql -U postgres -d astravision -f backend/scripts/01-setup-database.sql
psql -U postgres -d astravision -f backend/scripts/02-add-detection-fields.sql
```

## Building for Production

```bash
# Frontend
npm run build

# Backend
# Use gunicorn: gunicorn -w 4 wsgi:app
```

## Documentation

- [Full Startup Guide](./STARTUP.md)
- [AI Features Setup](./backend/YOLO_GRADCAM_SETUP.md)
- [API Documentation](./backend/README.md)

## Team

Built by Aswinitha Patta, Adilsha Khan Pathan, Vinod Thadi, Ajay Jada, and Venkatesh Sunkara
