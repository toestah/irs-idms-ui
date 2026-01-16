import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Download, Filter, FileText, CheckCircle } from 'lucide-react';
import {
  Card,
  Button,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  StatusBadge,
  Tabs,
  Pagination,
  type Tab
} from '../components';
import styles from './DocumentQueue.module.css';

interface Document {
  id: string;
  name: string;
  caseId: string;
  type: string;
  dateAdded: string;
  status: 'pending' | 'verified';
}

const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Statement of Taxpayer Identification',
    caseId: '12345-24',
    type: 'STI',
    dateAdded: 'Dec 14, 2024',
    status: 'pending',
  },
  {
    id: '2',
    name: 'Order - Motion to Dismiss',
    caseId: '67890-24',
    type: 'Order',
    dateAdded: 'Dec 14, 2024',
    status: 'pending',
  },
  {
    id: '3',
    name: 'Order - Scheduling Conference',
    caseId: '11223-24',
    type: 'Order',
    dateAdded: 'Dec 14, 2024',
    status: 'pending',
  },
  {
    id: '4',
    name: 'Order - Discovery Extension',
    caseId: '44556-24',
    type: 'Order',
    dateAdded: 'Dec 13, 2024',
    status: 'pending',
  },
  {
    id: '5',
    name: 'Order - Summary Judgment',
    caseId: '77889-24',
    type: 'Order',
    dateAdded: 'Dec 13, 2024',
    status: 'verified',
  },
  {
    id: '6',
    name: 'Statement of Taxpayer Identification',
    caseId: '99001-24',
    type: 'STI',
    dateAdded: 'Dec 12, 2024',
    status: 'verified',
  },
];

export function DocumentQueue() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'verified'>('pending');
  const [localPage, setLocalPage] = useState(1);
  const itemsPerPage = 5;

  const pendingCount = mockDocuments.filter((d) => d.status === 'pending').length;
  const verifiedCount = mockDocuments.filter((d) => d.status === 'verified').length;

  const tabs: Tab[] = [
    { id: 'pending', label: 'Pending Review', icon: <FileText size={16} />, count: pendingCount },
    { id: 'verified', label: 'Verified', icon: <CheckCircle size={16} />, count: verifiedCount },
  ];

  const filteredDocs = mockDocuments
    .filter((d) => d.status === activeTab)
    .filter((d) => d.name.toLowerCase().includes(filter.toLowerCase()) || d.caseId.includes(filter));

  const totalPages = Math.ceil(filteredDocs.length / itemsPerPage);
  const currentDocs = filteredDocs.slice((localPage - 1) * itemsPerPage, localPage * itemsPerPage);

  const handleViewVerify = (doc: Document) => {
    if (doc.status === 'pending') {
      navigate(`/verification/${doc.id}`);
    } else {
      // Logic for viewing verified documents
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

      <Tabs 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as 'pending' | 'verified')}
        className={styles.statusTabs}
      />

      <div className={styles.controls}>
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <Filter size={16} />
            <span>Filter:</span>
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search by name or case ID..."
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
              <option value="date">Date Added</option>
              <option value="caseId">Case ID</option>
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
              <TableCell header>Case ID</TableCell>
              <TableCell header>Type</TableCell>
              <TableCell header>Added Date</TableCell>
              <TableCell header>Status</TableCell>
              <TableCell header align="center">Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentDocs.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className={styles.docNameCell}>
                  <FileText size={16} className={styles.docIcon} />
                  <span>{doc.name}</span>
                </TableCell>
                <TableCell>{doc.caseId}</TableCell>
                <TableCell>{doc.type}</TableCell>
                <TableCell>{doc.dateAdded}</TableCell>
                <TableCell>
                  <StatusBadge status={doc.status} />
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

      <Pagination
        currentPage={localPage}
        totalPages={totalPages}
        onPageChange={setLocalPage}
        totalItems={filteredDocs.length}
        itemsPerPage={itemsPerPage}
        className={styles.pagination}
      />
    </div>
  );
}
