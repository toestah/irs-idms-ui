/**
 * Authentication Service
 * Handles user authentication and token management
 */

import { apiClient } from './client';
import type {
  LoginRequest,
  LoginResponse,
  WidgetTokenRequest,
  WidgetTokenResponse,
  HealthResponse,
} from './types';

const AUTH_TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

/**
 * Login with email and password
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/api/login', credentials, {
    skipAuth: true,
  });

  if (response.success && response.token) {
    localStorage.setItem(AUTH_TOKEN_KEY, response.token);
    if (response.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    }
  }

  return response;
}

/**
 * Logout - clear stored credentials
 */
export function logout(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Get current auth token
 */
export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Get current user data
 */
export function getCurrentUser(): { id: string; email: string; name: string } | null {
  const userData = localStorage.getItem(USER_KEY);
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

/**
 * Generate a widget token for embedded components
 */
export async function generateWidgetToken(
  params: WidgetTokenRequest
): Promise<WidgetTokenResponse> {
  return apiClient.post<WidgetTokenResponse>('/api/widget-token', params);
}

/**
 * Initiate OAuth login flow (redirects to Azure AD)
 */
export function initiateOAuthLogin(): void {
  window.location.href = `${apiClient['baseUrl']}/auth/login`;
}

/**
 * Check backend health
 */
export async function checkHealth(): Promise<HealthResponse> {
  return apiClient.get<HealthResponse>('/health', { skipAuth: true });
}

/**
 * Check conversations service health
 */
export async function checkConversationsHealth(): Promise<HealthResponse> {
  return apiClient.get<HealthResponse>('/api/conversations/health', { skipAuth: true });
}

export default {
  login,
  logout,
  getAuthToken,
  getCurrentUser,
  isAuthenticated,
  generateWidgetToken,
  initiateOAuthLogin,
  checkHealth,
  checkConversationsHealth,
};
