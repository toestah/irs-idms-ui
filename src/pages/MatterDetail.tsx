import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Search,
  FileText,
  Users,
  Clock,
  Plus,
  FolderOpen,
  ChevronRight,
  Pencil,
  Settings,
  MoreVertical,
  ArrowLeft,
  Loader2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Card, Button, Badge } from '../components';
import { useCase } from '../hooks';
import { getSignedUrl } from '../services/api';
import type { DocketEntry } from '../services/api';
import styles from './MatterDetail.module.css';

interface TeamMember {
  initials: string;
  name: string;
  role: string;
  color: string;
}

interface RecentFile {
  name: string;
  icon: 'doc' | 'excel' | 'pdf';
  time: string;
}

// Mock team members - would come from a team/assignment API in the future
const teamMembers: TeamMember[] = [
  { initials: 'JS', name: 'Jack Smith', role: 'Lead counsel', color: '#3b82f6' },
  { initials: 'MK', name: 'Mike Kim', role: 'Writer, para', color: '#10b981' },
];

export function MatterDetail() {
  const { id: matterId } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch case data
  const { caseData, isLoading, error, fetchCase, clearError } = useCase();

  // Load case on mount
  useEffect(() => {
    if (matterId) {
      fetchCase(matterId);
    }
  }, [matterId, fetchCase]);

  // Group docket entries by document type
  const groupedEntries = caseData?.docket_entries?.reduce((acc, entry) => {
    const type = entry.document_type || 'Other';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(entry);
    return acc;
  }, {} as Record<string, DocketEntry[]>) || {};

  // Get recent files (most recent 5 docket entries)
  const recentFiles: RecentFile[] = (caseData?.docket_entries || [])
    .slice(0, 5)
    .map((entry) => ({
      name: entry.description || entry.document_type,
      icon: 'pdf' as const,
      time: entry.filed_date || 'Unknown date',
    }));

  // Handle search within matter
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}&docket=${encodeURIComponent(matterId || '')}`);
    }
  };

  // Handle document view
  const handleViewDocument = async (entry: DocketEntry) => {
    if (entry.document_url) {
      try {
        const response = await getSignedUrl(entry.document_url);
        if (response.signed_url) {
          window.open(response.signed_url, '_blank');
        }
      } catch {
        // Fallback to direct URL if signing fails
        window.open(entry.document_url, '_blank');
      }
    }
  };

  // Case info derived from API response
  const caseInfo = caseData?.case;
  const caseTitle = caseInfo?.case_name || `Case ${matterId}`;
  const docketNumber = caseInfo?.docket_number || matterId;

  return (
    <div className={styles.page}>
      {/* Back navigation */}
      <button className={styles.backButton} onClick={() => navigate(-1)}>
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      {/* Loading State */}
      {isLoading && (
        <div className={styles.loadingContainer}>
          <Loader2 size={32} className={styles.spinner} />
          <span>Loading case details...</span>
        </div>
      )}

      {/* Error State - Case Not Available */}
      {error && !isLoading && (
        <Card className={styles.notFoundCard} padding="lg">
          <div className={styles.notFoundContent}>
            <AlertCircle size={48} className={styles.notFoundIcon} />
            <h3>Case Details Not Available</h3>
            <p>{error}</p>
            <p className={styles.notFoundHint}>
              This document may be from a case that hasn't been fully indexed yet,
              or the case identifier format may not match our records.
            </p>
            <div className={styles.notFoundActions}>
              <Button variant="outline" onClick={() => navigate(-1)}>
                Go Back
              </Button>
              <Button variant="primary" onClick={() => navigate('/')}>
                New Search
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Main Content */}
      {!isLoading && caseData && (
        <>
          <div className={styles.matterHeader}>
            <div className={styles.matterIcon}>
              <span>{caseTitle.substring(0, 2).toUpperCase()}</span>
            </div>
            <div className={styles.matterInfo}>
              <h1>Matter: {caseTitle}</h1>
              <p>
                {docketNumber}
                {caseInfo?.status && (
                  <Badge
                    variant={caseInfo.status === 'active' ? 'info' : 'default'}
                    className={styles.statusBadge}
                  >
                    {caseInfo.status}
                  </Badge>
                )}
              </p>
              {caseInfo?.judge && <p className={styles.judge}>Judge: {caseInfo.judge}</p>}
            </div>
            <div className={styles.matterActions}>
              <Button variant="ghost" icon={<Search size={20} />} aria-label="Search" />
              <Button variant="ghost" icon={<Settings size={20} />} aria-label="Settings" />
              <Button variant="ghost" icon={<MoreVertical size={20} />} aria-label="More" />
              <div className={styles.userAvatar}>
                <span>JS</span>
              </div>
            </div>
          </div>

          <div className={styles.content}>
            <div className={styles.mainColumn}>
              <Card className={styles.searchCard}>
                <div className={styles.searchLabel}>
                  <FileText size={20} />
                  <span>Search within this matter</span>
                </div>
                <form className={styles.searchForm} onSubmit={handleSearch}>
                  <input
                    type="text"
                    placeholder='Ask a question (e.g., "What is the total transaction amount?")'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                  />
                  <button type="submit" className={styles.searchButton}>
                    <Search size={20} />
                  </button>
                </form>
              </Card>

              <div className={styles.infoCards}>
                <Card className={styles.wikiCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitle}>
                      <FileText size={20} />
                      <h2>Case Information</h2>
                    </div>
                    <Button variant="ghost" icon={<Pencil size={16} />} aria-label="Edit" />
                  </div>
                  {caseInfo && (
                    <div className={styles.caseDetails}>
                      {caseInfo.petitioner && (
                        <div className={styles.detailRow}>
                          <span className={styles.detailLabel}>Petitioner</span>
                          <span className={styles.detailValue}>{caseInfo.petitioner}</span>
                        </div>
                      )}
                      {caseInfo.respondent && (
                        <div className={styles.detailRow}>
                          <span className={styles.detailLabel}>Respondent</span>
                          <span className={styles.detailValue}>{caseInfo.respondent}</span>
                        </div>
                      )}
                      {caseInfo.filing_date && (
                        <div className={styles.detailRow}>
                          <span className={styles.detailLabel}>Filing Date</span>
                          <span className={styles.detailValue}>{caseInfo.filing_date}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className={styles.tags}>
                    <span className={styles.tag}>#{docketNumber}</span>
                    {caseInfo?.status && <span className={styles.tag}>#{caseInfo.status}</span>}
                  </div>
                </Card>

                <Card className={styles.teamCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitle}>
                      <Users size={20} />
                      <h2>Team</h2>
                    </div>
                    <Button variant="ghost" icon={<Plus size={16} />} aria-label="Add" />
                  </div>
                  <div className={styles.teamList}>
                    {teamMembers.map((member) => (
                      <div key={member.name} className={styles.teamMember}>
                        <div
                          className={styles.memberAvatar}
                          style={{ backgroundColor: member.color }}
                        >
                          {member.initials}
                        </div>
                        <div className={styles.memberInfo}>
                          <span className={styles.memberName}>{member.name}</span>
                          <span className={styles.memberRole}>{member.role}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <Card className={styles.activityCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>
                    <Clock size={20} />
                    <h2>RECENT FILINGS</h2>
                  </div>
                  <span className={styles.activityCount}>
                    {caseData.docket_entries?.length || 0} total entries
                  </span>
                </div>
                <div className={styles.recentFiles}>
                  {recentFiles.length > 0 ? (
                    recentFiles.map((file, index) => (
                      <div key={index} className={styles.recentFile}>
                        <FileText size={20} className={styles.fileIcon} />
                        <div className={styles.fileInfo}>
                          <span className={styles.fileName}>{file.name}</span>
                          <span className={styles.fileTime}>{file.time}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className={styles.emptyText}>No recent filings</p>
                  )}
                </div>
              </Card>

              {/* Docket Entries Table */}
              {caseData.docket_entries && caseData.docket_entries.length > 0 && (
                <Card className={styles.docketCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitle}>
                      <FolderOpen size={20} />
                      <h2>Docket Entries</h2>
                    </div>
                  </div>
                  <div className={styles.docketTable}>
                    <div className={styles.docketHeader}>
                      <span>Date</span>
                      <span>Type</span>
                      <span>Description</span>
                      <span>Filed By</span>
                      <span></span>
                    </div>
                    {caseData.docket_entries.map((entry) => (
                      <div key={entry.docket_entry_id} className={styles.docketRow}>
                        <span className={styles.docketDate}>{entry.filed_date}</span>
                        <span>
                          <Badge variant="info">{entry.document_type}</Badge>
                        </span>
                        <span className={styles.docketDescription}>{entry.description}</span>
                        <span className={styles.docketFiledBy}>{entry.filed_by}</span>
                        <span>
                          {entry.document_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<ExternalLink size={14} />}
                              onClick={() => handleViewDocument(entry)}
                              aria-label="View document"
                            />
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            <div className={styles.sideColumn}>
              <div className={styles.sectionIcon}>
                <FolderOpen size={24} />
              </div>
              <Button variant="outline" fullWidth icon={<Plus size={16} />}>
                Add Section
              </Button>

              <div className={styles.fileSections}>
                {Object.entries(groupedEntries).map(([type, entries]) => (
                  <Card key={type} className={styles.sectionCard}>
                    <FolderOpen size={20} />
                    <div className={styles.sectionInfo}>
                      <span className={styles.sectionName}>{type}</span>
                      <span className={styles.sectionCount}>{entries.length} items</span>
                    </div>
                    <ChevronRight size={20} className={styles.sectionChevron} />
                  </Card>
                ))}
              </div>

              <div className={styles.archivalSection}>
                <div className={styles.archivalLabel}>ARCHIVAL STORAGE</div>
                <p className={styles.archivalEmpty}>No archived sections</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Empty State - No case data and not loading */}
      {!isLoading && !caseData && !error && (
        <Card className={styles.emptyState} padding="lg">
          <FileText size={48} className={styles.emptyIcon} />
          <h3>Case Not Found</h3>
          <p>The requested case could not be found.</p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Back to Search
          </Button>
        </Card>
      )}
    </div>
  );
}
