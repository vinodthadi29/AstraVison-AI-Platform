# AstraVision System Startup Guide

## Quick Start (5 minutes)

### Prerequisites
- Python 3.9+
- Node.js 16+
- PostgreSQL 13+
- Redis (for caching)
- Docker & Docker Compose (optional but recommended)

### Option 1: Docker (Recommended)

```bash
# 1. Navigate to backend directory
cd backend

# 2. Start all services (Flask API, PostgreSQL, Redis)
docker-compose up -d

# 3. Initialize database
docker-compose exec api python scripts/02-seed-images.py

# 4. Verify backend is running
curl http://localhost:5000/api/health

# 5. In another terminal, start frontend
cd ..
npm install
npm run dev

# 6. Open browser to http://localhost:5173
```

### Option 2: Manual Setup

#### Step 1: Backend Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Create virtual environment
python -m venv venv

# Activate (Linux/Mac)
source venv/bin/activate
# Or Windows
venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create PostgreSQL database
createdb astravision

# 5. Set up environment
cp .env.example .env

# Edit .env and set:
# DATABASE_URL=postgresql://user:password@localhost:5432/astravision
# REDIS_URL=redis://localhost:6379/0
# JWT_SECRET=your-secret-key-here
# FLASK_ENV=development

# 6. Initialize database
psql astravision < scripts/01-setup-database.sql

# 7. Seed test data (100+ images)
python scripts/02-seed-images.py

# 8. Start Flask development server
python wsgi.py

# API available at http://localhost:5000
```

#### Step 2: Frontend Setup

```bash
# 1. In new terminal, navigate to project root
cd /path/to/astravision

# 2. Install frontend dependencies
npm install

# 3. Start development server
npm run dev

# UI available at http://localhost:5173
```

## Verify System is Working

### 1. Check Backend Health

```bash
curl http://localhost:5000/api/health

# Expected response:
# {"success":true,"message":"AstraVision API is running","status":"operational"}
```

### 2. Run E2E Integration Test

```bash
# Navigate to backend directory
cd backend

# Run full integration test
python scripts/03-e2e-test.py

# Expected output:
# → [HEALTH] Checking backend health...
# ✓ [HEALTH] Backend is online
# → [REGISTER] Registering user: e2e_test_1708172400@test.local...
# ✓ [REGISTER] User registered: 550e8400-e29b-41d4-a716-446655440000
# → [LOGIN] Logging in: e2e_test_1708172400@test.local...
# ✓ [LOGIN] Login successful
# → [UPLOAD] Generating and uploading test image...
# ✓ [UPLOAD] Image uploaded: 660e8400... (45678 bytes, 823.14ms)
# → [EMBEDDING] Verifying embedding for image 660e8400...
# ✓ [EMBEDDING] Valid embedding found: 1280 dimensions
# → [SEARCH] Searching for images similar to 660e8400...
# ✓ [SEARCH] Found 5 similar images (287ms processing)
#
# 6/6 tests passed
# 🎉 All tests passed! System is operational.
```

### 3. Test Frontend UI

1. Open browser to http://localhost:5173
2. Click "Enter System" button
3. Register with test credentials:
   - Email: `test@example.com`
   - Password: `TestPassword123!`
4. After login, navigate to "Visual Search" tab
5. Click "Upload file" and select any image
6. System should:
   - Show upload progress
   - Embed the image (automatic)
   - Find 6 similar images from test dataset
   - Display results with similarity scores

## System Components

### Backend Stack
- **Framework:** Flask 2.3+
- **Database:** PostgreSQL 13+ with pgvector
- **Cache:** Redis 6+
- **Auth:** Flask-JWT-Extended
- **ML:** TensorFlow/PyTorch (MobileNetV2)
- **API:** RESTful with CORS support

### Frontend Stack
- **Framework:** React 18 with TypeScript
- **Build:** Vite
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **HTTP:** Fetch API with custom client

### Database Schema
```
┌─────────────┐
│   users     │  - Authentication & user management
├─────────────┤
│ • id (UUID) │
│ • email     │
│ • password  │
│ • created   │
└────────┬────┘
         │ 1:N
         │
    ┌────┴─────────┐
    │    images    │  - Uploaded images with embeddings
    ├──────────────┤
    │ • id (UUID)  │
    │ • filename   │
    │ • embedding  │  (1280-dim vector)
    │ • created    │
    └────┬─────────┘
         │ 1:N
         │
    ┌────┴─────────┐
    │  searches    │  - Search query history
    └──────────────┘
