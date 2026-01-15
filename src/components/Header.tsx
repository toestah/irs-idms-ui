import { User } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { SearchInput } from './TextInput';
import styles from './Header.module.css';
import irsLogo from '../assets/IRS_Logo.svg';

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
      <Link to="/" className={styles.logo}>
        <img src={irsLogo} alt="IRS Logo" className={styles.logoImage} />
        <div className={styles.logoText}>
          <span className={styles.logoTitle}>Intelligent Document</span>
          <span className={styles.logoSubtitle}>Management System</span>
        </div>
      </Link>

      <form className={styles.searchForm} onSubmit={handleSearch}>
        <SearchInput
          name="search"
          placeholder="Search cases, documents, or ask a question..."
          className={styles.searchInput}
          inputClassName={styles.customInput}
          aria-label="Search"
        />
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
