# AstraVision Backend Setup Guide

## Overview

This is a production-grade Flask backend for the AstraVision Visual Similarity Retrieval System. It implements:

- **Real Visual Similarity Engine** using MobileNetV2 deep learning
- **JWT Authentication** with secure password hashing
- **REST API** for image upload, processing, and similarity search
- **PostgreSQL + pgvector** for scalable vector storage
- **Redis** for caching and background tasks
- **Docker** ready for containerized deployment

## Prerequisites

- Python 3.11+
- PostgreSQL 13+ (with pgvector extension)
- Redis 6+
- Docker & Docker Compose (optional, for containerized setup)

## Quick Start with Docker (Recommended)

### 1. Clone and Navigate

```bash
cd backend
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings
nano .env
```

### 3. Start Services

```bash
docker-compose up --build
```

This will:
- Start PostgreSQL with pgvector extension
- Start Redis
- Start Flask backend on http://localhost:5000

### 4. Verify Installation

```bash
curl http://localhost:5000/api/health
```

## Manual Setup (Development)

### 1. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure PostgreSQL

```bash
# Install PostgreSQL (macOS example)
brew install postgresql@15
brew services start postgresql@15

# Create database and enable pgvector
createdb astravision
psql astravision -c "CREATE EXTENSION pgvector;"
```

Or use Docker just for database:
```bash
docker run -d \
  --name astravision-db \
  -e POSTGRES_USER=astravision \
  -e POSTGRES_PASSWORD=astravision_password \
  -e POSTGRES_DB=astravision \
  -p 5432:5432 \
  ankane/postgres-vector:latest
```

### 4. Configure Redis

```bash
# macOS
brew install redis
brew services start redis

# Or with Docker
docker run -d -p 6379:6379 redis:7-alpine
```

### 5. Setup Environment Variables

```bash
cp .env.example .env
nano .env
```

Update with your configuration:
```
FLASK_ENV=development
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://astravision:password@localhost:5432/astravision
REDIS_URL=redis://localhost:6379/0
JWT_SECRET_KEY=your-jwt-secret
```

### 6. Initialize Database

```bash
python -c "from app import create_app; app = create_app(); app.app_context().push()"
```

### 7. Run Development Server

```bash
python -m flask --app wsgi run --debug
```

The backend will be available at http://localhost:5000

## API Documentation

### Authentication Endpoints

#### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "first_name": "John",
  "last_name": "Doe"
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}

Response:
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### Get Current User
```bash
GET /api/auth/me
Authorization: Bearer {access_token}
```

#### Refresh Token
```bash
POST /api/auth/refresh
Authorization: Bearer {refresh_token}
```

### Image Endpoints

#### Upload Image
```bash
POST /api/images/upload
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

file: (image file)
```

#### List User Images
```bash
GET /api/images?limit=100&offset=0
Authorization: Bearer {access_token}
```

#### Get Image Details
```bash
GET /api/images/{image_id}
Authorization: Bearer {access_token}
```

#### Delete Image
```bash
DELETE /api/images/{image_id}
Authorization: Bearer {access_token}
```

#### Download Image File
```bash
GET /api/images/file/{image_id}
Authorization: Bearer {access_token}
```

### Similarity Search Endpoints

#### Search Similar Images
```bash
POST /api/images/search
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "image_id": "uuid-of-query-image",
  "num_results": 10,
  "similarity_threshold": 0.5
}

Response:
{
  "search_id": "uuid",
  "query_image_id": "uuid",
  "num_results": 10,
  "execution_time_ms": 234.5,
  "results": [
    {
      "image": { ... },
      "similarity_score": 0.95
    },
    ...
  ]
}
```

#### Get Search History
```bash
GET /api/images/history?limit=50
Authorization: Bearer {access_token}
```

### System Endpoints

#### Health Check
```bash
GET /api/health
```

#### System Info
```bash
GET /api/info
```

## Architecture

