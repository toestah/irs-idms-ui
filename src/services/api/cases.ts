/**
 * Cases/Matters Service
 * Handles case data retrieval from BigQuery via the backend
 */

import { apiClient } from './client';
import type { CaseResponse } from './types';

/**
 * Get case details and docket entries by docket number
 */
export async function getCase(docketNumber: string): Promise<CaseResponse> {
  return apiClient.get<CaseResponse>(`/api/case/${encodeURIComponent(docketNumber)}`);
}

/**
 * Get case details by internal ID
 * Falls back to docket number lookup if needed
 */
export async function getCaseById(id: string): Promise<CaseResponse> {
  // The backend uses docket_number as the primary identifier
  // If the ID looks like a docket number, use it directly
  if (id.includes('-')) {
    return getCase(id);
  }

  // Otherwise, try to fetch by ID (may need backend endpoint update)
  return apiClient.get<CaseResponse>(`/api/case/${encodeURIComponent(id)}`);
}

/**
 * Search for cases by various criteria
 * Note: Currently uses the main search endpoint
 */
export async function searchCases(params: {
  query?: string;
  docket_numbers?: string[];
  status?: string;
  judge?: string;
  page?: number;
  page_size?: number;
}): Promise<CaseResponse[]> {
  // This would need a dedicated endpoint or use the search API with filters
  const searchParams = new URLSearchParams();
  if (params.query) searchParams.set('q', params.query);
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.page_size) searchParams.set('page_size', params.page_size.toString());

  // Placeholder - actual implementation depends on backend support
  return apiClient.get<CaseResponse[]>(`/api/cases?${searchParams.toString()}`);
}

export default {
  getCase,
  getCaseById,
  searchCases,
};
