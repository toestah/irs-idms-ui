import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  ChevronRight,
  // Filter, // Hidden until backend supports /api/filters
  Loader2,
  AlertCircle,
  Sparkles,
  X,
  Calendar,
  User,
  Hash,
} from 'lucide-react';
import { Card, Button, Badge } from '../components';
import { useSearch } from '../hooks';
import type { SearchResult } from '../services/api';
import { extractIdFromUrl, extractDocumentName } from '../utils/documentUtils';
import styles from './SearchResults.module.css';

/**
 * Decode HTML entities in text (e.g., &nbsp;, &#39;, &amp;)
 */
function decodeHtmlEntities(text: string): string {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

/**
 * Clean up snippet text - decode entities, clean up formatting
 */
function cleanSnippet(text: string): string {
  if (!text) return '';

  // Decode HTML entities
  let cleaned = decodeHtmlEntities(text);

  // Replace multiple spaces with single space
  cleaned = cleaned.replace(/\s+/g, ' ');

  // Clean up ellipsis patterns (multiple dots)
  cleaned = cleaned.replace(/\.{3,}/g, '...');

  // Remove leading/trailing whitespace and ellipsis
  cleaned = cleaned.trim();

  return cleaned;
}



export function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';

  // Search state from hook
  const {
    results,
    // filters, // Not yet available on backend
    answer,
    isLoading,
    isLoadingAnswer,
    error,
    performSearch,
    // loadFilters, // Not yet available on backend
    getAnswer,
    clearError,
  } = useSearch();

  // Local filter state (disabled until backend supports /api/filters)
  // const [selectedDocTypes, setSelectedDocTypes] = useState<string[]>([]);
  // const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  // const [showFilters, setShowFilters] = useState(false);
  const [showAiAnswer, setShowAiAnswer] = useState(false);

  // Note: /api/filters endpoint not yet available on backend
  // Filters will be enabled once backend supports this endpoint
  // useEffect(() => {
  //   loadFilters();
  // }, [loadFilters]);

  // Perform search when query changes
  useEffect(() => {
    if (query) {
      performSearch({
        query,
        page: 1,
        page_size: 20,
      });
    }
  }, [query, performSearch]);

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
    // Try to find an identifier from various sources
    const derivedData = result.document?.derivedStructData;
    const documentId = derivedData?.title  // Often contains the doc ID like "0304-J"
      || result.metadata?.docket_number
      || result.id
      || extractIdFromUrl(derivedData?.link);

    if (documentId) {
      navigate(`/matters/${encodeURIComponent(documentId)}`);
    }
  };



  // Handle pagination
  const handleNextPage = () => {
    if (results?.pagination?.next_page_token) {
      performSearch({
        query,
        page_token: results.pagination.next_page_token,
        page_size: 20,
      });
    }
  };

  const handlePrevPage = () => {
    if (results?.pagination?.has_previous && results.pagination.current_page > 1) {
      performSearch({
        query,
        page: results.pagination.current_page - 1,
        page_size: 20,
        use_offset: true,
      });
    }
  };

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
        <div aria-live="polite" className={styles.errorContainer}>
          <Card className={styles.errorCard} padding="md">
            <div className={styles.errorContent}>
              <AlertCircle size={20} />
              <span>{error}</span>
              <Button variant="ghost" size="sm" onClick={clearError}>
                Dismiss
              </Button>
            </div>
          </Card>
        </div>
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
            {results.search_results.map((result) => {
              // Extract data from nested structure
              const derivedData = result.document?.derivedStructData;
              const enrichedMetadata = result.metadata;
              const rawTitle = derivedData?.title || result.title || '';
              const documentUrl = derivedData?.link || result.url;
              const docId = result.id;

              // Use display_title from backend if available, otherwise fall back to extraction
              const displayTitle = derivedData?.display_title
                || enrichedMetadata?.display_title
                || extractDocumentName(documentUrl, rawTitle);

              // Get enriched metadata fields
              const documentType = enrichedMetadata?.document_type || result.metadata?.document_type;
              const docketNumber = enrichedMetadata?.docket_number || result.metadata?.docket_number;
              const exhibitId = enrichedMetadata?.exhibit_id;
              const court = enrichedMetadata?.court;
              const filingDate = enrichedMetadata?.filing_date || result.metadata?.filed_date;

              // Combine and clean snippets for better context
              const snippets = derivedData?.snippets || [];
              const rawSnippet = snippets.length > 0
                ? snippets.slice(0, 3).join(' ... ')
                : result.snippet || '';
              const cleanedSnippet = cleanSnippet(rawSnippet);

              return (
                <Card
                  key={docId}
                  className={styles.resultCard}
                  padding="lg"
                >
                  <div className={styles.resultHeader}>
                    <div className={styles.resultTitle}>
                      <h3>{displayTitle}</h3>
                      {documentType && (
                        <Badge variant="info">
                          {documentType.length > 30 ? documentType.slice(0, 27) + '...' : documentType}
                        </Badge>
                      )}
                    </div>
                    <ChevronRight size={20} className={styles.chevron} />
                  </div>

                  {/* Enriched metadata row */}
                  <div className={styles.resultMetaRow}>
                    {exhibitId && (
                      <span className={styles.metaItem}>
                        <Hash size={14} />
                        <span>Exhibit {exhibitId}</span>
                      </span>
                    )}
                    {docketNumber && (
                      <span className={styles.metaItem}>
                        <FileText size={14} />
                        <span>Docket: {docketNumber}</span>
                      </span>
                    )}
                    {filingDate && (
                      <span className={styles.metaItem}>
                        <Calendar size={14} />
                        <span>{filingDate}</span>
                      </span>
                    )}
                    {court && (
                      <span className={styles.metaItem}>
                        <User size={14} />
                        <span>{court.length > 40 ? court.slice(0, 37) + '...' : court}</span>
                      </span>
                    )}
                  </div>

                  {cleanedSnippet && (
                    <p className={styles.snippet}>{cleanedSnippet}</p>
                  )}

                  <div className={styles.resultActions}>
                    {documentUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<FileText size={14} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(documentUrl, '_blank');
                        }}
                      >
                        View Document
                      </Button>
                    )}
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResultClick(result);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </Card>
              );
            })}
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
