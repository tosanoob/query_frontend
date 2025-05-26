import { fetchWithAuth } from '../utils/auth';
import { API_BASE_URL } from '../utils/constants';

interface ApiOptions extends Omit<RequestInit, 'headers'> {
  token?: string;
  headers?: Record<string, string>;
}

export const apiClient = {
  get: async <T>(url: string, options: ApiOptions = {}): Promise<T> => {
    const { token, headers = {}, ...restOptions } = options;
    const requestHeaders: Record<string, string> = {
      'ngrok-skip-browser-warning': '1',
      ...headers
    };

    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetchWithAuth(`${API_BASE_URL}${url}`, {
      ...restOptions,
      headers: requestHeaders
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: `HTTP error ${response.status}` }));
      throw new Error(error.detail || `Failed with status ${response.status}`);
    }

    return response.json();
  },

  post: async <T>(url: string, data: any, options: ApiOptions = {}): Promise<T> => {
    const { token, headers = {}, ...restOptions } = options;
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': '1',
      ...headers
    };

    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetchWithAuth(`${API_BASE_URL}${url}`, {
      method: 'POST',
      body: JSON.stringify(data),
      ...restOptions,
      headers: requestHeaders
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: `HTTP error ${response.status}` }));
      throw new Error(error.detail || `Failed with status ${response.status}`);
    }

    return response.json();
  },

  postFormData: async <T>(url: string, formData: FormData, options: ApiOptions = {}): Promise<T> => {
    const { token, headers = {}, ...restOptions } = options;
    const requestHeaders: Record<string, string> = {
      'ngrok-skip-browser-warning': '1',
      ...headers
    };

    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetchWithAuth(`${API_BASE_URL}${url}`, {
      method: 'POST',
      body: formData, // FormData will set the correct content-type with boundary
      ...restOptions,
      headers: requestHeaders
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: `HTTP error ${response.status}` }));
      throw new Error(error.detail || `Failed with status ${response.status}`);
    }

    return response.json();
  },

  put: async <T>(url: string, data: any, options: ApiOptions = {}): Promise<T> => {
    const { token, headers = {}, ...restOptions } = options;
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': '1',
      ...headers
    };

    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetchWithAuth(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...restOptions,
      headers: requestHeaders
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: `HTTP error ${response.status}` }));
      throw new Error(error.detail || `Failed with status ${response.status}`);
    }

    return response.json();
  },

  delete: async <T>(url: string, options: ApiOptions = {}): Promise<T> => {
    const { token, headers = {}, ...restOptions } = options;
    const requestHeaders: Record<string, string> = {
      'ngrok-skip-browser-warning': '1',
      ...headers
    };

    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetchWithAuth(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
      ...restOptions,
      headers: requestHeaders
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: `HTTP error ${response.status}` }));
      throw new Error(error.detail || `Failed with status ${response.status}`);
    }

    return response.json();
  }
}; 