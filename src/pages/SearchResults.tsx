import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, FileText, CalendarPlus, ChevronRight } from 'lucide-react';
import { Card, Button, StatusBadge } from '../components';
import styles from './SearchResults.module.css';

interface SearchResult {
  id: string;
  title: string;
  caseNumber: string;
  status: 'confirmed' | 'scheduled' | 'upcoming';
  depositionDate: string;
  depositionTime: string;
  daysUntil: number;
  location: string;
  witnesses: string[];
}

const mockResults: SearchResult[] = [
  {
    id: '1',
    title: 'US vs John Doe',
    caseNumber: 'IRS-OCC-2024-001',
    status: 'confirmed',
    depositionDate: 'December 12, 2024',
    depositionTime: '10:00 AM EST',
    daysUntil: 4,
    location: 'Federal Courthouse, District of Columbia',
    witnesses: ['John Doe (Defendant)', 'CFO witness'],
  },
  {
    id: '2',
    title: 'SEC vs TechCorp Industries',
    caseNumber: 'SEC-2024-0892',
    status: 'scheduled',
    depositionDate: 'December 13, 2024',
    depositionTime: '2:00 PM EST',
    daysUntil: 5,
    location: 'Law Offices, 1200 K Street NW',
    witnesses: ['Former CEO', 'Board member'],
  },
  {
    id: '3',
    title: 'United States vs Martinez Holdings',
    caseNumber: 'IRS-OCC-2024-047',
    status: 'upcoming',
    depositionDate: 'December 14, 2024',
    depositionTime: '9:30 AM EST',
    daysUntil: 6,
    location: 'IRS Regional Office',
    witnesses: ['Financial Controller', 'External Auditor'],
  },
];

export function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link to="/" className={styles.backLink}>
          <ArrowLeft size={16} />
          <span>Back to Search</span>
        </Link>
        <h1>Search Results</h1>
        <p>Query: "{query}" &bull; {mockResults.length} matters found</p>
      </div>

      <div className={styles.results}>
        {mockResults.map((result) => (
          <Card key={result.id} className={styles.resultCard} padding="lg">
            <div className={styles.resultHeader}>
              <div className={styles.resultTitle}>
                <h3>Matter: {result.title}</h3>
                <StatusBadge status={result.status} />
              </div>
              <ChevronRight size={20} className={styles.chevron} />
            </div>
            <p className={styles.caseNumber}>{result.caseNumber}</p>

            <div className={styles.resultDetails}>
              <div className={styles.detailColumn}>
                <div className={styles.detailItem}>
                  <Calendar size={16} className={styles.detailIcon} />
                  <div>
                    <span className={styles.detailLabel}>Deposition Date & Time</span>
                    <p className={styles.detailValue}>{result.depositionDate}</p>
                    <p className={styles.detailValue}>{result.depositionTime}</p>
                    <span className={styles.daysUntil}>In {result.daysUntil} days</span>
                  </div>
                </div>
                <div className={styles.detailItem}>
                  <MapPin size={16} className={styles.detailIcon} />
                  <div>
                    <span className={styles.detailLabel}>Location</span>
                    <p className={styles.detailValue}>{result.location}</p>
                  </div>
                </div>
              </div>
              <div className={styles.detailColumn}>
                <div className={styles.detailItem}>
                  <Users size={16} className={styles.detailIcon} />
                  <div>
                    <span className={styles.detailLabel}>Witnesses</span>
                    <ul className={styles.witnessList}>
                      {result.witnesses.map((witness, i) => (
                        <li key={i}>{witness}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.resultActions}>
              <Button variant="outline" icon={<FileText size={16} />}>
                View Documents
              </Button>
              <Button variant="secondary" icon={<CalendarPlus size={16} />}>
                Add to Calendar
              </Button>
              {result.status === 'confirmed' && (
                <Button
                  variant="primary"
                  onClick={() => navigate(`/matters/${result.id}`)}
                >
                  View Matter Details
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
