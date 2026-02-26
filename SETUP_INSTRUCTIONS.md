# AstraVision AI Platform - Setup Instructions

## Prerequisites
- Node.js 16+ (for frontend)
- Python 3.8+ (for backend)
- npm or yarn (for frontend package management)

## Frontend Setup & Running

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The frontend will be available at: **http://localhost:5173**

You should see the AstraVision AI Platform landing page loaded.

## Backend Setup & Running

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Python Dependencies
```bash
pip install -r requirements.txt
```

Or if you're using pipenv:
```bash
pipenv install
```

### 3. Start Backend Server
```bash
python app.py
```

The backend will be running at: **http://localhost:5000**

The API will be accessible at: **http://localhost:5000/api**

## Testing the Integration

Once both frontend and backend are running:

1. Open http://localhost:5173 in your browser
2. You should see the AstraVision UI (no more "Failed to fetch" error)
3. Click on the auth portal to authenticate
4. Use any email/password to register or login
5. Try the Visual Search feature to upload and search images

## Common Issues

### "Failed to fetch" Error
- **Cause**: Backend server is not running
- **Solution**: Make sure you've started the backend with `python app.py`
- **Check**: Open http://localhost:5000/health in your browser - should return success

### Port Already in Use
- **Frontend** (5173): Run `npm run dev -- --port 3000` to use a different port
- **Backend** (5000): Modify `app.py` to use a different port, then update `.env` or `VITE_API_URL`

### Module Not Found Errors
- **Frontend**: Run `npm install` to ensure all dependencies are installed
- **Backend**: Run `pip install -r requirements.txt` to install Python dependencies

### Environment Variables
The frontend automatically defaults to `http://localhost:5000/api`. To use a different backend:

1. Create `.env.local` in the frontend root:
```
VITE_API_URL=http://your-backend-url/api
```

2. Restart the frontend dev server

## File Structure

```
.
├── src/                          # Frontend React/TypeScript source
│   ├── components/               # React components
│   ├── lib/api.ts               # API client with error handling
│   ├── index.tsx                # App entry point
│   └── App.tsx                  # Main app component
├── backend/                      # Python backend
│   ├── app.py                   # Flask app entry point
│   ├── requirements.txt          # Python dependencies
│   └── ...                       # Other backend files
├── vite.config.ts               # Vite build configuration
├── tailwind.config.ts           # Tailwind CSS configuration
└── package.json                 # Frontend dependencies
```

## Architecture Overview

### Frontend
- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **API Client**: Custom with timeout/error handling
- **Error Handling**: React Error Boundary + User-friendly messages

### Backend
- **Framework**: Flask (Python)
- **Authentication**: JWT tokens
- **Database**: PostgreSQL (or configured DB)
- **Features**: Image upload, AI-powered search, similarity matching

## API Endpoints

The frontend communicates with these backend endpoints:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Token refresh
- `POST /api/images/upload` - Upload image for search
- `POST /api/images/search/upload` - Search by uploading image
- `POST /api/images/search?image_id=X&limit=6` - Search by existing image
- `GET /api/images` - List all user's images
- `GET /api/images/:id` - Get specific image
- `DELETE /api/images/:id` - Delete image
- `GET /api/health` - Health check

## Troubleshooting Guide

See `DEBUGGING_GUIDE.md` for detailed troubleshooting of specific errors.

## Support

If you encounter issues:
1. Check the browser console (F12) for error messages
2. Check backend logs in the terminal
3. Verify both servers are running on correct ports
4. Ensure all dependencies are installed
5. Check `DEBUGGING_GUIDE.md` for solutions to common problems
