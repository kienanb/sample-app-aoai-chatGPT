import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Chat24Filled, SpeakerEdit24Regular, Image24Regular } from '@fluentui/react-icons'; // Add Image icon
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className={styles.sidebar}>
      <ul>
        {/* Chat Icon */}
        <li>
          {location.pathname === '/chat' ? (
            <button className={styles.iconButton} disabled>
              <Chat24Filled className={styles.chatIcon} />
            </button>
          ) : (
            <Link to="/chat" className={styles.iconLink}>
              <Chat24Filled className={styles.chatIcon} />
            </Link>
          )}
        </li>

        {/* Image Icon */}
        <li>
          {location.pathname === '/image' ? (
            <button className={styles.iconButton} disabled>
              <Image24Regular className={styles.chatIcon} />
            </button>
          ) : (
            <Link to="/image" className={styles.iconLink}>
              <Image24Regular className={styles.chatIcon} />
            </Link>
          )}
        </li>

        {/* Audio Icon */}
        <li>
          {location.pathname === '/audio' ? (
            <button className={styles.iconButton} disabled>
              <SpeakerEdit24Regular className={styles.chatIcon} />
            </button>
          ) : (
            <Link to="/audio" className={styles.iconLink}>
              <SpeakerEdit24Regular className={styles.chatIcon} />
            </Link>
          )}
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
