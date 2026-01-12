/**
 * TypeScript types for the IRS IDMS Backend API
 * These types match the Flask backend at irs-backend
 */

// ============================================
// Common Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationInfo {
  total_results: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
  next_page_token?: string;
}

// ============================================
// Search Types
// ============================================

export interface SearchRequest {
  query: string;
  userId?: string;
  document_type?: string[];
  filed_by_role?: string[];
  docket_number?: string[];
  page?: number;
  page_size?: number;
  page_token?: string;
  use_offset?: boolean;
  session_link?: string;
  is_followUp?: boolean;
}

export interface DerivedStructData {
  link?: string;
  title?: string;
  snippets?: string[];
  extractive_segments?: Array<{
    content: string;
    page_number?: string;
  }>;
}

export interface SearchResultDocument {
  derivedStructData?: DerivedStructData;
}

export interface SearchResultMetadata {
  country?: string;
  type?: string;
  date?: string;
  document_type?: string;
  filed_by?: string;
  docket_number?: string;
  filed_date?: string;
}

export interface SearchResult {
  id: string;
  title: string;
  snippet: string;
  url?: string;
  document?: SearchResultDocument;
  metadata?: SearchResultMetadata;
}

export interface FacetValue {
  value: string;
  count: number;
}

export interface SearchFacets {
  countries?: FacetValue[];
  topics?: FacetValue[];
  document_types?: FacetValue[];
  filed_by_roles?: FacetValue[];
  docket_numbers?: FacetValue[];
}

export interface SearchResponse {
  queryId: string;
  search_results: SearchResult[];
  count: number;
  answer_session?: string;
  followUp_questions?: string[];
  summary?: {
    text: string;
  };
  pagination: PaginationInfo;
  facets?: SearchFacets;
  sources?: string[];
  session?: string;
  success: boolean;
}

// ============================================
// Filter Types
// ============================================

export interface FiltersResponse {
  document_types: string[];
  filed_by_roles: string[];
  docket_numbers: string[];
  success: boolean;
}

// ============================================
// Case/Matter Types
// ============================================

export interface DocketEntry {
  docket_entry_id: string;
  docket_number: string;
  filed_date: string;
  document_type: string;
  description: string;
  filed_by: string;
  filing_date: string;
  document_url?: string;
}

export interface Case {
  docket_number: string;
  case_name: string;
  filing_date: string;
  status: string;
  judge?: string;
  petitioner?: string;
  respondent?: string;
}

export interface CaseResponse {
  case: Case;
  docket_entries: DocketEntry[];
  success: boolean;
}

// ============================================
// Answer Generation Types
// ============================================

export interface AnswerRequest {
  query: string;
  userId?: string;
  queryId?: string;
  session_link?: string;
  searchResults?: SearchResult[];
  modelName?: string;
}

export interface Citation {
  text: string;
  source: string;
  url?: string;
  page?: number;
}

export interface AnswerResponse {
  answer: string;
  sources: Citation[];
  citations: string[];
  followUp_questions: string[];
  queryId?: string;
  session_link?: string;
  model?: string;
  success: boolean;
}

// ============================================
// Document Chat Types
// ============================================

export interface DocChatRequest {
  query: string;
  session_id?: string;
  gcs_url?: string;
}

export interface DocChatResponse {
  response: string;
  sources: Array<{
    page?: number;
    content?: string;
  }>;
  session_id: string;
  document_summary?: string;
  success: boolean;
}

// ============================================
// Session Types
// ============================================

export interface Session {
  session_id: string;
  title?: string;
  timestamp: number;
  message_count: number;
}

export interface ConversationTurn {
  turn: number;
  question: string;
  answer: string;
  timestamp: number;
}

export interface SessionHistoryResponse {
  session_id: string;
  conversation_history: ConversationTurn[];
  conversation_turns: number;
  status: string;
  created_at?: string;
  updated_at?: string;
  success: boolean;
}

export interface AllSessionsResponse {
  sessions: Session[];
  success: boolean;
}

// ============================================
// Document/Verification Types (for HITL)
// ============================================

export interface ExtractedField {
  id: string;
  fieldName: string;
  extractedValue: string;
  confidence: number;
  status: 'pending' | 'verified' | 'corrected' | 'rejected';
  correctedValue?: string;
  sourceLocation?: string;
}

export interface DocumentForVerification {
  id: string;
  title: string;
  docket_number: string;
  document_type: string;
  filed_date: string;
  confidence: number;
  status: 'pending' | 'in_progress' | 'verified' | 'rejected';
  extractedFields?: ExtractedField[];
  gcs_url?: string;
  preview_url?: string;
}

export interface DocumentQueueResponse {
  documents: DocumentForVerification[];
  total_count: number;
  pending_count: number;
  success: boolean;
}

// ============================================
// Signed URL Types
// ============================================

export interface SignedUrlRequest {
  gcs_url: string;
}

export interface SignedUrlResponse {
  signed_url: string;
  expires_in: number;
  success: boolean;
}

// ============================================
// Authentication Types
// ============================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  message?: string;
}

// ============================================
// Widget Token Types
// ============================================

export interface WidgetTokenRequest {
  userId: string;
  email: string;
  name: string;
}

export interface WidgetTokenResponse {
  token: string;
  expires_in: number;
  token_type: string;
  success: boolean;
}

// ============================================
// Health Check Types
// ============================================

export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  service: string;
  version?: string;
  services?: Record<string, string>;
}
