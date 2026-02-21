# Frontend-Backend Integration Guide

This guide explains how to integrate the AstraVision React frontend with the Flask backend.

## Backend Location

The Flask backend is in the `/backend` directory with its own setup and documentation:
- **Setup Instructions**: See `backend/SETUP.md`
- **API Documentation**: See `backend/README.md`

## API Base URL

Configure the API base URL in your React environment:

```tsx
// src/config/api.ts
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

Add to `.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Authentication Flow

### 1. Register New User

```typescript
async function registerUser(email: string, password: string, firstName?: string, lastName?: string) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      first_name: firstName,
      last_name: lastName
    })
  });
  
  if (!response.ok) throw new Error('Registration failed');
  return response.json();
}
```

### 2. Login User

```typescript
async function loginUser(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) throw new Error('Login failed');
  
  const data = await response.json();
  
  // Store tokens
  localStorage.setItem('accessToken', data.access_token);
  localStorage.setItem('refreshToken', data.refresh_token);
  
  return data;
}
```

### 3. Authenticated Requests

```typescript
function getAuthHeaders() {
  const token = localStorage.getItem('accessToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

// Example: Get current user
async function getCurrentUser() {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: getAuthHeaders()
  });
  
  if (response.status === 401) {
    // Token expired, try refresh
    await refreshToken();
    return getCurrentUser();
  }
  
  return response.json();
}
```

### 4. Refresh Token

```typescript
async function refreshToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${refreshToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    // Refresh failed, redirect to login
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
    return;
  }
  
  const data = await response.json();
  localStorage.setItem('accessToken', data.access_token);
  return data;
}
```

## Image Upload

### Upload Image and Generate Embedding

```typescript
async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE_URL}/images/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    },
    body: formData
  });
  
  if (!response.ok) throw new Error('Upload failed');
  
  return response.json(); // Returns { image: {...} }
}
```

## Image Search (Core Feature)

### Search for Similar Images

```typescript
interface SearchResult {
  image: {
    id: string;
    filename: string;
    file_path: string;
    width: number;
    height: number;
    uploaded_at: string;
  };
  similarity_score: number; // 0-1
}

async function searchSimilarImages(
  imageId: string,
  numResults: number = 10,
  similarityThreshold: number = 0.5
): Promise<SearchResult[]> {
  const response = await fetch(`${API_BASE_URL}/images/search`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      image_id: imageId,
      num_results: numResults,
      similarity_threshold: similarityThreshold
    })
  });
  
  if (!response.ok) throw new Error('Search failed');
  
  const data = await response.json();
  return data.results;
}
```

## Image Management

### List User Images

```typescript
async function getUserImages(limit: number = 100, offset: number = 0) {
  const response = await fetch(
    `${API_BASE_URL}/images?limit=${limit}&offset=${offset}`,
    {
      headers: getAuthHeaders()
    }
  );
  
  if (!response.ok) throw new Error('Failed to fetch images');
  return response.json();
}
```

### Get Image Details

```typescript
async function getImageDetails(imageId: string) {
  const response = await fetch(`${API_BASE_URL}/images/${imageId}`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) throw new Error('Image not found');
  return response.json();
}
```

### Delete Image

```typescript
async function deleteImage(imageId: string) {
  const response = await fetch(`${API_BASE_URL}/images/${imageId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  
  if (!response.ok) throw new Error('Delete failed');
  return response.json();
}
```

### Download Image File

```typescript
async function downloadImage(imageId: string) {
  const response = await fetch(`${API_BASE_URL}/images/file/${imageId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
  
  if (!response.ok) throw new Error('Download failed');
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'image.jpg';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
}
```

## Search History

### Get Search History

```typescript
async function getSearchHistory(limit: number = 50) {
  const response = await fetch(
    `${API_BASE_URL}/images/history?limit=${limit}`,
    {
      headers: getAuthHeaders()
    }
  );
  
  if (!response.ok) throw new Error('Failed to fetch history');
  return response.json();
}
```

## React Hook Example

```typescript
// hooks/useAstraVision.ts
import { useState, useCallback } from 'react';

export function useAstraVision() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const searchSimilarImages = useCallback(
    async (imageId: string, numResults?: number) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/images/search`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            image_id: imageId,
            num_results: numResults || 10,
            similarity_threshold: 0.5
          })
        });
        
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        return data.results;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );
  
  return { searchSimilarImages, loading, error };
}
```

## Error Handling

### Common HTTP Status Codes

- **200**: Success
- **201**: Created (upload successful)
- **400**: Bad request (validation error)
- **401**: Unauthorized (invalid/expired token)
- **404**: Not found
- **500**: Server error
- **503**: Service unavailable

```typescript
async function handleApiResponse(response: Response) {
  if (response.status === 401) {
    // Token expired, refresh and retry
    await refreshToken();
    // Retry original request
  } else if (response.status === 400) {
    const error = await response.json();
    console.error('Validation error:', error.error);
  } else if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}
```

## CORS Configuration

The backend CORS is configured in `backend/.env`:

```
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,https://yourdomain.com
```

For development, both Vite (5173) and development servers are included. Update for production.

## Rate Limiting

The API implements rate limiting:

- **File Upload**: 10 uploads per hour
- **Image Search**: 50 searches per hour
- **Default**: 100 requests per hour

If rate limited, you'll get a 429 response. Wait before retrying.

## Performance Tips

1. **Lazy Load Images**: Load search results as user scrolls
2. **Debounce Uploads**: Wait for user to finish selecting before uploading
3. **Cache Results**: Store search results locally
4. **Optimize Images**: Compress before uploading
5. **Batch Operations**: Search for multiple images in one request

## Development vs Production

### Development (Docker)
```bash
cd backend
docker-compose up
# Backend runs on http://localhost:5000
```

### Production
```bash
# Update .env with production URLs
CORS_ORIGINS=https://yourdomain.com
DATABASE_URL=your-production-db
# Deploy with gunicorn + nginx
```

## Troubleshooting

### CORS Errors
- Check `backend/.env` has your frontend URL in `CORS_ORIGINS`
- Ensure backend is running
- Check browser console for exact error

### Token Expired
- Implement automatic token refresh (shown above)
- Clear localStorage and re-login

### File Upload Fails
- Check file is under 50MB
- Check format is jpg/jpeg/png/gif/webp
- Check rate limit not exceeded

### Search Returns No Results
- Image might not be processed yet (wait 30s)
- Try lower `similarity_threshold`
- Ensure you have multiple images to compare against

## API Reference Summary

```
Authentication:
  POST   /api/auth/register
  POST   /api/auth/login
  GET    /api/auth/me
  POST   /api/auth/refresh
  PUT    /api/auth/me

Images:
  POST   /api/images/upload
  GET    /api/images
  GET    /api/images/{id}
  DELETE /api/images/{id}
  GET    /api/images/file/{id}
  POST   /api/images/search
  GET    /api/images/history

System:
  GET    /api/health
  GET    /api/info
```

For detailed documentation, see `backend/SETUP.md`
