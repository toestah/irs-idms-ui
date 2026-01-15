import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  ChevronRight,
  Loader2,
  AlertCircle,
  Sparkles,
  Calendar,
  User,
  Hash,
  Scale,
  Gavel,
} from 'lucide-react';
import { Card, Button, Badge } from '../components';
import { useSearch } from '../hooks';
import type { SearchResult } from '../services/api';
import { extractIdFromUrl, extractDocumentName, extractMetadataFromContent } from '../utils/documentUtils';
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

  // Local state
  const [followUpQuestion, setFollowUpQuestion] = useState('');

  // Use ref to track auto-trigger to avoid cascading renders from setState in useEffect
  const hasAutoTriggeredAnswerRef = useRef(false);
  const lastQueryRef = useRef<string>('');

  // Note: /api/filters endpoint not yet available on backend
  // Filters will be enabled once backend supports this endpoint
  // useEffect(() => {
  //   loadFilters();
  // }, [loadFilters]);

  // Perform search when query changes
  useEffect(() => {
    if (query) {
      // Reset auto-trigger flag when query changes
      if (lastQueryRef.current !== query) {
        hasAutoTriggeredAnswerRef.current = false;
        lastQueryRef.current = query;
      }
      performSearch({
        query,
        page: 1,
        page_size: 20,
      });
    }
  }, [query, performSearch]);

  // Auto-trigger AI answer when search results arrive (the hero experience!)
  useEffect(() => {
    if (results?.search_results?.length && !hasAutoTriggeredAnswerRef.current && !isLoadingAnswer && !answer) {
      hasAutoTriggeredAnswerRef.current = true;
      getAnswer({
        query,
        searchResults: results.search_results,
        session_link: results.session,
      });
    }
  }, [results, isLoadingAnswer, answer, query, getAnswer]);

  // Handle follow-up question submission
  const handleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpQuestion.trim()) return;

    // Navigate to new search with the follow-up question
    setSearchParams({ q: followUpQuestion });
    setFollowUpQuestion('');
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

      {/* AI Answer Section - Always visible, the hero experience */}
      {(isLoadingAnswer || answer || results?.search_results?.length) && (
        <Card className={styles.answerCard} padding="lg">
          <div className={styles.answerHeader}>
            <Sparkles size={20} className={styles.answerIcon} />
            <h3>AI Answer</h3>
          </div>
          {isLoadingAnswer ? (
            <div className={styles.answerLoading}>
              <Loader2 size={24} className={styles.spinner} />
              <span>Analyzing documents and generating answer...</span>
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
                        onClick={() => setSearchParams({ q })}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.answerLoading}>
              <span>Waiting for search results...</span>
            </div>
          )}

          {/* Follow-up Question Input */}
          <form className={styles.followUpForm} onSubmit={handleFollowUp}>
            <input
              type="text"
              value={followUpQuestion}
              onChange={(e) => setFollowUpQuestion(e.target.value)}
              placeholder="Ask a follow-up question..."
              className={styles.followUpInput}
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!followUpQuestion.trim() || isLoadingAnswer}
            >
              Ask
            </Button>
          </form>
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
              // Extract data from nested structure - prioritize structData for rich metadata
              const derivedData = result.document?.derivedStructData;
              const structData = (result.document as { structData?: Record<string, unknown> })?.structData;
              const enrichedMetadata = result.metadata;
              const rawTitle = derivedData?.title || result.title || '';
              const documentUrl = derivedData?.link || result.url;
              const docId = result.id;

              // Extract metadata from structData (Discovery Engine metadata) - this is the primary source
              const caseNumber = structData?.case_number as string | undefined;
              const caseType = structData?.case_type as string | undefined;
              const courtName = structData?.court_name as string | undefined;
              const docType = structData?.document_type as string | undefined;
              const filingDateRaw = structData?.filing_date as string | undefined;
              const judgeName = structData?.judge_name as string | undefined;
              const judgeTitle = structData?.judge_title as string | undefined;
              const petitioner = structData?.petitioner_name as string | undefined;
              const respondent = structData?.respondent_name as string | undefined;
              const decisionDate = structData?.decision_date as string | undefined;

              // Extract metadata from content as fallback
              const extractiveSegments = derivedData?.extractive_segments;
              const contentMetadata = extractMetadataFromContent(extractiveSegments, rawTitle);

              // Build display title from case parties if available, otherwise use fallbacks
              let displayTitle: string;
              if (petitioner && respondent) {
                // Format: "Petitioner v. Commissioner" style
                const shortPetitioner = petitioner.length > 30 ? petitioner.slice(0, 27) + '...' : petitioner;
                const shortRespondent = respondent.includes('COMMISSIONER') ? 'Commissioner' :
                  (respondent.length > 20 ? respondent.slice(0, 17) + '...' : respondent);
                displayTitle = `${shortPetitioner} v. ${shortRespondent}`;
              } else if (caseNumber && docType) {
                displayTitle = `${docType} - Case ${caseNumber}`;
              } else {
                displayTitle = derivedData?.display_title
                  || enrichedMetadata?.display_title
                  || contentMetadata.displayTitle
                  || extractDocumentName(documentUrl, rawTitle);
              }

              // Get enriched metadata fields (structData first, then backend, then frontend extraction)
              const documentType = docType || enrichedMetadata?.document_type || contentMetadata.documentType;
              const docketNumber = caseNumber || enrichedMetadata?.docket_number || contentMetadata.docketNumber;
              const court = courtName || enrichedMetadata?.court || contentMetadata.court;
              const filingDate = filingDateRaw || enrichedMetadata?.filing_date || result.metadata?.filed_date;

              // Build snippet from extractive segments or use existing
              const extractiveContent = derivedData?.extractive_segments;
              let snippetText = '';
              if (extractiveContent && Array.isArray(extractiveContent) && extractiveContent.length > 0) {
                const firstSegment = extractiveContent[0]?.content || '';
                snippetText = cleanSnippet(firstSegment.slice(0, 300));
              } else {
                const snippets = derivedData?.snippets || [];
                const rawSnippet = snippets.length > 0
                  ? snippets.slice(0, 3).join(' ... ')
                  : result.snippet || '';
                snippetText = cleanSnippet(rawSnippet);
              }

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
                      {caseType && caseType !== documentType && (
                        <Badge variant="default">
                          {caseType}
                        </Badge>
                      )}
                    </div>
                    <ChevronRight size={20} className={styles.chevron} />
                  </div>

                  {/* Enriched metadata row */}
                  <div className={styles.resultMetaRow}>
                    {docketNumber && (
                      <span className={styles.metaItem}>
                        <Hash size={14} />
                        <span>Case {docketNumber}</span>
                      </span>
                    )}
                    {filingDate && (
                      <span className={styles.metaItem}>
                        <Calendar size={14} />
                        <span>Filed: {filingDate}</span>
                      </span>
                    )}
                    {decisionDate && decisionDate !== filingDate && (
                      <span className={styles.metaItem}>
                        <Scale size={14} />
                        <span>Decision: {decisionDate}</span>
                      </span>
                    )}
                    {judgeName && (
                      <span className={styles.metaItem}>
                        <Gavel size={14} />
                        <span>{judgeTitle ? `${judgeTitle} ` : ''}{judgeName}</span>
                      </span>
                    )}
                    {court && (
                      <span className={styles.metaItem}>
                        <User size={14} />
                        <span>{court.length > 35 ? court.slice(0, 32) + '...' : court}</span>
                      </span>
                    )}
                  </div>

                  {snippetText && (
                    <p className={styles.snippet}>{snippetText}</p>
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
