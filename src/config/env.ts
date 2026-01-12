/**
 * Environment configuration for API endpoints
 *
 * These values can be overridden via environment variables for different deployments:
 * - Local development
 * - GCP Sandbox (current)
 * - Treasury Cloud (future IRS deployment)
 */

interface EnvConfig {
  // Backend API URLs
  API_BASE_URL: string;
  ADK_BASE_URL: string;

  // Feature flags
  ENABLE_AI_ANSWERS: boolean;
  ENABLE_DOCUMENT_CHAT: boolean;
  ENABLE_SSE_STREAMING: boolean;

  // Timeouts (ms)
  API_TIMEOUT: number;
  SEARCH_TIMEOUT: number;

  // Debug
  DEBUG_MODE: boolean;
}

const config: EnvConfig = {
  // API URLs - these point to the deployed Cloud Run services
  // Checks VITE_API_URL first (used by CI/CD), then VITE_API_BASE_URL, then fallback
  API_BASE_URL: import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'https://irs-backend-5b63suhb3a-uc.a.run.app',
  ADK_BASE_URL: import.meta.env.VITE_ADK_URL || import.meta.env.VITE_ADK_BASE_URL || 'https://irs-adk-5b63suhb3a-uc.a.run.app',

  // Feature flags
  ENABLE_AI_ANSWERS: import.meta.env.VITE_ENABLE_AI_ANSWERS !== 'false',
  ENABLE_DOCUMENT_CHAT: import.meta.env.VITE_ENABLE_DOCUMENT_CHAT !== 'false',
  ENABLE_SSE_STREAMING: import.meta.env.VITE_ENABLE_SSE_STREAMING !== 'false',

  // Timeouts
  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10),
  SEARCH_TIMEOUT: parseInt(import.meta.env.VITE_SEARCH_TIMEOUT || '15000', 10),

  // Debug
  DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true' || import.meta.env.DEV,
};

export default config;

// Export individual values for convenience
export const {
  API_BASE_URL,
  ADK_BASE_URL,
  ENABLE_AI_ANSWERS,
  ENABLE_DOCUMENT_CHAT,
  ENABLE_SSE_STREAMING,
  API_TIMEOUT,
  SEARCH_TIMEOUT,
  DEBUG_MODE,
} = config;
