import { useEffect, useState, useRef } from 'react';
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
import { extractIdFromUrl, extractDocumentName, extractMetadataFromContent } from '../utils/documentUtils';
import styles from './SearchResults.module.css';

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

  // Track if this is a pagination operation vs new search
  const isPaginatingRef = useRef(false);
  const lastQueryRef = useRef<string>('');
  const lastFiltersRef = useRef<string[]>([]);

  // Common Tax Court document types for quick filtering
  const quickFilters = {
    documentTypes: ['ORDER', 'PETITION', 'MEMORANDUM', 'MOTION', 'STIPULATION', 'DECISION'],
  };

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

  // Perform search when query changes (new search, not pagination)
  useEffect(() => {
    if (query && lastQueryRef.current !== query) {
      lastQueryRef.current = query;
      isPaginatingRef.current = false;

      // Add user message via ref callback (avoids linter warning)
      addUserMessage.current(query);

      // Clear previous answer for new query
      clearAnswer();

      performSearch({
        query,
        page: 1,
        page_size: 20,
        document_type: activeFilters.documentTypes.length > 0 ? activeFilters.documentTypes : undefined,
      }, false);
    }
  }, [query, performSearch, clearAnswer, activeFilters.documentTypes]);

  // Auto-trigger AI answer when search results arrive
  useEffect(() => {
    if (
      results?.search_results?.length &&
      !isPaginatingRef.current &&
      !isLoadingAnswer &&
      !answer
    ) {
      // Pass filters to AI so it knows the context
      getAnswer({
        query,
        searchResults: results.search_results,
        session_link: results.session,
      });
    }
  }, [results, isLoadingAnswer, answer, query, getAnswer]);

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

  // Toggle a document type filter
  const toggleDocTypeFilter = (docType: string) => {
    setActiveFilters(prev => {
      const isActive = prev.documentTypes.includes(docType);
      const newDocTypes = isActive
        ? prev.documentTypes.filter(t => t !== docType)
        : [...prev.documentTypes, docType];

      // Only re-search if filters actually changed
      if (JSON.stringify(newDocTypes) !== JSON.stringify(lastFiltersRef.current)) {
        lastFiltersRef.current = newDocTypes;
        isPaginatingRef.current = false;

        // Clear answer to get new AI response with filtered context
        clearAnswer();

        performSearch({
          query,
          page: 1,
          page_size: 20,
          document_type: newDocTypes.length > 0 ? newDocTypes : undefined,
        }, false);
      }

      return { ...prev, documentTypes: newDocTypes };
    });
  };

  // Clear all filters
  const clearFilters = () => {
    if (activeFilters.documentTypes.length === 0) return;

    setActiveFilters({ documentTypes: [] });
    lastFiltersRef.current = [];
    isPaginatingRef.current = false;
    clearAnswer();

    performSearch({
      query,
      page: 1,
      page_size: 20,
    }, false);
  };

  // Handle pagination
  const handleNextPage = () => {
    if (results?.pagination?.next_page_token) {
      isPaginatingRef.current = true;
      performSearch({
        query,
        page_token: results.pagination.next_page_token,
        page_size: 20,
        document_type: activeFilters.documentTypes.length > 0 ? activeFilters.documentTypes : undefined,
      }, true);
    }
  };

  const handlePrevPage = () => {
    if (results?.pagination?.has_previous && results.pagination.current_page > 1) {
      isPaginatingRef.current = true;
      performSearch({
        query,
        page: results.pagination.current_page - 1,
        page_size: 20,
        use_offset: true,
        document_type: activeFilters.documentTypes.length > 0 ? activeFilters.documentTypes : undefined,
      }, true);
    }
  };

  // Handle suggested question click
  const handleSuggestedQuestion = (question: string) => {
    setSearchParams({ q: question });
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
          {results && (
            <span className={styles.resultCount}>
              {results.count} results
              {activeFilters.documentTypes.length > 0 && ' (filtered)'}
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
        {!isLoading && results?.search_results && (
          <div className={styles.resultsScroll}>
            <div className={styles.results}>
              {results.search_results.map((result) => {
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
                            window.open(documentUrl, '_blank');
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
            {results.pagination && results.pagination.total_pages > 1 && (
              <div className={styles.pagination}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={!results.pagination.has_previous}
                >
                  Prev
                </Button>
                <span className={styles.pageInfo}>
                  {results.pagination.current_page} / {results.pagination.total_pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={!results.pagination.has_next}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}

        {/* No Results */}
        {!isLoading && results?.search_results?.length === 0 && (
          <div className={styles.noResults}>
            <FileText size={40} />
            <h3>No documents found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
