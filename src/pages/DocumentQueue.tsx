import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Download, Filter, FileText } from 'lucide-react';
import {
  Card,
  Button,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  ConfidenceBadge,
} from '../components';
import styles from './DocumentQueue.module.css';

interface Document {
  id: string;
  name: string;
  petitioner: string;
  orderDate: string;
  uploadDate: string;
  status: 'pending' | 'verified';
  confidence: number;
}

const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Statement of Taxpayer Identification',
    petitioner: 'John A. Smith & Mary B. Smith',
    orderDate: 'Nov 14, 2024',
    uploadDate: 'Dec 14, 2024',
    status: 'pending',
    confidence: 89,
  },
  {
    id: '2',
    name: 'Order - Motion to Dismiss',
    petitioner: 'Johnson Corp.',
    orderDate: 'Nov 30, 2024',
    uploadDate: 'Dec 14, 2024',
    status: 'pending',
    confidence: 95,
  },
  {
    id: '3',
    name: 'Order - Scheduling Conference',
    petitioner: 'Thompson Industries',
    orderDate: 'Dec 7, 2024',
    uploadDate: 'Dec 14, 2024',
    status: 'pending',
    confidence: 67,
  },
  {
    id: '4',
    name: 'Order - Discovery Extension',
    petitioner: 'Williams Estate',
    orderDate: 'Nov 27, 2024',
    uploadDate: 'Dec 13, 2024',
    status: 'pending',
    confidence: 78,
  },
  {
    id: '5',
    name: 'Order - Summary Judgment',
    petitioner: 'ABC Holdings LLC',
    orderDate: 'Dec 4, 2024',
    uploadDate: 'Dec 13, 2024',
    status: 'verified',
    confidence: 92,
  },
  {
    id: '6',
    name: 'Statement of Taxpayer Identification',
    petitioner: 'Robert & Linda Martinez',
    orderDate: 'Nov 19, 2024',
    uploadDate: 'Dec 12, 2024',
    status: 'verified',
    confidence: 100,
  },
];

export function DocumentQueue() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('');

  const pendingCount = mockDocuments.filter((d) => d.status === 'pending').length;
  const verifiedCount = mockDocuments.filter((d) => d.status === 'verified').length;

  const handleViewVerify = (doc: Document) => {
    if (doc.status === 'pending') {
      navigate(`/verification/${doc.id}`);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Document Verification Queue</h1>
          <p>Review and verify extracted data from uploaded tax court documents</p>
        </div>
        <Button variant="primary" icon={<Upload size={16} />}>
          Upload Documents
        </Button>
      </div>

      <div className={styles.statusTabs}>
        <button className={`${styles.statusTab} ${styles.pendingTab}`}>
          <FileText size={16} />
          <span>Pending Review</span>
          <span className={styles.tabCount}>{pendingCount}</span>
        </button>
        <button className={`${styles.statusTab} ${styles.verifiedTab}`}>
          <FileText size={16} />
          <span>Verified</span>
          <span className={styles.tabCount}>{verifiedCount}</span>
        </button>
      </div>

      <div className={styles.controls}>
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <Filter size={16} />
            <span>Filter:</span>
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search..."
              className={styles.filterInput}
            />
          </div>
          <div className={styles.filterGroup}>
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.sortSelect}
            >
              <option value="">Select...</option>
              <option value="date">Upload Date</option>
              <option value="confidence">Confidence</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
        <Button variant="secondary" icon={<Download size={16} />}>
          Export Report
        </Button>
      </div>

      <Card padding="none">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell header>Document Name</TableCell>
              <TableCell header>Petitioner</TableCell>
              <TableCell header>Order Date</TableCell>
              <TableCell header>Upload Date</TableCell>
              <TableCell header>Status</TableCell>
              <TableCell header align="center">Confidence</TableCell>
              <TableCell header align="center">Action</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockDocuments.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>
                  <div className={styles.documentName}>
                    <FileText size={16} className={styles.docIcon} />
                    <div>
                      <span className={styles.docTitle}>{doc.name}</span>
                      <span className={styles.docId}>ID: {doc.id}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{doc.petitioner}</TableCell>
                <TableCell>{doc.orderDate}</TableCell>
                <TableCell>{doc.uploadDate}</TableCell>
                <TableCell>
                  <span className={`${styles.status} ${styles[doc.status]}`}>
                    {doc.status === 'pending' ? 'Pending Review' : 'Verified'}
                  </span>
                </TableCell>
                <TableCell align="center">
                  <ConfidenceBadge value={doc.confidence} />
                </TableCell>
                <TableCell align="center">
                  <button
                    className={styles.actionLink}
                    onClick={() => handleViewVerify(doc)}
                  >
                    {doc.status === 'pending' ? 'View/Verify' : 'View Details'}
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className={styles.pagination}>
        <span className={styles.paginationInfo}>
          Showing {mockDocuments.length} of {mockDocuments.length} documents
        </span>
        <div className={styles.paginationControls}>
          <button className={styles.paginationButton}>Previous</button>
          <button className={`${styles.paginationButton} ${styles.active}`}>1</button>
          <button className={styles.paginationButton}>2</button>
          <button className={styles.paginationButton}>Next</button>
        </div>
      </div>
    </div>
  );
}
