/**
 * Sessions Service
 * Handles conversation session management
 */

import { apiClient } from './client';
import type {
  SessionHistoryResponse,
  AllSessionsResponse,
} from './types';

/**
 * Get conversation history for a session
 */
export async function getSessionHistory(
  sessionId: string,
  maxTurns?: number
): Promise<SessionHistoryResponse> {
  const params = new URLSearchParams();
  params.set('session_id', sessionId);
  if (maxTurns) params.set('max_turns', maxTurns.toString());

  return apiClient.get<SessionHistoryResponse>(`/api/get-session-history?${params.toString()}`);
}

/**
 * Get all sessions for a user
 */
export async function getAllSessions(userId: string): Promise<AllSessionsResponse> {
  return apiClient.get<AllSessionsResponse>(`/api/get-all-sessions?user_id=${encodeURIComponent(userId)}`);
}

/**
 * Add a chat message to session history
 */
export async function addChatToHistory(params: {
  question: string;
  session_id: string;
  user_id: string;
  content: string;
  sources?: Array<{
    title: string;
    url: string;
  }>;
}): Promise<{ session_id: string; success: boolean; message: string }> {
  return apiClient.post('/api/add-chat', params);
}

/**
 * Delete a session
 */
export async function deleteSession(
  sessionId: string,
  userId: string
): Promise<{ message: string; success: boolean }> {
  return apiClient.delete('/api/delete-session', {
    session_id: sessionId,
    user_id: userId,
  });
}

/**
 * Generate a new session ID
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export default {
  getSessionHistory,
  getAllSessions,
  addChatToHistory,
  deleteSession,
  generateSessionId,
};
