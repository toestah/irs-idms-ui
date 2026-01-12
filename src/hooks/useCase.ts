/**
 * useCase Hook
 * React hook for fetching case/matter details
 */

import { useState, useCallback, useEffect } from 'react';
import {
  getCase,
  getCaseById,
  type CaseResponse,
  ApiError,
} from '../services/api';

interface UseCaseState {
  caseData: CaseResponse | null;
  isLoading: boolean;
  error: string | null;
}

interface UseCaseActions {
  fetchCase: (docketNumber: string) => Promise<CaseResponse | null>;
  fetchCaseById: (id: string) => Promise<CaseResponse | null>;
  clearCase: () => void;
  clearError: () => void;
}

interface UseCaseOptions {
  /** Automatically fetch case on mount if ID is provided */
  autoFetch?: boolean;
  /** Initial case ID or docket number to fetch */
  initialId?: string;
}

export function useCase(options: UseCaseOptions = {}): UseCaseState & UseCaseActions {
  const { autoFetch = false, initialId } = options;

  const [caseData, setCaseData] = useState<CaseResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCase = useCallback(async (docketNumber: string): Promise<CaseResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getCase(docketNumber);
      setCaseData(response);
      return response;
    } catch (err) {
      let message: string;
      if (err instanceof ApiError) {
        if (err.status === 404) {
          message = `Case "${docketNumber}" not found`;
        } else if (err.status === 0) {
          // Network error (often CORS) - the case likely doesn't exist in the database
          message = `Case details not available for "${docketNumber}"`;
        } else {
          message = err.message;
        }
      } else {
        message = 'Failed to load case details';
      }
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCaseById = useCallback(async (id: string): Promise<CaseResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getCaseById(id);
      setCaseData(response);
      return response;
    } catch (err) {
      const message = err instanceof ApiError
        ? err.status === 404
          ? `Case not found`
          : err.message
        : 'Failed to load case details';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearCase = useCallback(() => {
    setCaseData(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-fetch on mount if configured
  useEffect(() => {
    if (autoFetch && initialId) {
      if (initialId.includes('-')) {
        fetchCase(initialId);
      } else {
        fetchCaseById(initialId);
      }
    }
  }, [autoFetch, initialId, fetchCase, fetchCaseById]);

  return {
    caseData,
    isLoading,
    error,
    fetchCase,
    fetchCaseById,
    clearCase,
    clearError,
  };
}

export default useCase;
