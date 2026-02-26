// API Configuration and Client
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    created_at: string;
  };
}

interface ImageUploadResponse {
  id: string;
  filename: string;
  user_id: string;
  embedding: number[];
  created_at: string;
  size: number;
}

interface SearchResult {
  id: string;
  filename: string;
  similarity_score: number;
  created_at: string;
  size: number;
}

interface SearchResponse {
  query_image_id: string;
  results: SearchResult[];
  processing_time_ms: number;
}

// In-memory token fallback
let inMemoryToken: string | null = null;
let inMemoryRefreshToken: string | null = null;

// Safe Token Management with localStorage fallback
const getStoredToken = (): string | null => {
  try {
    return typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  } catch {
    return inMemoryToken;
  }
};

const setStoredToken = (token: string): void => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  } catch {
    console.warn('[v0] localStorage unavailable, using in-memory storage');
  }
  inMemoryToken = token;
};

const getStoredRefreshToken = (): string | null => {
  try {
    return typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
  } catch {
    return inMemoryRefreshToken;
  }
};

const setStoredRefreshToken = (token: string): void => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('refresh_token', token);
    }
  } catch {
    console.warn('[v0] localStorage unavailable, using in-memory storage');
  }
  inMemoryRefreshToken = token;
};

const clearStoredTokens = (): void => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
    }
  } catch {
    console.warn('[v0] Could not clear localStorage');
  }
  inMemoryToken = null;
  inMemoryRefreshToken = null;
};

// Fetch with timeout and error handling
const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 10000
): Promise<Response> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return response;
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - backend may be unavailable');
    }
    throw error;
  }
};

// Fetch with Authorization
const authenticatedFetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getStoredToken();
  const headers: HeadersInit = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle token expiry
    if (response.status === 401) {
      clearStoredTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }

    return response;
  } catch (error) {
    console.error('[v0] API call failed:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  register: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        try {
          const error = await response.json();
          throw new Error(error.error || `Registration failed: ${response.status}`);
        } catch {
          throw new Error(`Registration failed: ${response.status}`);
        }
      }

      const data: ApiResponse<AuthResponse> = await response.json();
      if (data.data) {
        setStoredToken(data.data.access_token);
        setStoredRefreshToken(data.data.refresh_token);
        return data.data;
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('[v0] Registration error:', error);
      throw error;
    }
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        try {
          const error = await response.json();
          throw new Error(error.error || `Login failed: ${response.status}`);
        } catch {
          throw new Error(`Login failed: ${response.status}`);
        }
      }

      const data: ApiResponse<AuthResponse> = await response.json();
      if (data.data) {
        setStoredToken(data.data.access_token);
        setStoredRefreshToken(data.data.refresh_token);
        return data.data;
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('[v0] Login error:', error);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    clearStoredTokens();
    await authenticatedFetch('/auth/logout', { method: 'POST' }).catch(() => {
      // Logout endpoint may not exist, that's fine
    });
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) throw new Error('No refresh token available');

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      clearStoredTokens();
      throw new Error('Token refresh failed');
    }

    const data: ApiResponse<AuthResponse> = await response.json();
    if (data.data) {
      setStoredToken(data.data.access_token);
      return data.data;
    }
    throw new Error('Invalid response format');
  },
};

// Image API
export const imageAPI = {
  upload: async (file: File): Promise<ImageUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await authenticatedFetch('/images/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const data: ApiResponse<ImageUploadResponse> = await response.json();
    if (data.data) return data.data;
    throw new Error('Invalid response format');
  },

  getAll: async (): Promise<ImageUploadResponse[]> => {
    const response = await authenticatedFetch('/images');

    if (!response.ok) {
      throw new Error('Failed to fetch images');
    }

    const data: ApiResponse<ImageUploadResponse[]> = await response.json();
    if (data.data) return data.data;
    return [];
  },

  getById: async (id: string): Promise<ImageUploadResponse> => {
    const response = await authenticatedFetch(`/images/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch image');
    }

    const data: ApiResponse<ImageUploadResponse> = await response.json();
    if (data.data) return data.data;
    throw new Error('Invalid response format');
  },

  delete: async (id: string): Promise<void> => {
    const response = await authenticatedFetch(`/images/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Delete failed');
    }
  },

  search: async (imageId: string, limit: number = 6): Promise<SearchResponse> => {
    const response = await authenticatedFetch(
      `/images/search?image_id=${imageId}&limit=${limit}`,
      { method: 'POST' }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Search failed');
    }

    const data: ApiResponse<SearchResponse> = await response.json();
    if (data.data) return data.data;
    throw new Error('Invalid response format');
  },

  searchByUpload: async (file: File, limit: number = 6): Promise<SearchResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('limit', limit.toString());

    const response = await authenticatedFetch('/images/search/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Search failed');
    }

    const data: ApiResponse<SearchResponse> = await response.json();
    if (data.data) return data.data;
    throw new Error('Invalid response format');
  },
};

// Health Check with timeout
export const healthAPI = {
  check: async (): Promise<boolean> => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/health`, {
        method: 'GET',
      }, 5000);
      return response.ok;
    } catch (error) {
      console.warn('[v0] Backend health check failed:', error);
      return false;
    }
  },
};

// Backend status monitoring
let isBackendAvailable = true;
export const getBackendStatus = (): boolean => isBackendAvailable;
export const setBackendStatus = (status: boolean): void => {
  isBackendAvailable = status;
};
