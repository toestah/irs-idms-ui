/**
 * Documents Service
 * Handles document operations, verification, and chat
 */

import { apiClient } from './client';
import type {
  DocChatRequest,
  DocChatResponse,
  SignedUrlResponse,
  DocumentQueueResponse,
  DocumentForVerification,
} from './types';

/**
 * Chat with a document using AI
 */
export async function chatWithDocument(params: DocChatRequest): Promise<DocChatResponse> {
  return apiClient.post<DocChatResponse>('/api/doc-chat', params);
}

/**
 * Chat with a document from GCS
 */
export async function chatWithGcsDocument(params: {
  query: string;
  gcs_url: string;
  session_id?: string;
}): Promise<DocChatResponse> {
  return apiClient.post<DocChatResponse>('/api/gcs/chat', params);
}

/**
 * Upload document(s) for chat/analysis
 */
export async function uploadDocumentForChat(
  files: File[],
  query: string,
  sessionId?: string
): Promise<DocChatResponse> {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  formData.append('query', query);
  if (sessionId) formData.append('session_id', sessionId);

  return apiClient.postFormData<DocChatResponse>('/api/doc-chat', formData);
}

/**
 * Generate a signed URL for accessing a GCS document
 * @param documentId - The document ID (filename without extension)
 */
export async function getSignedUrl(documentId: string): Promise<SignedUrlResponse> {
  return apiClient.post<SignedUrlResponse>('/api/generate_signed_url', { document_id: documentId });
}

/**
 * Get documents pending verification (HITL queue)
 *
 * Note: This endpoint may need to be added to the backend
 * Currently returns mock data structure
 */
export async function getVerificationQueue(params?: {
  status?: 'pending' | 'in_progress' | 'verified' | 'rejected';
  page?: number;
  page_size?: number;
}): Promise<DocumentQueueResponse> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.page_size) searchParams.set('page_size', params.page_size.toString());

  const queryString = searchParams.toString();
  const endpoint = queryString ? `/api/documents/queue?${queryString}` : '/api/documents/queue';

  return apiClient.get<DocumentQueueResponse>(endpoint);
}

/**
 * Get a specific document for verification
 */
export async function getDocumentForVerification(documentId: string): Promise<{
  document: DocumentForVerification;
  success: boolean;
}> {
  return apiClient.get(`/api/documents/${encodeURIComponent(documentId)}/verification`);
}

/**
 * Submit verification results for a document
 */
export async function submitVerification(
  documentId: string,
  verificationData: {
    fields: Array<{
      id: string;
      status: 'verified' | 'corrected' | 'rejected';
      correctedValue?: string;
      notes?: string;
    }>;
    overallStatus: 'verified' | 'rejected';
    reviewerNotes?: string;
  }
): Promise<{ success: boolean; message: string }> {
  return apiClient.post(`/api/documents/${encodeURIComponent(documentId)}/verification`, verificationData);
}

/**
 * Upload a new document to the system
 */
export async function uploadDocument(
  file: File,
  metadata: {
    docket_number?: string;
    document_type?: string;
    description?: string;
  }
): Promise<{
  document_id: string;
  gcs_url: string;
  success: boolean;
}> {
  const formData = new FormData();
  formData.append('document', file);
  Object.entries(metadata).forEach(([key, value]) => {
    if (value) formData.append(key, value);
  });

  return apiClient.postFormData('/api/artifacts/upload', formData);
}

export default {
  chatWithDocument,
  chatWithGcsDocument,
  uploadDocumentForChat,
  getSignedUrl,
  getVerificationQueue,
  getDocumentForVerification,
  submitVerification,
  uploadDocument,
};
