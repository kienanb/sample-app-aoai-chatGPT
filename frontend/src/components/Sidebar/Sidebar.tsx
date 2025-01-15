import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Chat24Filled } from '@fluentui/react-icons'; // Fluent UI chat bubble icon
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const location = useLocation(); // Get the current location

  return (
    <div className={styles.sidebar}>
      <ul>
        <li>
          {location.pathname === '/chat' ? (
            // If already on /chat, render a non-interactive button
            <button className={styles.iconButton} disabled>
              <Chat24Filled className={styles.chatIcon} />
            </button>
          ) : (
            // Navigate to /chat
            <Link to="/chat" className={styles.iconLink}>
              <Chat24Filled className={styles.chatIcon} />
            </Link>
          )}
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
