import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Search,
  ListTodo,
  CheckSquare,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronLeft,
} from 'lucide-react';
import styles from './Sidebar.module.css';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

const mainNavItems: NavItem[] = [
  { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/' },
  { icon: <FileText size={20} />, label: 'Matters', path: '/matters' },
  { icon: <FolderOpen size={20} />, label: 'Documents', path: '/documents' },
  { icon: <Search size={20} />, label: 'Search', path: '/search' },
  { icon: <ListTodo size={20} />, label: 'Document Queue', path: '/document-queue' },
  { icon: <CheckSquare size={20} />, label: 'Verification', path: '/verification' },
  { icon: <BarChart3 size={20} />, label: 'Reports', path: '/reports' },
  { icon: <Settings size={20} />, label: 'Settings', path: '/settings' },
];

export function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <nav className={styles.navigation}>
        <button className={styles.menuButton}>
          <span>Menu</span>
          <ChevronLeft size={20} />
        </button>

        <ul className={styles.navList}>
          {mainNavItems.map((item) => (
            <li key={item.path} className={styles.navItem}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.footer}>
        <NavLink to="/help" className={styles.navLink}>
          <HelpCircle size={20} />
          <span>Help</span>
        </NavLink>
      </div>
    </aside>
  );
}
