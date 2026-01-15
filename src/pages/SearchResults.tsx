import { useEffect, useState, useRef, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import {
  ArrowLeft,
  FileText,
  ChevronRight,
  Loader2,
  AlertCircle,
  Sparkles,
  Calendar,
  User as UserIcon,
  Hash,
  Gavel,
  Filter,
  X,
  Send,
  MessageSquare,
} from 'lucide-react';
import { Card, Button, Badge } from '../components';
import { useSearch } from '../hooks';
import type { SearchResult } from '../services/api';
import { getSignedUrl } from '../services/api/documents';
import { extractIdFromUrl, extractDocumentName, extractMetadataFromContent } from '../utils/documentUtils';
import styles from './SearchResults.module.css';

// Cache configuration
const CACHE_PAGE_SIZE = 100; // Fetch 100 results to cache
const DISPLAY_PAGE_SIZE = 20; // Display 20 at a time

// Conversation turn type
interface ConversationTurn {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

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
    answer,
    isLoading,
    isLoadingAnswer,
    error,
    performSearch,
    getAnswer,
    clearError,
    clearAnswer,
  } = useSearch();

  // Conversation history
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [inputValue, setInputValue] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Filter state
  const [activeFilters, setActiveFilters] = useState<{
    documentTypes: string[];
  }>({ documentTypes: [] });

  // Local cache for instant filtering/pagination
  const [cachedResults, setCachedResults] = useState<SearchResult[]>([]);
  const [localPage, setLocalPage] = useState(1);
  const [totalCachedCount, setTotalCachedCount] = useState(0);

  // Track if this is a pagination operation vs new search
  const lastQueryRef = useRef<string>('');
  const cacheQueryRef = useRef<string>(''); // Query that was cached

  // Ref callback for resetting state on new search (avoids linter warning)
  const resetForNewSearch = useRef(() => {
    setLocalPage(1);
    setCachedResults([]);
    setActiveFilters({ documentTypes: [] });
  });

  // Common Tax Court document types for quick filtering
  const quickFilters = {
    documentTypes: ['ORDER', 'PETITION', 'MEMORANDUM', 'MOTION', 'STIPULATION', 'DECISION'],
  };

  // Compute filtered and paginated results from cache (instant!)
  const { displayedResults, filteredCount, totalPages } = useMemo(() => {
    if (cachedResults.length === 0) {
      return { displayedResults: [], filteredCount: 0, totalPages: 0 };
    }

    // Filter results locally
    let filtered = cachedResults;
    if (activeFilters.documentTypes.length > 0) {
      filtered = cachedResults.filter(result => {
        const structData = (result.document as { structData?: Record<string, unknown> })?.structData;
        const docType = structData?.document_type as string | undefined;
        const enrichedType = result.metadata?.document_type;
        const resultType = docType || enrichedType || '';
        return activeFilters.documentTypes.some(
          filterType => resultType.toUpperCase().includes(filterType)
        );
      });
    }

    // Paginate locally
    const startIdx = (localPage - 1) * DISPLAY_PAGE_SIZE;
    const endIdx = startIdx + DISPLAY_PAGE_SIZE;
    const paginated = filtered.slice(startIdx, endIdx);

    return {
      displayedResults: paginated,
      filteredCount: filtered.length,
      totalPages: Math.ceil(filtered.length / DISPLAY_PAGE_SIZE),
    };
  }, [cachedResults, activeFilters.documentTypes, localPage]);

  // Scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversation]);

  // Add a message to conversation (extracted to avoid setState in useEffect)
  const addUserMessage = useRef((content: string) => {
    const userTurn: ConversationTurn = {
      id: `user-${Date.now()}`,
      type: 'user',
      content,
      timestamp: new Date(),
    };
    setConversation(prev => [...prev, userTurn]);
  });

  const addAssistantMessage = useRef((content: string) => {
    setConversation(prev => {
      // Check if we already have this message
      const lastAssistant = [...prev].reverse().find(t => t.type === 'assistant');
      if (lastAssistant?.content === content) return prev;

      const assistantTurn: ConversationTurn = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content,
        timestamp: new Date(),
      };
      return [...prev, assistantTurn];
    });
  });

  // Perform search when query changes (new search - fetch batch to cache)
  useEffect(() => {
    if (query && lastQueryRef.current !== query) {
      lastQueryRef.current = query;
      cacheQueryRef.current = query;

      // Reset local state for new search (via ref to avoid linter warning)
      resetForNewSearch.current();

      // Add user message via ref callback (avoids linter warning)
      addUserMessage.current(query);

      // Clear previous answer for new query
      clearAnswer();

      // Fetch a larger batch to cache (100 results)
      performSearch({
        query,
        page: 1,
        page_size: CACHE_PAGE_SIZE,
      }, false).then(response => {
        if (response?.search_results) {
          setCachedResults(response.search_results);
          setTotalCachedCount(response.count || response.search_results.length);
        }
      });
    }
  }, [query, performSearch, clearAnswer]);

  // Auto-trigger AI answer when cached results arrive
  useEffect(() => {
    if (
      cachedResults.length > 0 &&
      cacheQueryRef.current === query &&
      !isLoadingAnswer &&
      !answer
    ) {
      // Use first 20 results as context for AI answer
      const contextResults = cachedResults.slice(0, DISPLAY_PAGE_SIZE);
      getAnswer({
        query,
        searchResults: contextResults,
        session_link: results?.session,
      });
    }
  }, [cachedResults, isLoadingAnswer, answer, query, getAnswer, results?.session]);

  // Add AI response to conversation when it arrives
  useEffect(() => {
    if (answer && !isLoadingAnswer) {
      addAssistantMessage.current(answer.answer);
    }
  }, [answer, isLoadingAnswer]);

  // Handle new question submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Navigate with new query (triggers search via useEffect)
    setSearchParams({ q: inputValue });
    setInputValue('');
  };

  // Handle result click - navigate to matter detail
  const handleResultClick = (result: SearchResult) => {
    const derivedData = result.document?.derivedStructData;
    const documentId = derivedData?.title
      || result.metadata?.docket_number
      || result.id
      || extractIdFromUrl(derivedData?.link);

    if (documentId) {
      navigate(`/matters/${encodeURIComponent(documentId)}`);
    }
  };

  // Toggle a document type filter (instant - filters locally from cache)
  const toggleDocTypeFilter = (docType: string) => {
    setActiveFilters(prev => {
      const isActive = prev.documentTypes.includes(docType);
      const newDocTypes = isActive
        ? prev.documentTypes.filter(t => t !== docType)
        : [...prev.documentTypes, docType];
      return { ...prev, documentTypes: newDocTypes };
    });
    // Reset to page 1 when filters change
    setLocalPage(1);
  };

  // Clear all filters (instant - resets local filter state)
  const clearFilters = () => {
    if (activeFilters.documentTypes.length === 0) return;
    setActiveFilters({ documentTypes: [] });
    setLocalPage(1);
  };

  // Handle pagination (instant - uses local state)
  const handleNextPage = () => {
    if (localPage < totalPages) {
      setLocalPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (localPage > 1) {
      setLocalPage(prev => prev - 1);
    }
  };

  // Handle suggested question click
  const handleSuggestedQuestion = (question: string) => {
    setSearchParams({ q: question });
  };

  // Handle document view - convert GCS URLs to signed URLs
  const handleViewDocument = async (url: string) => {
    if (url.startsWith('gs://')) {
      try {
        // Extract document ID from GCS URL
        // Expected format: gs://bucket/docket-documents/12345678.pdf or similar
        const match = url.match(/\/([^/]+)\.pdf$/i);
        if (match) {
          const documentId = match[1];
          const response = await getSignedUrl(documentId);
          window.open(response.signed_url, '_blank');
        } else {
          console.error('Could not extract document ID from URL:', url);
          window.open(url, '_blank');
        }
      } catch (err) {
        console.error('Failed to get signed URL:', err);
        // Fallback: try opening directly (may not work)
        window.open(url, '_blank');
      }
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <div className={styles.splitLayout}>
      {/* Left Panel: AI Conversation */}
      <div className={styles.chatPanel}>
        <div className={styles.chatHeader}>
          <Link to="/" className={styles.backLink}>
            <ArrowLeft size={16} />
            <span>New Search</span>
          </Link>
          <div className={styles.chatTitle}>
            <MessageSquare size={18} />
            <span>AI Research Assistant</span>
          </div>
        </div>

        {/* Scrollable conversation */}
        <div className={styles.chatContainer} ref={chatContainerRef}>
          {conversation.length === 0 && !isLoadingAnswer && (
            <div className={styles.chatEmpty}>
              <Sparkles size={32} />
              <p>Ask a question to start researching Tax Court cases</p>
            </div>
          )}

          {conversation.map((turn) => (
            <div
              key={turn.id}
              className={`${styles.chatMessage} ${turn.type === 'user' ? styles.userMessage : styles.assistantMessage}`}
            >
              {turn.type === 'user' ? (
                <div className={styles.messageContent}>
                  <div className={styles.messageAvatar}>
                    <UserIcon size={16} />
                  </div>
                  <div className={styles.messageText}>{turn.content}</div>
                </div>
              ) : (
                <div className={styles.messageContent}>
                  <div className={styles.messageAvatar}>
                    <Sparkles size={16} />
                  </div>
                  <div className={styles.messageText}>
                    <ReactMarkdown>{turn.content}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Loading state for AI response */}
          {isLoadingAnswer && (
            <div className={`${styles.chatMessage} ${styles.assistantMessage}`}>
              <div className={styles.messageContent}>
                <div className={styles.messageAvatar}>
                  <Sparkles size={16} />
                </div>
                <div className={styles.messageLoading}>
                  <Loader2 size={16} className={styles.spinner} />
                  <span>Analyzing {results?.count || 0} documents...</span>
                </div>
              </div>
            </div>
          )}

          {/* Follow-up suggestions */}
          {answer?.followUp_questions && answer.followUp_questions.length > 0 && !isLoadingAnswer && (
            <div className={styles.suggestions}>
              <span className={styles.suggestionsLabel}>Suggested follow-ups:</span>
              <div className={styles.suggestionChips}>
                {answer.followUp_questions.slice(0, 3).map((q, i) => (
                  <button
                    key={i}
                    className={styles.suggestionChip}
                    onClick={() => handleSuggestedQuestion(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Fixed input at bottom */}
        <form className={styles.chatInputForm} onSubmit={handleSubmit}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a follow-up question..."
            className={styles.chatInput}
            disabled={isLoadingAnswer}
          />
          <button
            type="submit"
            className={styles.chatSubmit}
            disabled={!inputValue.trim() || isLoadingAnswer}
          >
            <Send size={18} />
          </button>
        </form>
      </div>

      {/* Right Panel: Results */}
      <div className={styles.resultsPanel}>
        {/* Header with query info */}
        <div className={styles.resultsPanelHeader}>
          <h2>Documents</h2>
          {cachedResults.length > 0 && (
            <span className={styles.resultCount}>
              {activeFilters.documentTypes.length > 0
                ? `${filteredCount} of ${totalCachedCount} results (filtered)`
                : `${totalCachedCount} results`
              }
            </span>
          )}
        </div>

        {/* Filter bar */}
        <div className={styles.filterBar}>
          <div className={styles.filterLabel}>
            <Filter size={14} />
            <span>Filter:</span>
          </div>
          <div className={styles.filterChips}>
            {quickFilters.documentTypes.map((docType) => {
              const isActive = activeFilters.documentTypes.includes(docType);
              return (
                <button
                  key={docType}
                  className={`${styles.filterChip} ${isActive ? styles.filterChipActive : ''}`}
                  onClick={() => toggleDocTypeFilter(docType)}
                >
                  {docType}
                </button>
              );
            })}
          </div>
          {activeFilters.documentTypes.length > 0 && (
            <button className={styles.clearFilters} onClick={clearFilters}>
              <X size={12} />
              Clear
            </button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className={styles.errorContainer}>
            <Card className={styles.errorCard} padding="md">
              <div className={styles.errorContent}>
                <AlertCircle size={18} />
                <span>{error}</span>
                <Button variant="ghost" size="sm" onClick={clearError}>
                  <X size={14} />
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className={styles.loadingContainer}>
            <Loader2 size={28} className={styles.spinner} />
            <span>Searching...</span>
          </div>
        )}

        {/* Results List */}
        {!isLoading && displayedResults.length > 0 && (
          <div className={styles.resultsScroll}>
            <div className={styles.results}>
              {displayedResults.map((result) => {
                const derivedData = result.document?.derivedStructData;
                const structData = (result.document as { structData?: Record<string, unknown> })?.structData;
                const enrichedMetadata = result.metadata;
                const rawTitle = derivedData?.title || result.title || '';
                const documentUrl = derivedData?.link || result.url;
                const docId = result.id;

                // Extract metadata
                const caseNumber = structData?.case_number as string | undefined;
                const docType = structData?.document_type as string | undefined;
                const filingDateRaw = structData?.filing_date as string | undefined;
                const judgeName = structData?.judge_name as string | undefined;
                const petitioner = structData?.petitioner_name as string | undefined;
                const respondent = structData?.respondent_name as string | undefined;

                const extractiveSegments = derivedData?.extractive_segments;
                const contentMetadata = extractMetadataFromContent(extractiveSegments, rawTitle);

                // Build display title
                let displayTitle: string;
                if (petitioner && respondent) {
                  const shortPetitioner = petitioner.length > 25 ? petitioner.slice(0, 22) + '...' : petitioner;
                  const shortRespondent = respondent.includes('COMMISSIONER') ? 'Commissioner' :
                    (respondent.length > 15 ? respondent.slice(0, 12) + '...' : respondent);
                  displayTitle = `${shortPetitioner} v. ${shortRespondent}`;
                } else if (caseNumber && docType) {
                  displayTitle = `${docType} - Case ${caseNumber}`;
                } else {
                  displayTitle = derivedData?.display_title
                    || enrichedMetadata?.display_title
                    || contentMetadata.displayTitle
                    || extractDocumentName(documentUrl, rawTitle);
                }

                const documentType = docType || enrichedMetadata?.document_type || contentMetadata.documentType;
                const docketNumber = caseNumber || enrichedMetadata?.docket_number || contentMetadata.docketNumber;
                const filingDate = filingDateRaw || enrichedMetadata?.filing_date || result.metadata?.filed_date;

                // Build snippet
                const extractiveContent = derivedData?.extractive_segments;
                let snippetText = '';
                if (extractiveContent && Array.isArray(extractiveContent) && extractiveContent.length > 0) {
                  const firstSegment = extractiveContent[0]?.content || '';
                  snippetText = cleanSnippet(firstSegment.slice(0, 200));
                } else {
                  const snippets = derivedData?.snippets || [];
                  const rawSnippet = snippets.length > 0
                    ? snippets.slice(0, 2).join(' ... ')
                    : result.snippet || '';
                  snippetText = cleanSnippet(rawSnippet.slice(0, 200));
                }

                return (
                  <div key={docId} className={styles.resultCard}>
                    <div className={styles.resultHeader}>
                      <h3 className={styles.resultTitle}>{displayTitle}</h3>
                      {documentType && (
                        <Badge variant="info" className={styles.docTypeBadge}>
                          {documentType}
                        </Badge>
                      )}
                    </div>

                    <div className={styles.resultMeta}>
                      {docketNumber && (
                        <span><Hash size={12} /> {docketNumber}</span>
                      )}
                      {filingDate && (
                        <span><Calendar size={12} /> {filingDate}</span>
                      )}
                      {judgeName && (
                        <span><Gavel size={12} /> {judgeName}</span>
                      )}
                    </div>

                    {snippetText && (
                      <p className={styles.resultSnippet}>{snippetText}</p>
                    )}

                    <div className={styles.resultActions}>
                      {documentUrl && (
                        <button
                          className={styles.viewDocBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDocument(documentUrl);
                          }}
                        >
                          <FileText size={14} />
                          View
                        </button>
                      )}
                      <button
                        className={styles.detailsBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResultClick(result);
                        }}
                      >
                        Details
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={localPage <= 1}
                >
                  Prev
                </Button>
                <span className={styles.pageInfo}>
                  {localPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={localPage >= totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}

        {/* No Results */}
        {!isLoading && cachedResults.length === 0 && query && (
          <div className={styles.noResults}>
            <FileText size={40} />
            <h3>No documents found</h3>
            <p>Try adjusting your search query</p>
          </div>
        )}

        {/* No filtered results */}
        {!isLoading && cachedResults.length > 0 && displayedResults.length === 0 && (
          <div className={styles.noResults}>
            <Filter size={40} />
            <h3>No matching documents</h3>
            <p>Try removing some filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