```

## Environment Variables

### Backend (.env file)

```bash
# Flask Configuration
FLASK_APP=wsgi.py
FLASK_ENV=development
DEBUG=true
SECRET_KEY=your-secret-key-here

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/astravision

# Redis (Caching & Rate Limiting)
REDIS_URL=redis://localhost:6379/0

# JWT Configuration
JWT_SECRET=your-jwt-secret-key
JWT_ACCESS_LIFESPAN_HOURS=0.25  # 15 minutes
JWT_REFRESH_LIFESPAN_DAYS=30

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# File Upload
UPLOAD_FOLDER=./uploads
MAX_FILE_SIZE_MB=50
ALLOWED_EXTENSIONS=jpg,jpeg,png,gif,webp

# Logging
LOG_LEVEL=INFO

# AI Model
MODEL_NAME=mobilenetv2
EMBEDDING_DIMENSION=1280
```

### Frontend (.env file or environment)

```bash
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

## Common Issues & Solutions

### Issue 1: "connection refused" when starting frontend

**Problem:** Backend not running

**Solution:**
```bash
# Check if backend is running
curl http://localhost:5000/api/health

# If not running, start it
cd backend
python wsgi.py
```

### Issue 2: "CORS error" in browser console

**Problem:** CORS not configured correctly

**Solution:**
```bash
# Update backend .env:
CORS_ORIGINS=http://localhost:5173

# Restart backend
docker-compose restart api
# or
pkill -f "python wsgi.py"
python wsgi.py
```

### Issue 3: Database connection error

**Problem:** PostgreSQL not running or wrong credentials

**Solution:**
```bash
# Check PostgreSQL status
psql --version

# Connect to database
psql -U postgres

# Verify astravision database exists
\l

# If not, create it
createdb astravision
psql astravision < backend/scripts/01-setup-database.sql
```

### Issue 4: "No module named 'app'" when running seed script

**Problem:** Python path not set correctly

**Solution:**
```bash
# Make sure you're in backend directory
cd backend

# Run with python -m
python -m scripts.02-seed-images

# Or add to path first
cd backend
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
python scripts/02-seed-images.py
```

### Issue 5: Embeddings not being generated

**Problem:** MobileNetV2 model not loading

**Solution:**
```bash
# Check logs
docker-compose logs api

# Verify model can be imported
python -c "from torchvision.models import mobilenet_v2; print('Model OK')"

# Restart with verbose logging
FLASK_DEBUG=1 python wsgi.py
```

## Performance Tuning

### Database Optimization

```sql
-- Check IVFFLAT index
SELECT * FROM pg_stat_user_indexes WHERE relname LIKE '%embedding%';

-- Monitor query performance
EXPLAIN ANALYZE
SELECT * FROM images 
WHERE embedding <=> '[...]'::vector 
LIMIT 10;
```

### API Rate Limits

Configure in backend/.env:
```bash
# Requests per hour
UPLOAD_RATE_LIMIT=10/hour
SEARCH_RATE_LIMIT=50/hour
```

### Caching Strategy

Redis is used for:
- JWT token blacklist
- Rate limit tracking
- Embedding cache
- Search results cache

## Logging & Debugging

### View Backend Logs

```bash
# Docker
docker-compose logs -f api

# Local
FLASK_DEBUG=1 python wsgi.py

# Log file
tail -f logs/astravision.log
```

### Enable Debug Mode

```bash
# Backend
FLASK_ENV=development
FLASK_DEBUG=1
LOG_LEVEL=DEBUG

# Frontend
REACT_APP_DEBUG=true
```

## Stopping Services

```bash
# Docker
docker-compose down

# Local
# Press Ctrl+C in terminal running Flask
# Press Ctrl+C in terminal running npm dev
```

## Next Steps

1. ✅ Start the system using one of the options above
2. ✅ Run the E2E test to verify everything works
3. ✅ Test the UI with sample images
4. 📊 Check performance metrics
5. 🚀 Deploy to production
6. 📈 Set up monitoring and logging
7. 🔧 Configure backup strategy

## Support & Resources

- **API Documentation:** See FRONTEND_BACKEND_INTEGRATION.md
- **Backend Setup:** See backend/SETUP.md
- **README:** See backend/README.md
- **Database Schema:** See backend/scripts/01-setup-database.sql

## Deployment Checklist

- [ ] Database backups configured
- [ ] HTTPS enabled
- [ ] Environment variables set for production
- [ ] Rate limiting configured
- [ ] Monitoring and logging active
- [ ] Error tracking enabled (Sentry)
- [ ] CDN configured for static assets
- [ ] Database indexes created
- [ ] Redis persistence enabled
- [ ] Health checks configured

Happy coding! 🚀
