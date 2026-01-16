import { BarChart3 } from 'lucide-react';
import styles from './Placeholder.module.css';

export function Reports() {
  return (
    <div className={styles.container}>
      <div className={styles.icon}>
        <BarChart3 size={40} />
      </div>
      <h1 className={styles.title}>Reports Coming Soon!</h1>
      <p className={styles.subtitle}>This page is under development.</p>
    </div>
  );
}
