import React, { type ReactNode } from 'react';
import styles from './Tabs.module.css';

export interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = '',
}) => {
  return (
    <div className={`${styles.tabsContainer} ${className}`}>
      <div className={styles.tabList} role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            id={`tab-${tab.id}`}
            aria-controls={`panel-${tab.id}`}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.icon && <span className={styles.tabIcon}>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={styles.tabCount}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
