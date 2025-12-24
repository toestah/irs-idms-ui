import { Search, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './Header.module.css';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export function Header({ onSearch }: HeaderProps) {
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    if (query && onSearch) {
      onSearch(query);
    } else if (query) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <svg width="40" height="34" viewBox="0 0 40 34" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="17" r="16" stroke="white" strokeWidth="2" fill="none"/>
          <text x="20" y="22" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">IRS</text>
        </svg>
        <div className={styles.logoText}>
          <span className={styles.logoTitle}>Intelligent Document</span>
          <span className={styles.logoSubtitle}>Management System</span>
        </div>
      </div>

      <form className={styles.searchForm} onSubmit={handleSearch}>
        <input
          type="text"
          name="search"
          placeholder="Search cases, documents, or ask a question..."
          className={styles.searchInput}
        />
        <button type="submit" className={styles.searchButton}>
          <Search size={16} />
        </button>
      </form>

      <div className={styles.userSection}>
        <div className={styles.userAvatar}>
          <User size={20} />
        </div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>John Smith</span>
          <span className={styles.userRole}>Attorney</span>
        </div>
        <div className={styles.notificationBadge}>3</div>
      </div>
    </header>
  );
}
