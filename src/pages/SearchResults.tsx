import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  ChevronRight,
  Filter,
  Loader2,
  AlertCircle,
  Sparkles,
  X,
} from 'lucide-react';
import { Card, Button, Badge } from '../components';
import { useSearch } from '../hooks';
import type { SearchResult } from '../services/api';
import styles from './SearchResults.module.css';

export function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';

  // Search state from hook
  const {
    results,
    filters,
    answer,
    isLoading,
    isLoadingAnswer,
    error,
    performSearch,
    loadFilters,
    getAnswer,
    clearError,
  } = useSearch();

  // Local filter state
  const [selectedDocTypes, setSelectedDocTypes] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showAiAnswer, setShowAiAnswer] = useState(false);

  // Load filters on mount
  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  // Perform search when query changes
  useEffect(() => {
    if (query) {
      performSearch({
        query,
        document_type: selectedDocTypes.length > 0 ? selectedDocTypes : undefined,
        filed_by_role: selectedRoles.length > 0 ? selectedRoles : undefined,
        page: 1,
        page_size: 20,
      });
    }
  }, [query, selectedDocTypes, selectedRoles, performSearch]);

  // Handle filter changes
  const handleDocTypeToggle = (docType: string) => {
    setSelectedDocTypes((prev) =>
      prev.includes(docType)
        ? prev.filter((t) => t !== docType)
        : [...prev, docType]
    );
  };

  const handleRoleToggle = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const clearFilters = () => {
    setSelectedDocTypes([]);
    setSelectedRoles([]);
  };

  // Handle AI answer generation
  const handleGetAnswer = async () => {
    if (!results?.search_results) return;
    setShowAiAnswer(true);
    await getAnswer({
      query,
      searchResults: results.search_results,
      session_link: results.session,
    });
  };

  // Handle result click - navigate to matter detail
  const handleResultClick = (result: SearchResult) => {
    const docketNumber = result.metadata?.docket_number || result.id;
    navigate(`/matters/${encodeURIComponent(docketNumber)}`);
  };

  // Handle pagination
  const handleNextPage = () => {
    if (results?.pagination?.next_page_token) {
      performSearch({
        query,
        document_type: selectedDocTypes.length > 0 ? selectedDocTypes : undefined,
        filed_by_role: selectedRoles.length > 0 ? selectedRoles : undefined,
        page_token: results.pagination.next_page_token,
        page_size: 20,
      });
    }
  };

  const handlePrevPage = () => {
    if (results?.pagination?.has_previous && results.pagination.current_page > 1) {
      performSearch({
        query,
        document_type: selectedDocTypes.length > 0 ? selectedDocTypes : undefined,
        filed_by_role: selectedRoles.length > 0 ? selectedRoles : undefined,
        page: results.pagination.current_page - 1,
        page_size: 20,
        use_offset: true,
      });
    }
  };

  const activeFilterCount = selectedDocTypes.length + selectedRoles.length;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link to="/" className={styles.backLink}>
          <ArrowLeft size={16} />
          <span>Back to Search</span>
        </Link>
        <div className={styles.headerRow}>
          <div>
            <h1>Search Results</h1>
            <p>
              Query: "{query}"
              {results && ` • ${results.count} documents found`}
            </p>
          </div>
          <div className={styles.headerActions}>
            <Button
              variant="outline"
              icon={<Filter size={16} />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters{activeFilterCount > 0 && ` (${activeFilterCount})`}
            </Button>
            <Button
              variant="secondary"
              icon={<Sparkles size={16} />}
              onClick={handleGetAnswer}
              disabled={isLoadingAnswer || !results?.search_results?.length}
            >
              {isLoadingAnswer ? 'Generating...' : 'AI Answer'}
            </Button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className={styles.errorCard} padding="md">
          <div className={styles.errorContent}>
            <AlertCircle size={20} />
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={clearError}>
              Dismiss
            </Button>
          </div>
        </Card>
      )}

      {/* Filters Panel */}
      {showFilters && filters && (
        <Card className={styles.filtersPanel} padding="md">
          <div className={styles.filterHeader}>
            <h3>Filters</h3>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all
              </Button>
            )}
          </div>
          <div className={styles.filterGroups}>
            {filters.document_types?.length > 0 && (
              <div className={styles.filterGroup}>
                <h4>Document Type</h4>
                <div className={styles.filterChips}>
                  {filters.document_types.map((docType) => (
                    <button
                      key={docType}
                      className={`${styles.filterChip} ${
                        selectedDocTypes.includes(docType) ? styles.active : ''
                      }`}
                      onClick={() => handleDocTypeToggle(docType)}
                    >
                      {docType}
                      {selectedDocTypes.includes(docType) && <X size={12} />}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {filters.filed_by_roles?.length > 0 && (
              <div className={styles.filterGroup}>
                <h4>Filed By</h4>
                <div className={styles.filterChips}>
                  {filters.filed_by_roles.map((role) => (
                    <button
                      key={role}
                      className={`${styles.filterChip} ${
                        selectedRoles.includes(role) ? styles.active : ''
                      }`}
                      onClick={() => handleRoleToggle(role)}
                    >
                      {role}
                      {selectedRoles.includes(role) && <X size={12} />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* AI Answer Section */}
      {showAiAnswer && (
        <Card className={styles.answerCard} padding="lg">
          <div className={styles.answerHeader}>
            <Sparkles size={20} className={styles.answerIcon} />
            <h3>AI-Generated Answer</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAiAnswer(false)}
            >
              <X size={16} />
            </Button>
          </div>
          {isLoadingAnswer ? (
            <div className={styles.answerLoading}>
              <Loader2 size={24} className={styles.spinner} />
              <span>Generating answer from search results...</span>
            </div>
          ) : answer ? (
            <div className={styles.answerContent}>
              <p>{answer.answer}</p>
              {answer.sources?.length > 0 && (
                <div className={styles.answerSources}>
                  <h4>Sources</h4>
                  <ul>
                    {answer.sources.map((source, i) => (
                      <li key={i}>
                        <a href={source.url} target="_blank" rel="noopener noreferrer">
                          {source.source}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {answer.followUp_questions?.length > 0 && (
                <div className={styles.followUpQuestions}>
                  <h4>Related Questions</h4>
                  <div className={styles.questionChips}>
                    {answer.followUp_questions.map((q, i) => (
                      <button
                        key={i}
                        className={styles.questionChip}
                        onClick={() => {
                          setSearchParams({ q });
                          setShowAiAnswer(false);
                        }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className={styles.loadingContainer}>
          <Loader2 size={32} className={styles.spinner} />
          <span>Searching documents...</span>
        </div>
      )}

      {/* Results List */}
      {!isLoading && results?.search_results && (
        <>
          <div className={styles.results}>
            {results.search_results.map((result) => (
              <Card
                key={result.id}
                className={styles.resultCard}
                padding="lg"
              >
                <div className={styles.resultHeader}>
                  <div className={styles.resultTitle}>
                    <h3>{result.title}</h3>
                    {result.metadata?.document_type && (
                      <Badge variant="info">
                        {result.metadata.document_type}
                      </Badge>
                    )}
                  </div>
                  <ChevronRight size={20} className={styles.chevron} />
                </div>

                {result.metadata?.docket_number && (
                  <p className={styles.caseNumber}>
                    Docket: {result.metadata.docket_number}
                  </p>
                )}

                <p className={styles.snippet}>{result.snippet}</p>

                <div className={styles.resultMeta}>
                  {result.metadata?.filed_date && (
                    <span>Filed: {result.metadata.filed_date}</span>
                  )}
                  {result.metadata?.filed_by && (
                    <span>By: {result.metadata.filed_by}</span>
                  )}
                </div>

                <div className={styles.resultActions}>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<FileText size={14} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (result.url) {
                        window.open(result.url, '_blank');
                      }
                    }}
                  >
                    View Document
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResultClick(result);
                    }}
                  >
                    View Matter
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {results.pagination && (
            <div className={styles.pagination}>
              <Button
                variant="outline"
                onClick={handlePrevPage}
                disabled={!results.pagination.has_previous}
              >
                Previous
              </Button>
              <span className={styles.pageInfo}>
                Page {results.pagination.current_page} of{' '}
                {results.pagination.total_pages}
              </span>
              <Button
                variant="outline"
                onClick={handleNextPage}
                disabled={!results.pagination.has_next}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* No Results */}
      {!isLoading && results?.search_results?.length === 0 && (
        <Card className={styles.noResults} padding="lg">
          <FileText size={48} className={styles.noResultsIcon} />
          <h3>No documents found</h3>
          <p>Try adjusting your search query or filters</p>
          <Button variant="primary" onClick={() => navigate('/')}>
            New Search
          </Button>
        </Card>
      )}
    </div>
  );
}
