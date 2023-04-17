import React from 'react';
import styles from '../styles/NoteManager.module.css';

const NoteManager = ({ folders, folderManagerOpen }) => {
  const currentFolder = folders.find((folder) => folder.name === folderManagerOpen.title);
  const notes = currentFolder ? currentFolder.notes : [];

  const handleClick = (note) => {
    console.log(`Clicked on note: ${note.title}`);
    // Add logic to navigate to note editor page and open note
  }

  return (
    <div>
      {currentFolder ? (
        <div className={styles.noteList}>
          {notes.map((note) => (
            <div key={note.id} className={styles.note} onClick={() => handleClick(note)}>
              <div className={styles.noteTitle}>{note.title || 'Untitled'}</div>
              <div className={styles.noteContent}>{note.content}</div>
              <div className={styles.noteActions}>
                <div className={styles.noteMenu}>
                  {note.title && (
                    <div className={styles.noteMenuIcon}>
                      <div className={styles.noteMenuDots}>...</div>
                      <div className={styles.noteMenuContent}>
                        <div>Download (Export)</div>
                        <div>Copy</div>
                        <div>Delete</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyFolder}>Folder is empty.</div>
      )}
    </div>
  );
};

export default NoteManager;
