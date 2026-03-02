# AstraVision Development Setup

Complete guide to run the full-stack application locally.

## Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- PostgreSQL 14+
- Git

## Quick Start

### 1. Clone and Install Dependencies

```bash
# Frontend dependencies
npm install

# Backend dependencies
cd backend
pip install -r requirements.txt
```

### 2. Database Setup

```bash
# Create database
createdb astravision

# Run migrations
psql -U postgres -d astravision -f scripts/01-setup-database.sql
psql -U postgres -d astravision -f scripts/02-add-detection-fields.sql
```

### 3. Environment Configuration

Backend `.env` is already configured for development:
```
FLASK_ENV=development
DEBUG=True
SQLALCHEMY_DATABASE_URI=postgresql://postgres:postgres@localhost:5432/astravision
JWT_SECRET_KEY=your-jwt-secret-key-change-this-in-production
```

### 4. Run the Application

**Terminal 1 - Frontend (port 5173):**
```bash
npm run dev
```

**Terminal 2 - Backend (port 5000):**
```bash
cd backend
python wsgi.py
```

### 5. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## Authentication Flow

1. Click "Enter System" on landing page
2. Toggle between Login/Register
3. Credentials are stored with JWT tokens
4. Token auto-refreshes on expiration

## Image Upload Flow

1. Go to "Upload" tab
2. Drag & drop or select images
3. Auto-uploads with progress tracking
4. View all images in Dashboard

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/verify` - Verify token

### Images
- `POST /api/images/upload` - Upload image
- `GET /api/images` - List user images
- `GET /api/images/<id>` - Get image details
- `DELETE /api/images/<id>` - Delete image
- `POST /api/images/search` - Search similar images
- `POST /api/images/detect/<id>` - Run YOLO detection
- `POST /api/images/heatmap/<id>` - Generate Grad-CAM heatmap

## Troubleshooting

### CORS Errors
- Ensure backend is running on port 5000
- Check `CORS_ORIGINS` in backend `.env`

### Database Connection Errors
- Verify PostgreSQL is running
- Check `SQLALCHEMY_DATABASE_URI` in `.env`
- Ensure `astravision` database exists

### Upload Failures
- Check file size (max 50MB)
- Ensure `uploads/` directory exists
- Verify JWT token is valid

### Frontend Build Issues
- Clear `node_modules` and reinstall: `npm install`
- Clear Vite cache: `rm -rf .vite`

## Project Structure

```
.
├── src/                          # React frontend
│   ├── components/              # UI components
│   ├── context/                 # Auth context
│   ├── lib/                      # API client
│   └── App.tsx                  # Main app
├── backend/                      # Flask API
│   ├── app/
│   │   ├── routes/              # API endpoints
│   │   ├── models/              # Database models
│   │   ├── services/            # Business logic
│   │   ├── ai/                  # ML services (YOLO, Grad-CAM)
│   │   └── config/              # Settings
│   ├── scripts/                 # Database migrations
│   └── wsgi.py                  # Entry point
└── package.json                 # Frontend dependencies
```

## Development Tips

- Use React DevTools for component debugging
- Check browser console for frontend errors
- Check Flask logs for backend errors
- Use `curl` or Postman to test API endpoints directly
- Database can be inspected with `psql astravision`

## Next Steps

1. Create account and upload test images
2. Test visual search functionality
3. Run object detection on images
4. Generate Grad-CAM heatmaps
5. Explore full dashboard features

For detailed feature documentation, see:
- Frontend: `/COMPONENT_INTEGRATION_COMPLETE.md`
- Backend: `/backend/README.md`
- AI Features: `/backend/YOLO_GRADCAM_SETUP.md`
