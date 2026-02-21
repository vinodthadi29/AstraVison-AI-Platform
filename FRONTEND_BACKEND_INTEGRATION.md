# AstraVision Frontend-Backend Integration Guide

## System Overview

This document provides complete integration details between the React frontend and Flask backend for the AstraVision visual similarity search platform.

## Project Structure

```
├── frontend/                  # React + TypeScript frontend
│   ├── src/
│   │   ├── lib/api.ts        # API client with all endpoints
│   │   ├── components/
│   │   │   ├── AuthPortal.tsx    # Authentication component
│   │   │   └── VisualSearch.tsx  # Search interface
│   └── ...
│
├── backend/                   # Flask REST API
│   ├── app/
│   │   ├── routes/
│   │   │   ├── auth.py       # Authentication endpoints
│   │   │   └── images.py     # Image upload & search endpoints
│   │   ├── services/         # Business logic
│   │   ├── models/           # Database models
│   │   └── ai/               # ML/AI services
│   ├── scripts/
│   │   ├── 01-setup-database.sql  # PostgreSQL setup
│   │   ├── 02-seed-images.py      # Test data generator
│   │   └── 03-e2e-test.py         # Integration tests
│   └── ...
```

## API Endpoints

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

Response (201):
{
  "success": true,
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "created_at": "2024-02-17T10:30:00Z"
    }
  }
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

Response (200):
{
  "success": true,
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "created_at": "2024-02-17T10:30:00Z"
    }
  }
}
```

#### Refresh Token
```
POST /api/auth/refresh
Content-Type: application/json
Authorization: Bearer {current_access_token}

Request:
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}

Response (200):
{
  "success": true,
  "data": {
    "access_token": "new_token_here",
    "refresh_token": "refresh_token_here",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "created_at": "2024-02-17T10:30:00Z"
    }
  }
}
```

### Image Upload Endpoints

#### Upload Image
```
POST /api/images/upload
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

Form Data:
- file: <image_file>

Response (201):
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "filename": "my_image.png",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "embedding": [0.123, -0.456, ..., 0.789],  // 1280 dimensions
    "created_at": "2024-02-17T10:35:00Z",
    "size": 45678
  }
}
```

#### Get Image Details
```
GET /api/images/{image_id}
Authorization: Bearer {access_token}

Response (200):
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "filename": "my_image.png",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "embedding": [0.123, -0.456, ..., 0.789],
    "created_at": "2024-02-17T10:35:00Z",
    "size": 45678
  }
}
```

#### List User Images
```
GET /api/images?limit=20&offset=0
Authorization: Bearer {access_token}

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "filename": "image1.png",
      ...
    },
    ...
  ]
}
```

### Search Endpoints

#### Search by Image Upload (Real-Time)
```
POST /api/images/search/upload
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

Form Data:
- file: <image_file>
- limit: 6  (optional, default: 6)

Response (200):
{
  "success": true,
  "data": {
    "query_image_id": "660e8400-e29b-41d4-a716-446655440000",
    "results": [
      {
        "id": "770e8400-e29b-41d4-a716-446655440000",
        "filename": "similar_image1.png",
        "similarity_score": 95.3,  // percentage (0-100)
        "created_at": "2024-02-17T10:40:00Z",
        "size": 56789
      },
      {
        "id": "880e8400-e29b-41d4-a716-446655440000",
        "filename": "similar_image2.png",
        "similarity_score": 87.6,
        "created_at": "2024-02-17T10:42:00Z",
        "size": 67890
      },
      ...
    ],
    "processing_time_ms": 287
  }
}
```

#### Search by Existing Image ID
```
POST /api/images/search?image_id={image_id}&limit=6
Authorization: Bearer {access_token}

Response (200):
{
  "success": true,
  "data": {
    "query_image_id": "660e8400-e29b-41d4-a716-446655440000",
    "results": [
      {
        "id": "770e8400-e29b-41d4-a716-446655440000",
        "filename": "similar_image1.png",
        "similarity_score": 95.3,
        "created_at": "2024-02-17T10:40:00Z",
        "size": 56789
      },
      ...
    ],
    "processing_time_ms": 245
  }
}
```

## Frontend Implementation

### API Client Setup

The frontend uses a centralized API client in `src/lib/api.ts`:

```typescript
import { authAPI, imageAPI, healthAPI } from '../lib/api';

// Token management (automatic)
// - Tokens stored in localStorage
// - Authorization header automatically added
// - 401 responses trigger logout

// Authentication
await authAPI.register(email, password);
await authAPI.login(email, password);
await authAPI.logout();

