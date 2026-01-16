import { FileText } from 'lucide-react';
import styles from './Placeholder.module.css';

export function Matters() {
  return (
    <div className={styles.container}>
      <div className={styles.icon}>
        <FileText size={40} />
      </div>
      <h1 className={styles.title}>Matters Coming Soon!</h1>
      <p className={styles.subtitle}>This page is under development.</p>
    </div>
  );
}
