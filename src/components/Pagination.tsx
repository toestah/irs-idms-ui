import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import styles from './Pagination.module.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const startItem = itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : null;
  const endItem = itemsPerPage && totalItems 
    ? Math.min(currentPage * itemsPerPage, totalItems) 
    : null;

  return (
    <div className={`${styles.pagination} ${className}`}>
      <div className={styles.paginationInfo}>
        {totalItems !== undefined && (
          <span>
            {startItem !== null && endItem !== null 
              ? `Showing ${startItem}-${endItem} of ${totalItems}`
              : `Total items: ${totalItems}`}
          </span>
        )}
      </div>
      <div className={styles.paginationControls}>
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrev}
          disabled={currentPage <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
          <span>Prev</span>
        </Button>
        <span className={styles.pageInfo}>
          {currentPage} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
};
