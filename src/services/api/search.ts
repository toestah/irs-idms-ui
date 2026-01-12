/**
 * Search Service
 * Handles document search via Discovery Engine
 */

import { apiClient } from './client';
import { SEARCH_TIMEOUT } from '../../config/env';
import type {
  SearchRequest,
  SearchResponse,
  FiltersResponse,
  AnswerRequest,
  AnswerResponse,
} from './types';

/**
 * Search for documents using natural language query
 */
export async function search(params: SearchRequest): Promise<SearchResponse> {
  return apiClient.post<SearchResponse>('/api/search', params, {
    timeout: SEARCH_TIMEOUT,
  });
}

/**
 * Get available filter options (document types, roles, docket numbers)
 */
export async function getFilters(): Promise<FiltersResponse> {
  return apiClient.get<FiltersResponse>('/api/filters');
}

/**
 * Generate AI-powered answer based on search results
 */
export async function generateAnswer(params: AnswerRequest): Promise<AnswerResponse> {
  return apiClient.post<AnswerResponse>('/api/answer', params);
}

/**
 * Handle follow-up questions with conversation context
 */
export async function followUp(params: {
  question: string;
  session_id: string;
  conversation_turn?: number;
  previous_query?: string;
  context?: {
    previous_answer?: string;
    search_results?: unknown[];
  };
  userId?: string;
  conversation_history?: Array<{
    question: string;
    answer: string;
  }>;
}): Promise<AnswerResponse> {
  return apiClient.post<AnswerResponse>('/api/follow-up', params);
}

/**
 * Stream search conversation via Server-Sent Events
 * Returns an EventSource for real-time updates
 */
export function streamConversation(_params: {
  query: string;
  session_id?: string;
  user_id?: string;
  filters?: Record<string, string[]>;
}): EventSource {
  const url = new URL('/api/conversations/stream', apiClient['baseUrl']);

  // Note: For POST SSE, we need to handle this differently
  // This is a simplified version - full implementation would use fetch with ReadableStream
  const eventSource = new EventSource(url.toString());

  return eventSource;
}

export default {
  search,
  getFilters,
  generateAnswer,
  followUp,
  streamConversation,
};