```
app/
├── __init__.py              # Application factory
├── config/
│   └── settings.py          # Configuration management
├── extensions.py            # Flask extensions
├── models/
│   ├── user.py             # User model
│   ├── image.py            # Image model with embeddings
│   ├── search.py           # Search and results models
│   └── __init__.py
├── services/
│   ├── auth_service.py     # Authentication logic
│   ├── image_service.py    # Image operations
│   └── __init__.py
├── ai/
│   ├── embeddings.py       # MobileNetV2 embedding extraction
│   ├── similarity.py       # Cosine similarity search
│   └── __init__.py
└── routes/
    ├── auth.py             # Auth endpoints
    ├── images.py           # Image endpoints
    ├── system.py           # System endpoints
    └── __init__.py

wsgi.py                      # WSGI entry point
requirements.txt             # Dependencies
Dockerfile                   # Container image
docker-compose.yml          # Multi-container setup
```

## Key Features

### 1. Real Visual Similarity Engine
- Uses pretrained MobileNetV2 from ImageNet
- Extracts 1280-dimensional feature embeddings
- L2 normalization for efficient cosine similarity
- Scales to thousands of images

### 2. Security
- Bcrypt password hashing (12 rounds)
- JWT token-based authentication
- Secure HTTP-only cookies ready
- Row-level security compatible with PostgreSQL RLS

### 3. Performance
- Model caching for inference speed
- Efficient batch processing
- Rate limiting on sensitive endpoints
- Vector indexing ready (pgvector native)

### 4. Production Ready
- Comprehensive error handling
- Structured logging
- Health check endpoint
- Docker containerization
- Gunicorn WSGI server

## Performance Optimization

### Image Processing
- Resize to 224x224 (MobileNetV2 input)
- Compress before storage
- Async embedding generation (implement with Celery)

### Vector Search
- Use pgvector native operations in PostgreSQL
- HNSW indexing for million-scale datasets
- Batch processing for multiple queries

### Caching
- Redis for session tokens
- Model inference caching
- Search result caching

## Deployment

### Deploy to Heroku
```bash
heroku create astravision-backend
heroku addons:create heroku-postgresql:standard-0
heroku config:set FLASK_ENV=production
git push heroku main
```

### Deploy to AWS EC2
```bash
# SSH into instance
ssh ec2-user@instance

# Clone repo
git clone <repo>
cd backend

# Setup with Docker Compose
docker-compose up -d
```

### Deploy to Render
```bash
# Push to GitHub
git push origin main

# Create new Web Service on render.com
# Set environment variables
# Point to wsgi.py
```

## Monitoring & Logging

Access logs are written to stdout (Gunicorn default).

For production logging:
```python
# Add to config/settings.py
import logging
from logging.handlers import RotatingFileHandler

handler = RotatingFileHandler('logs/app.log', maxBytes=10485760, backupCount=10)
handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s: %(message)s'))
app.logger.addHandler(handler)
```

## Troubleshooting

### "No module named 'tensorflow'"
```bash
pip install --upgrade tensorflow
```

### "psycopg2 error"
```bash
pip install psycopg2-binary
```

### "pgvector extension not found"
```bash
# Using Docker
docker-compose down
docker-compose up --build

# Or manually:
psql astravision -c "CREATE EXTENSION pgvector;"
```

### Database connection issues
```bash
# Check PostgreSQL is running
psql -U postgres -d astravision

# Update DATABASE_URL in .env
```

## Next Steps

1. **Implement Background Tasks**: Use Celery for async embedding generation
2. **Add CLIP Integration**: For semantic search alongside visual similarity
3. **Implement Caching**: Redis cache for frequent searches
4. **Add Analytics**: Track searches, popular images, user behavior
5. **Scale Vector Search**: Implement FAISS for sub-millisecond retrieval
6. **Frontend Integration**: Connect to React frontend via CORS

## Support

For issues or questions:
1. Check SETUP.md (this file)
2. Review API documentation above
3. Check application logs: `docker-compose logs -f backend`
4. Open GitHub issues

## License

Part of AstraVision project