// Images
await imageAPI.upload(file);
await imageAPI.searchByUpload(file, limit);
await imageAPI.search(imageId, limit);
```

### Component Integration

#### AuthPortal Component
- Handles user registration/login
- Automatically stores JWT tokens
- Redirects on 401 unauthorized

#### VisualSearch Component
- Uploads images and calls search endpoint
- Displays real search results
- Shows embedding processing time

## Backend Architecture

### Database (PostgreSQL + pgvector)

**Setup:**
```bash
# 1. Create database
createdb astravision

# 2. Run migration
psql astravision < backend/scripts/01-setup-database.sql

# 3. Seed test data
python backend/scripts/02-seed-images.py
```

**Schema:**
- `users` - User accounts with authentication
- `images` - Uploaded images with 1280-dim embeddings
- `searches` - Search query history
- `search_results` - Individual result tracking

### AI/ML Pipeline

**Embedding Generation:**
- Model: MobileNetV2 (pretrained ImageNet)
- Output: 1280-dimensional vector
- Processing: Automatic on image upload
- Storage: pgvector format for efficient search

**Similarity Search:**
- Algorithm: Cosine similarity
- Index: IVFFLAT (Inverted File with Flat)
- Query: PostgreSQL `<=>` operator
- Performance: <500ms for typical queries

### Authentication

- Method: JWT (JSON Web Tokens)
- Access Token: 15 minutes expiration
- Refresh Token: 30 days expiration
- Password: bcrypt with 12-round salt
- Header: `Authorization: Bearer {token}`

## Running the System

### Development Setup

**Backend:**
```bash
# 1. Create virtual environment
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set environment variables
cp .env.example .env
# Edit .env with your configuration

# 4. Initialize database
python -m flask db upgrade

# 5. Run development server
python wsgi.py
# API will be available at http://localhost:5000
```

**Frontend:**
```bash
# 1. Install dependencies
npm install

# 2. Set API URL (in .env or environment)
REACT_APP_API_URL=http://localhost:5000/api

# 3. Start development server
npm run dev
# UI will be available at http://localhost:5173
```

### Running Tests

```bash
# End-to-End Integration Test
python backend/scripts/03-e2e-test.py --url http://localhost:5000

# Expected output:
# ✓ PASS - check_health
# ✓ PASS - register_user
# ✓ PASS - login_user
# ✓ PASS - upload_image
# ✓ PASS - verify_embedding
# ✓ PASS - search_similar_images
# 🎉 All tests passed! System is operational.
```

### Docker Deployment

```bash
# Start all services
docker-compose up -d

# Services:
# - Flask API: http://localhost:5000
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379

# Check logs
docker-compose logs -f api
```

## Error Handling

### Frontend Error Handling

All API errors include a `success: false` flag and `error` message:

```javascript
try {
  await imageAPI.upload(file);
} catch (error) {
  // error.message contains the error description
  console.error('Upload failed:', error.message);
}
```

### Common Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Process data |
| 201 | Created | Process data |
| 400 | Bad Request | Validate input |
| 401 | Unauthorized | Clear tokens, redirect to login |
| 404 | Not Found | Show 404 message |
| 429 | Rate Limited | Show rate limit message |
| 500 | Server Error | Retry or show error |

## Rate Limiting

- Image Upload: 10 per hour
- Image Search: 50 per hour
- Other endpoints: Unlimited

Rate limit headers included in responses:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

## Performance Metrics

**Typical Response Times:**
- Register: ~200ms
- Login: ~150ms
- Upload (5MB): ~800ms
- Search (cosine similarity): ~300ms
- Embedding generation: ~500ms

**Database Performance:**
- Vector search (100K embeddings): <500ms
- IVFFLAT index: ~100x faster than sequential

## Security Considerations

1. **CORS:** Configured for frontend domain
2. **HTTPS:** Required in production
3. **Password:** Bcrypt hashing (12 rounds)
4. **Tokens:** HTTP-only cookies (optional)
5. **Rate Limiting:** Redis-backed rate limiter
6. **CSRF:** Protected with SameSite cookies
7. **Input Validation:** Schema validation on all inputs

## Troubleshooting

### Token Expiration
- Automatic refresh on 401
- Frontend handles seamlessly
- Manual logout if refresh fails

### Embedding Errors
- Check image format (JPG, PNG, GIF, WebP)
- File size limits enforced
- Retry on processing failure

### Search Empty Results
- Verify embeddings are generated (`embedding_processed = true`)
- Check similarity threshold
- Run seed script if no test data

### Connection Issues
- Verify backend running: `curl http://localhost:5000/api/health`
- Check CORS headers
- Review error logs: `docker-compose logs api`

## Next Steps

1. Deploy to production
2. Set up monitoring and logging
3. Implement image preprocessing pipeline
4. Add advanced search filters
5. Build analytics dashboard
