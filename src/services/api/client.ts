/**
 * API Client for IRS IDMS Backend
 *
 * Provides a consistent interface for making HTTP requests with:
 * - Automatic error handling
 * - Request/response logging in debug mode
 * - Timeout handling
 * - Authentication header injection
 */

import config from '../../config/env';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public endpoint: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends RequestInit {
  timeout?: number;
  skipAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number;

  constructor(baseUrl: string, defaultTimeout: number = config.API_TIMEOUT) {
    this.baseUrl = baseUrl;
    this.defaultTimeout = defaultTimeout;
  }

  private getAuthToken(): string | null {
    // Check for token in localStorage or cookie
    return localStorage.getItem('auth_token') || null;
  }

  private buildHeaders(options?: RequestOptions): Headers {
    const headers = new Headers(options?.headers);

    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    // Add auth token if available and not skipped
    if (!options?.skipAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    return headers;
  }

  private log(message: string, data?: unknown): void {
    if (config.DEBUG_MODE) {
      console.log(`[API] ${message}`, data ?? '');
    }
  }

  private logError(message: string, error: unknown): void {
    console.error(`[API Error] ${message}`, error);
  }

  async request<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const timeout = options?.timeout ?? this.defaultTimeout;

    this.log(`${options?.method || 'GET'} ${endpoint}`, options?.body);

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: this.buildHeaders(options),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse response
      const contentType = response.headers.get('content-type');
      let data: T;

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = (await response.text()) as unknown as T;
      }

      this.log(`Response ${response.status}`, data);

      // Handle error responses
      if (!response.ok) {
        throw new ApiError(
          (data as { message?: string; error?: string })?.message ||
            (data as { error?: string })?.error ||
            `Request failed with status ${response.status}`,
          response.status,
          endpoint,
          data
        );
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        this.logError(`Request timeout after ${timeout}ms`, endpoint);
        throw new ApiError(`Request timeout after ${timeout}ms`, 408, endpoint);
      }

      this.logError('Request failed', error);
      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        0,
        endpoint,
        error
      );
    }
  }

  async get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method'>): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method'>): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method'>): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async postFormData<T>(endpoint: string, formData: FormData, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    // Remove Content-Type header to let browser set it with boundary
    const headers = new Headers(options?.headers);
    headers.delete('Content-Type');

    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: formData,
      headers,
    });
  }
}

// Export singleton instances for each backend service
export const apiClient = new ApiClient(config.API_BASE_URL);
export const adkClient = new ApiClient(config.ADK_BASE_URL);

export default apiClient;
