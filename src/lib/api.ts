// API Configuration and Client
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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

// Token Management
const getStoredToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

const setStoredToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

const getStoredRefreshToken = (): string | null => {
  return localStorage.getItem('refresh_token');
};

const setStoredRefreshToken = (token: string): void => {
  localStorage.setItem('refresh_token', token);
};

const clearStoredTokens = (): void => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
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

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle token expiry
  if (response.status === 401) {
    clearStoredTokens();
    window.location.href = '/';
  }

  return response;
};

// Auth API
export const authAPI = {
  register: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const data: ApiResponse<AuthResponse> = await response.json();
    if (data.data) {
      setStoredToken(data.data.access_token);
      setStoredRefreshToken(data.data.refresh_token);
      return data.data;
    }
    throw new Error('Invalid response format');
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data: ApiResponse<AuthResponse> = await response.json();
    if (data.data) {
      setStoredToken(data.data.access_token);
      setStoredRefreshToken(data.data.refresh_token);
      return data.data;
    }
    throw new Error('Invalid response format');
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

// Health Check
export const healthAPI = {
  check: async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  },
};
