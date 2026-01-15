import styles from './Table.module.css';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className={`${styles.tableContainer} ${className}`}>
      <table className={styles.table}>{children}</table>
    </div>
  );
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return <thead className={styles.tableHeader}>{children}</thead>;
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className={styles.tableBody}>{children}</tbody>;
}

export function TableRow({
  children,
  onClick,
  className = ''
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <tr
      className={`${styles.tableRow} ${onClick ? styles.clickable : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

interface TableCellProps {
  children: React.ReactNode;
  header?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
  colSpan?: number;
}

export function TableCell({
  children,
  header = false,
  align = 'left',
  className = '',
  colSpan,
}: TableCellProps) {
  const Component = header ? 'th' : 'td';
  return (
    <Component
      className={`${styles.tableCell} ${styles[`align-${align}`]} ${className}`}
      colSpan={colSpan}
    >
      {children}
    </Component>
  );
}
