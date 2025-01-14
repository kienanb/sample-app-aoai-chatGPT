import React from 'react';
import { Link } from 'react-router-dom';
import { Chat24Filled } from '@fluentui/react-icons'; // Import the Fluent UI chat bubble icon
import styles from './Sidebar.module.css';

const Sidebar = () => {
  return (
    <div className={styles.sidebar}>
      <ul>
        <li>
          <Link to="/current-screen" className={styles.iconLink}>
            <Chat24Filled className={styles.chatIcon} />
          </Link>
        </li>
        {/* Add more menu options here */}
      </ul>
    </div>
  );
};

export default Sidebar;
