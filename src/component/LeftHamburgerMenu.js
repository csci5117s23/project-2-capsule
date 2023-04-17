import React, { useState } from 'react';
import Link from 'next/link';
import styles from '../../styles/LeftHamburgerMenu.module.css';
import NoteManager from './NoteManager';
//import { FaSearch, FaFilter, FaSort } from 'react-icons/fa';
import { useRouter } from 'next/router';


const LeftHamburgerMenu = () => {
    // Initialize state variables with the useState hook
  const [menuOpen, setMenuOpen] = useState(false);
  const [folderManagerOpen, setFolderManagerOpen] = useState({ open: false, title: '' });
  const [threeDotMenuOpen, setThreeDotMenuOpen] = useState(false);
  const [folders, setFolders] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

    // Define functions to update state variables
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleFolderManager = () => {
    const title = folders.length > 0 ? folders[0].name : 'Untitled';
    setFolderManagerOpen({ open: !folderManagerOpen.open, title });
  };

  const toggleThreeDotMenu = () => {
    setThreeDotMenuOpen(!threeDotMenuOpen);
  };

  const addNewFolder = () => {
    setFolders([...folders, { id: folders.length + 1, name: `Folder ${folders.length + 1}`, notes: [] }]);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleFolderClick = (folderName) => {
    setFolderManagerOpen({ open: true, title: folderName });
  };

  const handleNoteClick = (noteId) => {
    console.log(`Clicked note with ID ${noteId}`);
    router.push(`/note-editor/${noteId}`);
  };

  const handleDeleteFolder = (folderId) => {
    setFolders(folders.filter(folder => folder.id !== folderId));
  };

  const handleDeleteNote = (noteId) => {
    const updatedFolders = folders.map(folder => {
      const updatedNotes = folder.notes.filter(note => note.id !== noteId);
      return { ...folder, notes: updatedNotes };
    });
    setFolders(updatedFolders);
  };

  const handleSortNotes = () => {
    const sortedFolders = folders.map(folder => {
      const sortedNotes = folder.notes.sort((a, b) => b.dateCreated - a.dateCreated);
      return { ...folder, notes: sortedNotes };
    });
    setFolders(sortedFolders);
  };

  const handleAddNote = () => {
    router.push('/note-editor');
  }

// Return JSX with CSS classes and onClick handlers based on the state
  return (
    <div className={`${styles.leftHamburgerMenu} ${menuOpen ? styles.open : ''} ${darkMode ? styles.dark : ''}`}>
      <div className={styles.menuToggle} onClick={toggleMenu}>
        {menuOpen ? <span className={styles.closeIcon}>X</span> : <span className={styles.hamburgerIcon}>☰</span>}
      </div>

      {menuOpen && (
        <div className={styles.menuContent}>
          <div className={styles.topSection}>
              <div className={styles.headerBar}>
                <span className={styles.folderTitle}>{folderManagerOpen.title || 'Untitled'}</span>
                <div className={styles.icons}>
                  <FaSearch className={styles.icon} />
                  <FaFilter className={`${styles.icon} ${styles.disabledIcon}`} />
                  <FaSort className={styles.icon}  onClick={handleSortNotes} />
                </div>
            </div>
            <Link href="/profile">
              <a className={styles.profileIcon}>👤</a>
            </Link>
            <Link href="/">
              <a className={styles.appLogo}>Capsule</a>
            </Link>
            <button className={styles.closeIcon} onClick={toggleMenu}>X</button>
          </div>
          {folderManagerOpen.open && (
            <>
              <Link href="/">
                <a className={styles.appLogo}>{folderManagerOpen.title}</a>
              </Link>
              <div className={styles.folderManager}>
                <div className={styles.folderIcon} onClick={toggleFolderManager}>📁</div>
                {folders.length > 0 && (
                  <div className={styles.threeDotMenu} onClick={toggleThreeDotMenu}>⋮</div>
                )}
              </div>
              <NoteManager folders={folders} folderManagerOpen={folderManagerOpen} />
              {threeDotMenuOpen && folders.length > 0 && (
                <ul className={styles.threeDotMenuList}>
                  <li>Delete</li>
                  <li>Copy</li>
                  <li>Download (Export)</li>
                </ul>
              )}
              <button className={styles.addFolderButton} onClick={addNewFolder}>+</button>
            </>
          )}

          {!folderManagerOpen.open && (
            <div className={styles.folderManager}>
              <div className={styles.folderIcon} onClick={toggleFolderManager}>📁</div>
            </div>
          )}

          <div className={styles.bottomSection}>
            <Link href="/login">
              <a className={styles.loginLogoutIcon}>⇄</a>
            </Link>
            <button className={styles.darkModeToggle} onClick={toggleDarkMode}>
              {darkMode ? '🌞' : '🌙'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeftHamburgerMenu;
