# AstraVision AI Platform - Complete Setup Guide

## Overview
AstraVision is a full-stack AI platform for visual similarity search using MobileNetV2 embeddings. It consists of:
- **Frontend**: React + Vite (Port 5173)
- **Backend**: Flask + PostgreSQL + JWT (Port 5000)
- **Database**: Neon PostgreSQL with pgvector

## Prerequisites
- Node.js 16+ and npm/pnpm
- Python 3.9+
- Git
- Neon PostgreSQL account (free tier available)

## Step 1: Database Setup

### 1.1 Create Neon Database
1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project
3. Copy the connection string (looks like: `postgresql://user:password@ep-xxx.neon.tech:5432/dbname?sslmode=require`)

### 1.2 Initialize Database Tables
The database schema has already been initialized with the following tables:
- `users` - User accounts with password hashing
- `images` - Uploaded images with vector embeddings
- `search_results` - Search history and results

## Step 2: Frontend Setup

### 2.1 Install Dependencies
```bash
cd /path/to/project
npm install
# or
pnpm install
```

### 2.2 Create Frontend Environment File
```bash
# Create .env.local in root directory
echo "VITE_API_URL=http://localhost:5000/api" > .env.local
```

### 2.3 Start Frontend Dev Server
```bash
npm run dev
# Frontend will be available at http://localhost:5173
```

## Step 3: Backend Setup

### 3.1 Navigate to Backend Directory
```bash
cd backend
```

### 3.2 Create Python Virtual Environment
```bash
# Linux/Mac
python3 -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

### 3.3 Install Backend Dependencies
```bash
pip install -r requirements.txt
```

### 3.4 Create Backend Environment File
```bash
# Copy the example file
cp .env.example .env

# Edit .env and update:
# - DATABASE_URL: Use your Neon connection string
# - JWT_SECRET_KEY: Keep as is or generate a new one
# - FLASK_ENV: Set to 'development'
```

### 3.5 Start Backend Server
```bash
# Development mode with auto-reload
python wsgi.py

# Or with Flask CLI
export FLASK_APP=wsgi.py
flask run
```

**Backend will be available at http://localhost:5000**

## Step 4: Test Authentication

### 4.1 Test Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLC...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLC...",
    "user": {
      "id": "uuid-here",
      "email": "test@example.com",
      "created_at": "2024-01-01T00:00:00"
    }
  }
}
```

### 4.2 Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

### 4.3 Test Health Check
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "healthy",
  "timestamp": "2024-01-01T00:00:00"
}
```

## Step 5: Test Frontend Authentication

1. Open http://localhost:5173 in your browser
2. Click "Login" or wait for the auth portal
3. Enter credentials:
   - Email: `test@example.com`
   - Password: `TestPassword123`
4. You should see "Approved!" and be redirected to the main app

## Troubleshooting

### Frontend Issues

#### Issue: "Bad Gateway: Port 5173 is not reachable"
- **Cause**: Dev server not running
- **Solution**: 
  ```bash
  npm run dev
  ```
  Make sure you're in the project root directory

#### Issue: "Failed to fetch" or "Authentication failed"
- **Cause**: Backend not running or CORS misconfigured
- **Solution**:
  1. Start backend: `python wsgi.py`
  2. Check CORS_ORIGINS in backend/.env includes `http://localhost:5173`
  3. Verify DATABASE_URL is correct in backend/.env

#### Issue: Build errors or TypeScript errors
- **Cause**: Incorrect dependencies or syntax errors
- **Solution**:
  ```bash
  rm -rf node_modules
  npm install
  npm run dev
  ```

### Backend Issues

#### Issue: "Database connection refused"
- **Cause**: DATABASE_URL is incorrect or database is down
- **Solution**:
  1. Verify Neon connection string in backend/.env
  2. Test connection: `psql "your-database-url"`
  3. Ensure pgvector extension is enabled

#### Issue: "401 Unauthorized" errors
- **Cause**: Invalid token or JWT_SECRET_KEY mismatch
- **Solution**:
  1. Clear browser storage and re-login
  2. Ensure JWT_SECRET_KEY is consistent in backend/.env
  3. Check token hasn't expired (default 1 hour)

#### Issue: "Port 5000 already in use"
- **Cause**: Another process is using port 5000
- **Solution**:
  ```bash
  # Find and kill the process using port 5000
  # Linux/Mac:
  lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill
  
  # Windows:
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  ```

## Architecture Overview

### Authentication Flow
1. User enters email/password in frontend
2. Frontend sends to `POST /api/auth/register` or `POST /api/auth/login`
3. Backend verifies credentials with bcrypt
4. Backend generates JWT tokens
5. Frontend stores access token in localStorage
6. All subsequent requests include `Authorization: Bearer <token>` header

### Image Upload & Search Flow
1. User uploads image via frontend
2. Frontend sends to `POST /api/search/upload`
3. Backend processes image with MobileNetV2 model
4. Backend generates 1280-dimensional vector embedding
5. Backend searches pgvector database for similar images
6. Backend returns top 6 similar images with scores
7. Frontend displays results with similarity percentages

### Data Models

#### Users
```
id: UUID (primary key)
email: String (unique, indexed)
password_hash: String (bcrypt hash)
created_at: Timestamp
updated_at: Timestamp
```

#### Images
```
id: UUID (primary key)
user_id: UUID (foreign key to users)
filename: String
file_path: String
embedding: vector(1280) (pgvector)
created_at: Timestamp
```

#### Search Results
```
id: UUID (primary key)
user_id: UUID (foreign key to users)
query_image_id: UUID (foreign key to images)
result_image_id: UUID (foreign key to images)
similarity_score: Float (0-1 range)
created_at: Timestamp
```

## Security Best Practices

1. **Never commit `.env` file** - Add to `.gitignore`
2. **Change JWT_SECRET_KEY in production** - Generate a strong random key
3. **Use HTTPS in production** - All API calls should use HTTPS
4. **Implement rate limiting** - Already configured at 100/hour
5. **Validate all inputs** - Backend uses marshmallow for validation
6. **Use secure database connection** - Neon connection uses SSL mode
7. **Implement password requirements** - Minimum 8 characters

## Performance Tips

1. **Use connection pooling** - SQLAlchemy already configured
2. **Enable pgvector indexing** - IVFFlat index created for embeddings
3. **Cache search results** - Optional Redis integration available
4. **Compress image uploads** - Recommend max 5MB per image
5. **Use CDN for images** - Implement in production

## Deployment

### Deploy Frontend to Vercel
```bash
npm run build
# Push to GitHub and connect to Vercel
```

### Deploy Backend to Railway/Render
1. Push code to GitHub
2. Connect to Railway/Render
3. Set environment variables
4. Deploy

### Production Environment Variables
```
FLASK_ENV=production
DEBUG=False
SECRET_KEY=<generate-strong-random-key>
JWT_SECRET_KEY=<generate-strong-random-key>
DATABASE_URL=<your-neon-production-db>
CORS_ORIGINS=https://yourdomain.com
```

## Support & Resources

- **Frontend Issues**: Check console (F12) for errors
- **Backend Issues**: Check logs with `FLASK_ENV=development` and `LOG_LEVEL=DEBUG`
- **Database Issues**: Test connection with `psql` command
- **Documentation**: Check individual route files for endpoint details

## Next Steps

1. ✅ Database initialized
2. ✅ Frontend configured and running
3. ✅ Backend configured and running
4. ✅ Authentication working
5. Next: Upload images and test search functionality
