/**
 * useSearch Hook
 * React hook for search functionality with loading/error states
 */

import { useState, useCallback } from 'react';
import {
  search,
  getFilters,
  generateAnswer,
  type SearchRequest,
  type SearchResponse,
  type FiltersResponse,
  type AnswerRequest,
  type AnswerResponse,
  ApiError,
} from '../services/api';

interface UseSearchState {
  results: SearchResponse | null;
  filters: FiltersResponse | null;
  answer: AnswerResponse | null;
  isLoading: boolean;
  isLoadingAnswer: boolean;
  error: string | null;
}

interface UseSearchActions {
  performSearch: (params: SearchRequest) => Promise<SearchResponse | null>;
  loadFilters: () => Promise<FiltersResponse | null>;
  getAnswer: (params: AnswerRequest) => Promise<AnswerResponse | null>;
  clearResults: () => void;
  clearError: () => void;
}

export function useSearch(): UseSearchState & UseSearchActions {
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [filters, setFilters] = useState<FiltersResponse | null>(null);
  const [answer, setAnswer] = useState<AnswerResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = useCallback(async (params: SearchRequest): Promise<SearchResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await search(params);
      setResults(response);
      return response;
    } catch (err) {
      const message = err instanceof ApiError
        ? err.message
        : 'An error occurred while searching';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadFilters = useCallback(async (): Promise<FiltersResponse | null> => {
    try {
      const response = await getFilters();
      setFilters(response);
      return response;
    } catch (err) {
      const message = err instanceof ApiError
        ? err.message
        : 'Failed to load filters';
      setError(message);
      return null;
    }
  }, []);

  const getAnswer = useCallback(async (params: AnswerRequest): Promise<AnswerResponse | null> => {
    setIsLoadingAnswer(true);
    setError(null);

    try {
      const response = await generateAnswer(params);
      setAnswer(response);
      return response;
    } catch (err) {
      const message = err instanceof ApiError
        ? err.message
        : 'Failed to generate answer';
      setError(message);
      return null;
    } finally {
      setIsLoadingAnswer(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults(null);
    setAnswer(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    results,
    filters,
    answer,
    isLoading,
    isLoadingAnswer,
    error,
    performSearch,
    loadFilters,
    getAnswer,
    clearResults,
    clearError,
  };
}

export default useSearch;
