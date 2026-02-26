// Minimal API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
  };
}

interface SearchResult {
  id: string;
  filename: string;
  similarity_score: number;
}

interface SearchResponse {
  results: SearchResult[];
}

let inMemoryToken: string | null = null;

const getStoredToken = (): string | null => {
  try {
    return typeof window !== 'undefined' ? localStorage.getItem('auth_token') : inMemoryToken;
  } catch {
    return inMemoryToken;
  }
};

const setStoredToken = (token: string): void => {
  inMemoryToken = token;
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  } catch (e) {
    console.warn('[v0] localStorage unavailable');
  }
};

const clearStoredTokens = (): void => {
  inMemoryToken = null;
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  } catch (e) {
    console.warn('[v0] Could not clear storage');
  }
};

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
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

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

export const authAPI = {
  register: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error(`Registration failed: ${response.status}`);
      }

      const data: ApiResponse<AuthResponse> = await response.json();
      if (data.data) {
        setStoredToken(data.data.access_token);
        return data.data;
      }
      throw new Error('Invalid response');
    } catch (error) {
      console.error('[v0] Register error:', error);
      throw error;
    }
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error(`Login failed: ${response.status}`);
      }

      const data: ApiResponse<AuthResponse> = await response.json();
      if (data.data) {
        setStoredToken(data.data.access_token);
        return data.data;
      }
      throw new Error('Invalid response');
    } catch (error) {
      console.error('[v0] Login error:', error);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await authenticatedFetch('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('[v0] Logout error:', error);
    }
    clearStoredTokens();
  },
};

export const imageAPI = {
  searchByUpload: async (file: File, limit: number): Promise<SearchResponse> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('limit', limit.toString());

      const response = await authenticatedFetch('/search/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data: ApiResponse<SearchResponse> = await response.json();
      return data.data || { results: [] };
    } catch (error) {
      console.error('[v0] Search error:', error);
      throw error;
    }
  },
};

export const healthAPI = {
  check: async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      console.warn('[v0] Health check failed');
      return false;
    }
  },
};
