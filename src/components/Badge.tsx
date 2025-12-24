import styles from './Badge.module.css';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}

interface ConfidenceBadgeProps {
  value: number;
  showLabel?: boolean;
}

export function ConfidenceBadge({ value, showLabel = true }: ConfidenceBadgeProps) {
  const getVariant = (val: number): BadgeVariant => {
    if (val >= 95) return 'success';
    if (val >= 80) return 'warning';
    return 'danger';
  };

  return (
    <span className={`${styles.confidenceBadge} ${styles[getVariant(value)]}`}>
      {showLabel ? `${value}%` : value}
    </span>
  );
}

interface StatusBadgeProps {
  status: 'confirmed' | 'scheduled' | 'upcoming' | 'pending' | 'verified' | 'review';
}

const statusConfig: Record<StatusBadgeProps['status'], { label: string; variant: BadgeVariant }> = {
  confirmed: { label: 'Confirmed', variant: 'success' },
  scheduled: { label: 'Scheduled', variant: 'info' },
  upcoming: { label: 'Upcoming', variant: 'warning' },
  pending: { label: 'Pending Review', variant: 'warning' },
  verified: { label: 'Verified', variant: 'success' },
  review: { label: 'Pending Review', variant: 'warning' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
