import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Scale, FileSearch, HelpCircle, Sparkles, ArrowRight } from 'lucide-react';
import { SearchInput } from '../components';
import styles from './Dashboard.module.css';

// Legal research query categories based on actual OCC lawyer needs
const queryCategories = [
  {
    title: 'Case Analysis',
    icon: Scale,
    description: 'Analyze specific Tax Court cases',
    queries: [
      'What is the case caption for docket 12345-20?',
      'Summarize the key legal issues in this case',
      'What is the current status of this petition?',
      'Has this petition been amended?',
    ],
  },
  {
    title: 'Document Research',
    icon: FileSearch,
    description: 'Find and analyze documents',
    queries: [
      'Find all orders from Judge Thornton',
      'Show petitions filed in 2024 with unreported income issues',
      'List documents with deficiency notices over $100,000',
      'Find cases involving partnership tax matters',
    ],
  },
  {
    title: 'Legal Questions',
    icon: HelpCircle,
    description: 'Ask complex legal research questions',
    queries: [
      'What cases cite IRC Section 6662 penalties?',
      'Find precedents for late filing penalty abatement',
      'Cases where the petitioner prevailed on burden of proof',
      'Recent decisions on reasonable cause exceptions',
    ],
  },
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
        {/* Hero Section */}
        <div className={styles.hero}>
          <div className={styles.heroIcon}>
            <Sparkles size={32} />
          </div>
          <h1>IDMS Legal Research Assistant</h1>
          <p>
            AI-powered research across Tax Court documents, petitions, and case files.
            Ask questions in natural language and get instant answers with citations.
          </p>
        </div>

        {/* Main Search */}
        <div className={styles.searchSection}>
          <form className={styles.searchForm} onSubmit={handleSearch}>
            <div className={styles.searchInputWrapper}>
              <Search size={20} className={styles.searchIcon} />
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask anything about your cases... (e.g., 'Find cases with unreported income penalties')"
                fullWidth
                aria-label="Legal Research Search"
              />
              <button
                type="submit"
                className={styles.searchButton}
                disabled={!searchQuery.trim()}
              >
                <ArrowRight size={20} />
              </button>
            </div>
          </form>
          <p className={styles.searchHint}>
            Powered by Vertex AI Discovery Engine • Conversational search with follow-up questions
          </p>
        </div>

        {/* Query Categories */}
        <div className={styles.categoriesGrid}>
          {queryCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <div key={category.title} className={styles.categoryCard}>
                <div className={styles.categoryHeader}>
                  <IconComponent size={24} className={styles.categoryIcon} />
                  <div>
                    <h2>{category.title}</h2>
                    <p>{category.description}</p>
                  </div>
                </div>
                <div className={styles.queryList}>
                  {category.queries.map((query, index) => (
                    <button
                      key={index}
                      className={styles.queryItem}
                      onClick={() => handleQuickSearch(query)}
                    >
                      <span>{query}</span>
                      <ArrowRight size={14} className={styles.queryArrow} />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Capabilities Footer */}
        <div className={styles.capabilities}>
          <h3>What you can do</h3>
          <div className={styles.capabilityList}>
            <span>🔍 Search documents</span>
            <span>📋 Analyze cases</span>
            <span>💬 Ask follow-up questions</span>
            <span>📄 View original documents</span>
            <span>⚖️ Find legal precedents</span>
          </div>
        </div>
      </div>
    </div>
  );
}
