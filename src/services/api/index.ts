/**
 * API Services - Main Export
 *
 * Provides a unified interface to all backend API functionality
 */

// Export all types
export * from './types';

// Export the API client for direct use if needed
export { apiClient, adkClient, ApiError } from './client';

// Export individual services
export { default as searchService } from './search';
export { default as casesService } from './cases';
export { default as documentsService } from './documents';
export { default as sessionsService } from './sessions';
export { default as authService } from './auth';

// Re-export commonly used functions directly
export {
  search,
  getFilters,
  generateAnswer,
  followUp,
} from './search';

export {
  getCase,
  getCaseById,
} from './cases';

export {
  chatWithDocument,
  getSignedUrl,
  getVerificationQueue,
  getDocumentForVerification,
  submitVerification,
} from './documents';

export {
  getSessionHistory,
  getAllSessions,
  generateSessionId,
} from './sessions';

export {
  login,
  logout,
  isAuthenticated,
  getCurrentUser,
} from './auth';
