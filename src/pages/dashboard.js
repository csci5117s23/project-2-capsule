// pages/dashboard.js
import React from 'react';
import Link from 'next/link';
import styles from '../styles/dashboard.module.css';
import LeftHamburgerMenu from '@/components/LeftHamburgerMenu';

const Dashboard = () => {
  return (
    <div className={styles.dashboardContainer}>
      {/* Other dashboard content */}

      {/* Link to the Note Editor page */}
      <div className={styles.newNoteButton}>
        <Link href='/editor'>Create New Note</Link>
      </div>
      <LeftHamburgerMenu/>
      {/* Other dashboard content */}
    </div>
  );
};

export default Dashboard;
