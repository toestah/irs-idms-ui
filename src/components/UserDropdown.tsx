import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Settings, Bell, LogOut, ChevronDown } from 'lucide-react';
import styles from './UserDropdown.module.css';

interface UserDropdownProps {
  userName: string;
  userRole: string;
  avatarIcon?: React.ReactNode;
  notificationCount?: number;
}

export const UserDropdown: React.FC<UserDropdownProps> = ({
  userName,
  userRole,
  avatarIcon = <User size={18} />,
  notificationCount = 0,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    // Implement logout logic here
    console.log('Logging out...');
    navigate('/');
  };

  return (
    <div className={styles.dropdownWrapper} ref={dropdownRef}>
      <button className={styles.trigger} onClick={toggleDropdown} aria-expanded={isOpen} aria-haspopup="true">
        <div className={styles.triggerAvatar}>
          {avatarIcon}
        </div>
        <div className={styles.triggerInfo}>
          <span className={styles.userName}>{userName}</span>
          <span className={styles.userRole}>{userRole}</span>
        </div>
        <ChevronDown size={14} className={isOpen ? styles.rotate : ''} />
        {notificationCount > 0 && (
          <div className={styles.notificationBadge}>{notificationCount}</div>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu} role="menu">
          <Link to="/account" className={styles.menuItem} role="menuitem" onClick={() => setIsOpen(false)}>
            <User size={18} className={styles.menuItemIcon} />
            <span>Profile</span>
          </Link>
          <Link to="/settings" className={styles.menuItem} role="menuitem" onClick={() => setIsOpen(false)}>
            <Settings size={18} className={styles.menuItemIcon} />
            <span>Settings</span>
          </Link>
          <Link to="/notifications" className={styles.menuItem} role="menuitem" onClick={() => setIsOpen(false)}>
            <Bell size={18} className={styles.menuItemIcon} />
            <span>Notifications</span>
          </Link>
          <div className={styles.divider} />
          <button className={`${styles.menuItem} ${styles.logout}`} role="menuitem" onClick={handleLogout}>
            <LogOut size={18} className={styles.menuItemIcon} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};
