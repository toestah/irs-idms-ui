import { Bell } from 'lucide-react';
import styles from './Placeholder.module.css';

export function Notifications() {
  return (
    <div className={styles.container}>
      <div className={styles.icon}>
        <Bell size={40} />
      </div>
      <h1 className={styles.title}>Notifications Coming Soon!</h1>
      <p className={styles.subtitle}>This page is under development.</p>
    </div>
  );
}
