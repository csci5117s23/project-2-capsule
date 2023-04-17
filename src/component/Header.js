import React from 'react';
import LeftHamburgerMenu from './LeftHamburgerMenu';
import styles from '../../styles/Header.module.css';

const Header = ({ folderTitle, isFolderEmpty }) => {
  return (
    <header className={styles.header}>
      <LeftHamburgerMenu />

      <div className={styles.title}>
        {isFolderEmpty ? 'Untitled' : folderTitle}
      </div>

      {!isFolderEmpty && (
        <div className={styles.icons}>
          <span className={styles.icon}>Search</span>
          <span className={styles.icon}>Filter</span>
          <span className={styles.icon}>Sort</span>
        </div>
      )}
    </header>
  );
};

export default Header;
