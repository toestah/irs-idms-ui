import { FolderOpen } from 'lucide-react';
import styles from './Placeholder.module.css';

export function Documents() {
  return (
    <div className={styles.container}>
      <div className={styles.icon}>
        <FolderOpen size={40} />
      </div>
      <h1 className={styles.title}>Documents Coming Soon!</h1>
      <p className={styles.subtitle}>This page is under development.</p>
    </div>
  );
}
