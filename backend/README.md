# AstraVision Backend

Production-grade Flask backend for Visual Similarity Retrieval System powered by MobileNetV2.

## 🚀 Features

- **Real AI Engine**: MobileNetV2 deep learning for image embeddings
- **Similarity Search**: Cosine similarity matching across image databases
- **Secure Auth**: JWT tokens + bcrypt password hashing
- **REST API**: Clean, documented endpoints
- **PostgreSQL + pgvector**: Scalable vector storage
- **Redis**: Caching and async tasks
- **Docker Ready**: Full containerization support
- **Production Scale**: Enterprise-grade logging, error handling, rate limiting

## 📋 Quick Start

### With Docker (Recommended)
```bash
cd backend
docker-compose up --build
```

### Manual Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python -m flask --app wsgi run --debug
```

The backend runs on `http://localhost:5000`

## 📚 Documentation

See [SETUP.md](./SETUP.md) for:
- Detailed installation instructions
- API endpoint documentation
- Architecture overview
- Deployment guides
- Troubleshooting

## 🏗️ Architecture

```
Flask Application
├── Authentication (JWT + Bcrypt)
├── Image Management (Upload, Storage, Deletion)
├── AI Pipeline (MobileNetV2 Embeddings)
├── Similarity Search (Cosine Matching)
└── Database (PostgreSQL + pgvector)
```

## 🔑 Key Endpoints

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

### Images
- `POST /api/images/upload` - Upload image
- `GET /api/images` - List user images
- `POST /api/images/search` - Find similar images
- `GET /api/images/history` - Search history

### System
- `GET /api/health` - Health check
- `GET /api/info` - System information

## 🛠️ Tech Stack

- **Framework**: Flask 3.0
- **Database**: PostgreSQL + pgvector
- **Cache**: Redis
- **AI/ML**: TensorFlow, MobileNetV2, scikit-learn
- **Auth**: Flask-JWT-Extended, bcrypt
- **Server**: Gunicorn + Docker

## 📦 Requirements

- Python 3.11+
- PostgreSQL 13+ with pgvector
- Redis 6+
- 2GB RAM minimum (for ML models)

## 🔐 Security

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens with expiration
- Rate limiting on sensitive endpoints
- CORS configuration
- SQL injection protection via ORM
- File upload validation

## 🚢 Deployment

Works with:
- Docker + Docker Compose
- Heroku
- AWS EC2
- Render
- DigitalOcean
- Any server supporting Gunicorn + PostgreSQL

## 🤝 Integration with Frontend

The Flask backend integrates with the React frontend via REST API. Frontend is at `/` with CORS enabled for development URLs.

Configure CORS origins in `.env`:
```
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,https://yourdomain.com
```

## 📊 Performance

- Image embedding: ~200-500ms per image
- Similarity search: <100ms for 10 results across 1000 images
- Token creation: <10ms
- Database queries optimized with indexes

## 🐛 Debugging

Enable debug logs:
```bash
export FLASK_ENV=development
export LOG_LEVEL=DEBUG
python -m flask --app wsgi run
```

View Docker logs:
```bash
docker-compose logs -f backend
```

## 📝 License

Part of AstraVision project

## 🆘 Support

For detailed setup, troubleshooting, and API docs, see [SETUP.md](./SETUP.md)
