import { Settings as SettingsIcon } from 'lucide-react';
import styles from './Placeholder.module.css';

export function Settings() {
  return (
    <div className={styles.container}>
      <div className={styles.icon}>
        <SettingsIcon size={40} />
      </div>
      <h1 className={styles.title}>Settings Coming Soon!</h1>
      <p className={styles.subtitle}>This page is under development.</p>
    </div>
  );
}
