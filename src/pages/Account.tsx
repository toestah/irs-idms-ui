import { User, Mail, Shield, Bell, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Badge } from '../components';
import styles from './Placeholder.module.css';

export function Account() {
  return (
    <div className={styles.container} style={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
      <header className={styles.header}>
        <div className={styles.iconWrapper}>
          <User size={32} />
        </div>
        <h1 className={styles.title}>Account Settings</h1>
        <p className={styles.subtitle}>Manage your profile, security, and preferences</p>
      </header>

      <div className={styles.grid}>
        <Card>
          <CardHeader>
            <div className={styles.cardHeader}>
              <Mail size={18} />
              <h2>Profile Information</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className={styles.field}>
              <label className={styles.label}>Full Name</label>
              <div className={styles.value}>John Smith</div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Email Address</label>
              <div className={styles.value}>john.smith@irs.gov</div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Role</label>
              <div>
                <Badge variant="info">Senior Attorney</Badge>
              </div>
            </div>
            <Button variant="outline" size="sm" style={{ alignSelf: 'flex-start' }}>Edit Profile</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className={styles.cardHeader}>
              <Shield size={18} />
              <h2>Security</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <div className={styles.value}>••••••••••••</div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Two-Factor Authentication</label>
              <div className={styles.value} style={{ color: 'var(--color-success)' }}>Enabled</div>
            </div>
            <Button variant="outline" size="sm" style={{ alignSelf: 'flex-start' }}>Change Password</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className={styles.cardHeader}>
              <Bell size={18} />
              <h2>Preferences</h2>
            </div>
          </CardHeader>
          <CardContent>
            <p className={styles.subtitle} style={{ marginBottom: 'var(--spacing-md)', textAlign: 'left' }}>
              Configure how you receive notifications and system alerts.
            </p>
            <Button variant="outline" size="sm" icon={<ExternalLink size={14} />}>Manage Preferences</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Account;
