import { useState } from 'react';
import { useParams } from 'react-router-dom';
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
} from 'lucide-react';
import { Card, Button } from '../components';
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

interface FileSection {
  name: string;
  count: number;
}

const teamMembers: TeamMember[] = [
  { initials: 'JS', name: 'Jack Smith', role: 'Lead counsel', color: '#3b82f6' },
  { initials: 'MK', name: 'Mike Kim', role: 'Writer, para', color: '#10b981' },
];

const recentFiles: RecentFile[] = [
  { name: 'Defendant Brief - Final d...', icon: 'doc', time: '10 mins ago' },
  { name: 'Evidence List v2.xlsx', icon: 'excel', time: '1 hour ago' },
  { name: 'Court Order #1234.pdf', icon: 'pdf', time: '3 hours ago' },
];

const fileSections: FileSection[] = [
  { name: 'Discovery Files', count: 128 },
  { name: 'Docketed Files', count: 43 },
  { name: 'Evidence', count: 87 },
  { name: 'Transcripts', count: 23 },
];

const workspaceFolders = [
  { name: 'Lawyer Briefs', count: 12 },
  { name: 'Work Documents', count: 24 },
];

export function MatterDetail() {
  const { id: _matterId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className={styles.page}>
      <div className={styles.matterHeader}>
        <div className={styles.matterIcon}>
          <span>US</span>
        </div>
        <div className={styles.matterInfo}>
          <h1>Matter: US v. John Doe</h1>
          <p>IRS-OCC-2024-001 &bull; IRS Office of Chief Counsel</p>
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
              <span>Conversational Search</span>
            </div>
            <div className={styles.searchForm}>
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
            </div>
          </Card>

          <div className={styles.infoCards}>
            <Card className={styles.wikiCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <FileText size={20} />
                  <h2>Matter Wiki</h2>
                </div>
                <Button variant="ghost" icon={<Pencil size={16} />} aria-label="Edit" />
              </div>
              <h3 className={styles.strategyTitle}>Case Strategy</h3>
              <p className={styles.strategyText}>
                Focus on the 23 financial discrepancies. Need to depose the CFO regarding the wire transfers...
              </p>
              <div className={styles.tags}>
                <span className={styles.tag}>#Jackson</span>
                <span className={styles.tag}>#discovery</span>
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
                <h2>RECENT ACTIVITY</h2>
              </div>
              <Button variant="ghost" icon={<Plus size={16} />} aria-label="Add" />
            </div>
            <div className={styles.recentFiles}>
              {recentFiles.map((file) => (
                <div key={file.name} className={styles.recentFile}>
                  <FileText size={20} className={styles.fileIcon} />
                  <div className={styles.fileInfo}>
                    <span className={styles.fileName}>{file.name}</span>
                    <span className={styles.fileTime}>{file.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className={styles.workspaceCard}>
            <div className={styles.workspaceHeader}>
              <FolderOpen size={20} />
              <div>
                <h2>Workspace / Drive</h2>
                <p>Working files, drafts, and collaborative documents.</p>
              </div>
            </div>
            <div className={styles.workspaceLabel}>ACTIVE WORKSPACE</div>
            <Button variant="outline" fullWidth icon={<Plus size={16} />}>
              Add Folder
            </Button>
            <div className={styles.folderGrid}>
              {workspaceFolders.map((folder) => (
                <Card key={folder.name} className={styles.folderCard}>
                  <FolderOpen size={20} className={styles.folderIcon} />
                  <div className={styles.folderInfo}>
                    <span className={styles.folderName}>{folder.name}</span>
                    <span className={styles.folderCount}>{folder.count} items</span>
                  </div>
                  <ChevronRight size={20} className={styles.folderChevron} />
                </Card>
              ))}
            </div>
          </Card>
        </div>

        <div className={styles.sideColumn}>
          <div className={styles.sectionIcon}>
            <FolderOpen size={24} />
          </div>
          <Button variant="outline" fullWidth icon={<Plus size={16} />}>
            Add Section
          </Button>

          <div className={styles.fileSections}>
            {fileSections.map((section) => (
              <Card key={section.name} className={styles.sectionCard}>
                <FolderOpen size={20} />
                <div className={styles.sectionInfo}>
                  <span className={styles.sectionName}>{section.name}</span>
                  <span className={styles.sectionCount}>{section.count} items</span>
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
    </div>
  );
}
