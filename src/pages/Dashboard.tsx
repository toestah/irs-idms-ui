import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, TrendingUp } from 'lucide-react';
import { SearchInput } from '../components';
import styles from './Dashboard.module.css';

const recentSearches = [
  'What is the total transaction amount?',
  'Show me all documents from Q4 2023',
  'List depositions scheduled for next week',
  'Find emails related to CFO wire transfers',
  'Discovery files submitted in January',
];

const popularSearches = [
  'What matters have depositions scheduled in the next week?',
  'Motion to dismiss status',
  'Evidence list for trial preparation',
  'Pending court orders',
  'Witness statement summaries',
  'Financial records analysis',
  'Case timeline and key dates',
];

export function Dashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleQuickSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>Search Your Case Files</h1>
          <p>Ask questions in natural language to find documents, emails, and case information</p>
        </div>

        <div className={styles.searchSection}>
          <div className={styles.searchLabel}>
            <Search size={20} />
            <span>Conversational Search</span>
          </div>
          <form className={styles.searchForm} onSubmit={handleSearch}>
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Ask a question (e.g., "What is the total transaction amount?")'
              fullWidth
              aria-label="Conversational Search"
            />
          </form>
        </div>

        <div className={styles.suggestionsGrid}>
          <div className={styles.suggestionsColumn}>
            <div className={styles.suggestionsHeader}>
              <Clock size={20} />
              <h2>Recent Searches</h2>
            </div>
            <div className={styles.suggestionsList}>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  className={styles.suggestionItem}
                  onClick={() => handleQuickSearch(search)}
                >
                  {search}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.suggestionsColumn}>
            <div className={styles.suggestionsHeader}>
              <TrendingUp size={20} />
              <h2>Popular Searches</h2>
            </div>
            <div className={styles.suggestionsList}>
              {popularSearches.map((search, index) => (
                <button
                  key={index}
                  className={styles.suggestionItem}
                  onClick={() => handleQuickSearch(search)}
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className={styles.tip}>
          Tip: Click on any search suggestion above to quickly populate the search bar
        </p>
      </div>
    </div>
  );
}
