import { HelpCircle } from 'lucide-react';
import styles from './Placeholder.module.css';

export function Help() {
  return (
    <div className={styles.container}>
      <div className={styles.icon}>
        <HelpCircle size={40} />
      </div>
      <h1 className={styles.title}>Help Coming Soon!</h1>
      <p className={styles.subtitle}>This page is under development.</p>
    </div>
  );
}
